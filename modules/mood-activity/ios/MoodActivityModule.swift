import ExpoModulesCore
import ActivityKit

public class MoodActivityModule: Module {
    private var currentActivityID: String?

    public func definition() -> ModuleDefinition {
        Name("MoodActivity")

        AsyncFunction("showMoodActivity") { (emoji: String, partnerEmoji: String, partnerName: String, promise: Promise) in
            guard #available(iOS 16.1, *) else { promise.resolve(nil); return }

            Task {
                // End any existing activity
                if let id = self.currentActivityID {
                    let activities = Activity<MoodActivityAttributes>.activities
                    if let existing = activities.first(where: { $0.id == id }) {
                        await existing.end(ActivityContent(state: MoodActivityAttributes.ContentState(myEmoji: emoji, partnerEmoji: partnerEmoji, partnerName: partnerName), staleDate: nil), dismissalPolicy: .immediate)
                    }
                    self.currentActivityID = nil
                }

                let state = MoodActivityAttributes.ContentState(myEmoji: emoji, partnerEmoji: partnerEmoji, partnerName: partnerName)
                let content = ActivityContent(state: state, staleDate: Calendar.current.date(byAdding: .hour, value: 8, to: Date()))

                do {
                    let activity = try Activity<MoodActivityAttributes>.request(
                        attributes: MoodActivityAttributes(),
                        content: content,
                        pushType: nil
                    )
                    self.currentActivityID = activity.id
                    promise.resolve(nil)
                } catch {
                    promise.reject("LIVE_ACTIVITY_ERROR", error.localizedDescription)
                }
            }
        }

        AsyncFunction("updateMoodActivity") { (emoji: String, partnerEmoji: String, promise: Promise) in
            guard #available(iOS 16.1, *) else { promise.resolve(nil); return }

            Task {
                guard let id = self.currentActivityID,
                      let activity = Activity<MoodActivityAttributes>.activities.first(where: { $0.id == id }) else {
                    promise.resolve(nil)
                    return
                }
                let newState = MoodActivityAttributes.ContentState(myEmoji: emoji, partnerEmoji: partnerEmoji, partnerName: activity.content.state.partnerName)
                await activity.update(ActivityContent(state: newState, staleDate: nil))
                promise.resolve(nil)
            }
        }

        AsyncFunction("clearMoodActivity") { (promise: Promise) in
            guard #available(iOS 16.1, *) else { promise.resolve(nil); return }

            Task {
                for activity in Activity<MoodActivityAttributes>.activities {
                    await activity.end(nil, dismissalPolicy: .immediate)
                }
                self.currentActivityID = nil
                promise.resolve(nil)
            }
        }
    }
}
