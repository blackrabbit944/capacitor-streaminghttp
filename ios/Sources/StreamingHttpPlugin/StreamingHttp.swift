import Foundation

@objc public class StreamingHttp: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
