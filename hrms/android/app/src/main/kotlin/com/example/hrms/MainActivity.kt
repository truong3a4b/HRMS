package com.example.hrms

import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.database.Cursor
import android.net.Uri
import android.os.Environment
import android.provider.OpenableColumns
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val channelName = "hrms/file_actions"
    private val pickCvRequestCode = 7411
    private var pendingPickResult: MethodChannel.Result? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            channelName
        ).setMethodCallHandler { call, result ->
            when (call.method) {
                "pickCvFile" -> pickCvFile(result)
                "openUrl" -> {
                    val url = call.argument<String>("url")
                    if (url.isNullOrBlank()) {
                        result.error("INVALID_URL", "Missing url", null)
                    } else {
                        openUrl(url)
                        result.success(null)
                    }
                }
                "downloadUrl" -> {
                    val url = call.argument<String>("url")
                    val fileName = call.argument<String>("fileName")
                    if (url.isNullOrBlank() || fileName.isNullOrBlank()) {
                        result.error("INVALID_DOWNLOAD", "Missing url or fileName", null)
                    } else {
                        downloadUrl(url, fileName)
                        result.success(null)
                    }
                }
                else -> result.notImplemented()
            }
        }
    }

    private fun pickCvFile(result: MethodChannel.Result) {
        if (pendingPickResult != null) {
            result.error("PICK_IN_PROGRESS", "A file picker is already open", null)
            return
        }

        pendingPickResult = result
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
            putExtra(
                Intent.EXTRA_MIME_TYPES,
                arrayOf(
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                )
            )
        }
        startActivityForResult(intent, pickCvRequestCode)
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode != pickCvRequestCode) return

        val result = pendingPickResult
        pendingPickResult = null

        if (result == null) return
        val uri = data?.data
        if (resultCode != RESULT_OK || uri == null) {
            result.success(null)
            return
        }

        try {
            val fileName = queryFileName(uri) ?: "cv"
            val bytes = contentResolver.openInputStream(uri)?.use { it.readBytes() }
            if (bytes == null) {
                result.error("READ_FILE_FAILED", "Cannot read selected file", null)
                return
            }

            result.success(
                hashMapOf(
                    "name" to fileName,
                    "bytes" to bytes
                )
            )
        } catch (e: Exception) {
            result.error("READ_FILE_FAILED", e.message, null)
        }
    }

    private fun queryFileName(uri: Uri): String? {
        var cursor: Cursor? = null
        return try {
            cursor = contentResolver.query(uri, null, null, null, null)
            val nameIndex = cursor?.getColumnIndex(OpenableColumns.DISPLAY_NAME) ?: -1
            if (cursor != null && cursor.moveToFirst() && nameIndex >= 0) {
                cursor.getString(nameIndex)
            } else {
                uri.lastPathSegment
            }
        } finally {
            cursor?.close()
        }
    }

    private fun openUrl(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
            addCategory(Intent.CATEGORY_BROWSABLE)
        }
        startActivity(intent)
    }

    private fun downloadUrl(url: String, fileName: String) {
        val request = DownloadManager.Request(Uri.parse(url)).apply {
            setTitle(fileName)
            setDescription("Downloading CV")
            setNotificationVisibility(
                DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED
            )
            setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName)
        }

        val manager = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        manager.enqueue(request)
    }
}
