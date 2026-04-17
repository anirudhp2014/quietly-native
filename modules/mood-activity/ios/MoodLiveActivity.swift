import ActivityKit
import Foundation

@available(iOS 16.1, *)
public struct MoodActivityAttributes: ActivityAttributes {
    public typealias MoodStatus = ContentState

    public struct ContentState: Codable, Hashable {
        public var myEmoji: String
        public var partnerEmoji: String
        public var partnerName: String

        public init(myEmoji: String, partnerEmoji: String, partnerName: String) {
            self.myEmoji = myEmoji
            self.partnerEmoji = partnerEmoji
            self.partnerName = partnerName
        }
    }

    public init() {}
}
