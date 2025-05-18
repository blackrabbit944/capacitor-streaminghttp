import Foundation
import Capacitor

@available(iOS 15.0, *)
@objc public class StreamingHttp: NSObject {
    private var activeTasks: [String: Task<Void, Error>] = [:]
    
    @objc public func request(_ call: CAPPluginCall, notifier: CAPPlugin) {
        NSLog("🔵 StreamingHttp: Starting request")
        
        guard let urlString = call.getString("url") else {
            NSLog("🔴 StreamingHttp: URL is missing")
            call.reject("URL is required")
            return
        }
        
        guard let hashId = call.getString("hash_id") else {
            NSLog("🔴 StreamingHttp: hash_id is missing")
            call.reject("hash_id is required")
            return
        }
        
        if let existingTask = activeTasks[hashId] {
            existingTask.cancel()
            activeTasks.removeValue(forKey: hashId)
        }
        
        guard let url = URL(string: urlString) else {
            NSLog("🔴 StreamingHttp: Invalid URL format")
            call.reject("Invalid URL")
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = call.getString("method", "GET")
        
        if let headers = call.getObject("headers") as? [String: String] {
            NSLog("🔵 StreamingHttp: Headers: \(headers)")
            for (key, value) in headers {
                request.setValue(value, forHTTPHeaderField: key)
            }
        }
        
        if let data = call.getObject("data"),
           request.httpMethod?.uppercased() != "GET" {
            do {
                let jsonData = try JSONSerialization.data(withJSONObject: data)
                request.httpBody = jsonData
                NSLog("🔵 StreamingHttp: Request body: \(String(data: jsonData, encoding: .utf8) ?? "none")")
            } catch {
                NSLog("🔴 StreamingHttp: Invalid request data: \(error)")
                call.reject("Invalid request data")
                return
            }
        }
        
        printCurlCommand(request)
        
        let task = Task<Void, Error> {
            do {
                NSLog("🔵 StreamingHttp: Starting async request for hash_id: \(hashId)")
                
                // 添加onOpen事件通知 - 在请求开始时发送
                notifier.notifyListeners("onOpen", data: [
                    "hash_id": hashId
                ])
                
                let (bytes, response) = try await URLSession.shared.bytes(for: request)
                
                if let httpResponse = response as? HTTPURLResponse {
                    NSLog("🔵 StreamingHttp: Response status: \(httpResponse.statusCode)")
                }
                
                for try await line in bytes.lines {
                    NSLog("🔵 StreamingHttp: Received line: \(line)")
                    
                    if line.hasPrefix("data: ") {
                        let data = String(line.dropFirst(6))
                        NSLog("🔵 StreamingHttp: Found SSE data: \(data)")
                        
                        if data == "[DONE]" {
                            NSLog("🔵 StreamingHttp: Received [DONE] signal for hash_id: \(hashId)")
                            notifier.notifyListeners("onComplete", data: [
                                "data": data,
                                "hash_id": hashId
                            ])
                            continue
                        }else {
                            notifier.notifyListeners("onMessage", data: [
                                "data": data,
                                "hash_id": hashId
                            ])
                        }
                    }
                }
                
                // NSLog("🔵 StreamingHttp: Stream completed for hash_id: \(hashId)")
                // notifier.notifyListeners("onComplete", data: [
                //     "data": "",
                //     "hash_id": hashId
                // ])
                
                // 添加onClose事件通知 - 在流正常结束时发送
                notifier.notifyListeners("onClose", data: [
                    "hash_id": hashId
                ])
                
                activeTasks.removeValue(forKey: hashId)
                call.resolve()
                
            } catch {
                let nsError = error as NSError
                if nsError.code == NSURLErrorCancelled {
                    NSLog("🟡 StreamingHttp: Request cancelled for hash_id: \(hashId)")
                    
                    // 添加onClose事件通知 - 在连接被取消时也发送
                    notifier.notifyListeners("onClose", data: [
                        "hash_id": hashId
                    ])
                    
                    activeTasks.removeValue(forKey: hashId)
                    return
                }
                
                // 添加onClose事件通知 - 在错误发生后也发送
                notifier.notifyListeners("onClose", data: [
                    "hash_id": hashId
                ])

                NSLog("🔴 StreamingHttp: Stream error for hash_id: \(hashId): \(error)")
                notifier.notifyListeners("onError", data: [
                    "message": nsError.localizedDescription,
                    "hash_id": hashId
                ])
                
                activeTasks.removeValue(forKey: hashId)
                call.reject(nsError.localizedDescription)
            }
        }
        
        activeTasks[hashId] = task
    }
    
    @objc public func close(_ call: CAPPluginCall) {
        if let hashId = call.getString("hash_id") {
            NSLog("🔵 StreamingHttp: Closing connection for hash_id: \(hashId)")
            if let task = activeTasks[hashId] {
                task.cancel()
                activeTasks.removeValue(forKey: hashId)
            }
        } else {
            NSLog("🔵 StreamingHttp: Closing all connections")
            NSLog("🔵 StreamingHttp: Stack trace: \(Thread.callStackSymbols)")
            activeTasks.forEach { $0.value.cancel() }
            activeTasks.removeAll()
        }
        call.resolve()
    }
    
    @objc public func removeAllListeners() {
        NSLog("🔵 StreamingHttp: Removing all listeners")
        activeTasks.forEach { $0.value.cancel() }
        activeTasks.removeAll()
    }
    
    private func printCurlCommand(_ request: URLRequest) {
        var components = ["curl -v"]
        
        if let method = request.httpMethod, method != "GET" {
            components.append("-X \(method)")
        }
        
        if let headers = request.allHTTPHeaderFields {
            for (key, value) in headers {
                components.append("-H '\(key): \(value)'")
            }
        }
        
        if let body = request.httpBody, let bodyString = String(data: body, encoding: .utf8) {
            components.append("--data-raw '\(bodyString)'")
        }
        
        if let url = request.url?.absoluteString {
            components.append("'\(url)'")
        }
        
        NSLog("🔵 StreamingHttp: CURL command:\n\(components.joined(separator: " \\\n  "))")
    }
    
    deinit {
        NSLog("🔵 StreamingHttp: Plugin deinitializing")
        activeTasks.forEach { $0.value.cancel() }
        activeTasks.removeAll()
    }
}