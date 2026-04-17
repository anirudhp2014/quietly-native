import ActivityKit
import WidgetKit
import SwiftUI

@available(iOS 16.1, *)
struct MoodActivityWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: MoodActivityAttributes.self) { context in
            // Lock Screen / Notification banner
            HStack(spacing: 16) {
                Text(context.state.myEmoji)
                    .font(.system(size: 44))
                VStack(alignment: .leading, spacing: 2) {
                    Text("Your mood")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("quietly")
                        .font(.headline)
                        .fontWeight(.semibold)
                }
                Spacer()
                if !context.state.partnerEmoji.isEmpty {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(context.state.partnerName)
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(context.state.partnerEmoji)
                            .font(.system(size: 28))
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .activityBackgroundTint(.black.opacity(0.08))

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded
                DynamicIslandExpandedRegion(.center) {
                    HStack(spacing: 24) {
                        VStack(spacing: 4) {
                            Text(context.state.myEmoji)
                                .font(.system(size: 36))
                            Text("You")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                        if !context.state.partnerEmoji.isEmpty {
                            Text("↔")
                                .font(.title3)
                                .foregroundColor(.secondary)
                            VStack(spacing: 4) {
                                Text(context.state.partnerEmoji)
                                    .font(.system(size: 36))
                                Text(context.state.partnerName)
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                                    .lineLimit(1)
                            }
                        }
                    }
                }
            } compactLeading: {
                Text(context.state.myEmoji)
                    .font(.system(size: 16))
            } compactTrailing: {
                if !context.state.partnerEmoji.isEmpty {
                    Text(context.state.partnerEmoji)
                        .font(.system(size: 16))
                }
            } minimal: {
                Text(context.state.myEmoji)
                    .font(.system(size: 14))
            }
        }
    }
}

@main
struct MoodActivityWidgetBundle: WidgetBundle {
    @available(iOS 16.1, *)
    var body: some Widget {
        MoodActivityWidgetLiveActivity()
    }
}
