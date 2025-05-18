import Foundation
import Capacitor

@available(iOS 15.0, *)
@objc(StreamingHttpPlugin)
public class StreamingHttpPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StreamingHttpPlugin"
    public let jsName = "StreamingHttp"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "request", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "close", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "removeAllListeners", returnType: CAPPluginReturnPromise)
    ]
    
    private let implementation = StreamingHttp()
    
    @objc func request(_ call: CAPPluginCall) {
        implementation.request(call, notifier: self)
    }
    
    @objc func close(_ call: CAPPluginCall) {
        implementation.close(call)
    }
    
    @objc override public func removeAllListeners(_ call: CAPPluginCall) {
        implementation.removeAllListeners()
        super.removeAllListeners(call)
        call.resolve()
    }
}