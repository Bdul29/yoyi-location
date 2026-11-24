package com.agent.content

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class GeminiClient {
    private val http = OkHttpClient.Builder()
        .callTimeout(120, TimeUnit.SECONDS)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(120, TimeUnit.SECONDS)
        .build()

    suspend fun respond(apiKey: String, model: String, prompt: String): String =
        withContext(Dispatchers.IO) {
            require(apiKey.isNotBlank()) { "Gemini API key belum diisi." }
            require(model.matches(Regex("[A-Za-z0-9._-]+"))) { "Nama model tidak valid." }

            val parts = JSONArray().put(JSONObject().put("text", prompt))
            val contents = JSONArray().put(JSONObject().put("parts", parts))
            val payload = JSONObject()
                .put("contents", contents)
                .put("generationConfig", JSONObject()
                    .put("temperature", 0.7)
                    .put("maxOutputTokens", 8192))

            val request = Request.Builder()
                .url("https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent")
                .header("x-goog-api-key", apiKey)
                .header("Content-Type", "application/json")
                .post(payload.toString().toRequestBody("application/json".toMediaType()))
                .build()

            http.newCall(request).execute().use { response ->
                val body = response.body?.string().orEmpty()
                if (!response.isSuccessful) {
                    val message = try {
                        JSONObject(body).optJSONObject("error")?.optString("message")
                    } catch (_: Exception) { null }
                    val hint = when (response.code) {
                        400 -> "Periksa isi permintaan atau nama model. "
                        401, 403 -> "Periksa API key dan akses Gemini API. "
                        404 -> "Model tidak tersedia untuk API key ini. "
                        429 -> "Batas gratis atau rate limit Gemini tercapai. Coba lagi nanti. "
                        else -> ""
                    }
                    throw IllegalStateException("Gemini HTTP \${response.code}: $hint\${message ?: body.take(500)}")
                }
                parseOutputText(body)
            }
        }

    private fun parseOutputText(raw: String): String {
        val root = JSONObject(raw)
        val candidates = root.optJSONArray("candidates")
            ?: throw IllegalStateException("Gemini tidak mengembalikan kandidat teks.")
        val candidate = candidates.optJSONObject(0)
            ?: throw IllegalStateException("Gemini tidak mengembalikan teks. Coba ulangi.")
        val parts = candidate.optJSONObject("content")?.optJSONArray("parts")
            ?: throw IllegalStateException("Respons Gemini tidak berisi teks.")
        val chunks = mutableListOf<String>()
        for (i in 0 until parts.length()) {
            val text = parts.optJSONObject(i)?.optString("text").orEmpty()
            if (text.isNotBlank()) chunks += text
        }
        return chunks.joinToString("\n\n").ifBlank { "Gemini tidak mengembalikan teks." }
    }
}
