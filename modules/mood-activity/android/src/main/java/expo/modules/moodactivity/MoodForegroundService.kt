package expo.modules.moodactivity

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

class MoodForegroundService : Service() {
  companion object {
    const val CHANNEL_ID = "quietly_mood_bar"
    const val NOTIFICATION_ID = 9998
    const val ACTION_SHOW = "SHOW_MOOD"
    const val ACTION_CLEAR = "CLEAR_MOOD"
    const val EXTRA_EMOJI = "emoji"
    const val EXTRA_PARTNER_EMOJI = "partner_emoji"
    const val EXTRA_PARTNER_NAME = "partner_name"

    fun buildIntent(context: Context, action: String, emoji: String = "", partnerEmoji: String = "", partnerName: String = ""): Intent {
      return Intent(context, MoodForegroundService::class.java).apply {
        this.action = action
        putExtra(EXTRA_EMOJI, emoji)
        putExtra(EXTRA_PARTNER_EMOJI, partnerEmoji)
        putExtra(EXTRA_PARTNER_NAME, partnerName)
      }
    }
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onCreate() {
    super.onCreate()
    createChannel()
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_SHOW -> {
        val emoji = intent.getStringExtra(EXTRA_EMOJI) ?: "😊"
        val partnerEmoji = intent.getStringExtra(EXTRA_PARTNER_EMOJI) ?: ""
        val partnerName = intent.getStringExtra(EXTRA_PARTNER_NAME) ?: "Partner"
        val notification = buildNotification(emoji, partnerEmoji, partnerName)
        startForeground(NOTIFICATION_ID, notification)
      }
      ACTION_CLEAR -> {
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
      }
      else -> stopSelf()
    }
    return START_NOT_STICKY
  }

  private fun createChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        CHANNEL_ID, "Mood Bar", NotificationManager.IMPORTANCE_LOW
      ).apply {
        description = "Shows your current mood in the notification bar"
        setShowBadge(false)
      }
      val manager = getSystemService(NotificationManager::class.java)
      manager.createNotificationChannel(channel)
    }
  }

  private fun buildNotification(emoji: String, partnerEmoji: String, partnerName: String): Notification {
    val title = "Current mood: $emoji"
    val body = if (partnerEmoji.isNotEmpty()) "$partnerName is feeling $partnerEmoji" else "quietly"

    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle(title)
      .setContentText(body)
      .setSmallIcon(android.R.drawable.ic_dialog_info)
      .setOngoing(true)
      .setAutoCancel(false)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
      .build()
  }
}
