package expo.modules.moodactivity

import android.content.Context
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

class MoodActivityModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MoodActivity")

    AsyncFunction("showMoodActivity") { emoji: String, partnerEmoji: String, partnerName: String, promise: Promise ->
      val context = appContext.reactContext ?: run { promise.reject("ERR", "No context", null); return@AsyncFunction }
      val intent = MoodForegroundService.buildIntent(context, MoodForegroundService.ACTION_SHOW, emoji, partnerEmoji, partnerName)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
      promise.resolve(null)
    }

    AsyncFunction("updateMoodActivity") { emoji: String, partnerEmoji: String, promise: Promise ->
      val context = appContext.reactContext ?: run { promise.resolve(null); return@AsyncFunction }
      val intent = MoodForegroundService.buildIntent(context, MoodForegroundService.ACTION_SHOW, emoji, partnerEmoji)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
      promise.resolve(null)
    }

    AsyncFunction("clearMoodActivity") { promise: Promise ->
      val context = appContext.reactContext ?: run { promise.resolve(null); return@AsyncFunction }
      val intent = MoodForegroundService.buildIntent(context, MoodForegroundService.ACTION_CLEAR)
      context.startService(intent)
      promise.resolve(null)
    }
  }
}
