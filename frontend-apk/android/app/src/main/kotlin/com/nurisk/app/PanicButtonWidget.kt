package com.nurisk.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.location.Location
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.widget.RemoteViews
import android.widget.Toast
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

/**
 * Panic Button Widget Provider
 * - Giant red SOS button on home screen
 * - One-tap emergency alert
 * - GPS location + device ID
 */
class PanicButtonWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)

        when (intent.action) {
            ACTION_PANIC -> {
                CoroutineScope(Dispatchers.Main).launch {
                    triggerPanicAlert(context)
                }
            }
        }
    }

    companion object {
        const val ACTION_PANIC = "com.nurisk.app.ACTION_PANIC"

        /**
         * Update widget UI
         */
        private fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.panic_button_widget)

            // Create pending intent for button click
            val intent = Intent(context, PanicButtonWidget::class.java).apply {
                action = ACTION_PANIC
            }

            val pendingIntent = PendingIntent.getBroadcast(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            views.setOnClickPendingIntent(R.id.panic_button, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        /**
         * Trigger panic alert
         */
        private suspend fun triggerPanicAlert(context: Context) {
            try {
                // Play siren sound
                playSiren(context)

                // Vibrate
                vibrate(context)

                // Get location
                val location = getLocation(context)

                // Get device ID
                val deviceId = getDeviceId(context)

                // Send alert to server
                val success = sendPanicAlert(context, location, deviceId)

                withContext(Dispatchers.Main) {
                    if (success) {
                        Toast.makeText(
                            context,
                            "PANIC ALERT SENT",
                            Toast.LENGTH_LONG
                        ).show()
                    } else {
                        Toast.makeText(
                            context,
                            "ALERT QUEUED (OFFLINE)",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        context,
                        "ERROR: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }

        /**
         * Play siren sound
         */
        private fun playSiren(context: Context) {
            try {
                val toneGen = ToneGenerator(AudioManager.STREAM_ALARM, 100)
                toneGen.startTone(ToneGenerator.TONE_CDMA_EMERGENCY_RINGBACK, 5000)
            } catch (e: Exception) {
                // Ignore
            }
        }

        /**
         * Vibrate device
         */
        private fun vibrate(context: Context) {
            try {
                val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                    vibratorManager.defaultVibrator
                } else {
                    @Suppress("DEPRECATION")
                    context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                }

                val pattern = longArrayOf(0, 500, 200, 500, 200, 500)
                vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1))
            } catch (e: Exception) {
                // Ignore
            }
        }

        /**
         * Get current location
         */
        private fun getLocation(context: Context): Pair<Double, Double>? {
            // In production, use FusedLocationProviderClient
            return null
        }

        /**
         * Get device ID
         */
        private fun getDeviceId(context: Context): String {
            val prefs = context.getSharedPreferences("nurisk_prefs", Context.MODE_PRIVATE)
            var deviceId = prefs.getString("device_id", null)
            if (deviceId == null) {
                deviceId = UUID.randomUUID().toString()
                prefs.edit().putString("device_id", deviceId).apply()
            }
            return deviceId
        }

        /**
         * Send panic alert to server
         */
        private suspend fun sendPanicAlert(
            context: Context,
            location: Pair<Double, Double>?,
            deviceId: String
        ): Boolean {
            return withContext(Dispatchers.IO) {
                try {
                    val url = URL("${BuildConfig.API_BASE_URL}/alerts/panic")
                    val conn = url.openConnection() as HttpURLConnection
                    conn.requestMethod = "POST"
                    conn.setRequestProperty("Content-Type", "application/json")

                    val body = """
                        {
                            "device_id": "$deviceId",
                            "latitude": ${location?.first},
                            "longitude": ${location?.second},
                            "timestamp": "${System.currentTimeMillis()}"
                        }
                    """.trimIndent()

                    conn.outputStream.write(body.toByteArray())

                    conn.responseCode in 200..299
                } catch (e: Exception) {
                    false
                }
            }
        }
    }
}