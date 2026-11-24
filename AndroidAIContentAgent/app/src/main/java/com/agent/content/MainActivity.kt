package com.agent.content

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    private lateinit var secrets: SecretStore
    private val gemini = GeminiClient()
    private val contentAgent = ContentAgent()
    private lateinit var status: TextView
    private lateinit var output: TextView
    private lateinit var topicInput: EditText
    private lateinit var notesInput: EditText
    private lateinit var keyInput: EditText
    private lateinit var modelInput: EditText
    private var lastOutput = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        secrets = SecretStore(this)
        buildScreen()
        refreshStatus()
    }

    private fun buildScreen() {
        val scroll = ScrollView(this)
        val content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(28, 24, 28, 32)
            layoutParams = ViewGroup.LayoutParams(-1, -2)
        }
        scroll.addView(content)

        content.addView(TextView(this).apply {
            text = "AI Content Agent"
            textSize = 28f
        })
        content.addView(TextView(this).apply {
            text = "Ide • Naskah • Storyboard • Canva"
            textSize = 14f
        })
        status = TextView(this).apply {
            textSize = 13f
            setPadding(0, 14, 0, 8)
        }
        content.addView(status)

        content.addView(section("1. Pengaturan Gemini"))
        keyInput = EditText(this).apply {
            hint = "Tempel Gemini API key"
            inputType = 129
        }
        content.addView(keyInput)
        content.addView(makeButton("Buka Google AI Studio") {
            openUrl("https://aistudio.google.com/apikey")
        })
        modelInput = EditText(this).apply {
            setText("gemini-3.6-flash")
            hint = "Model Gemini"
        }
        content.addView(modelInput)
        content.addView(makeButton("Simpan API Key di HP") { saveKey() })
        content.addView(makeButton("Hapus API Key") {
            secrets.clearApiKey()
            keyInput.text.clear()
            refreshStatus()
            toast("API key dihapus.")
        })

        content.addView(section("2. Buat konten"))
        topicInput = EditText(this).apply {
            hint = "Topik konten, contoh: 5 fakta menarik tentang AI"
            minLines = 2
            gravity = Gravity.TOP
        }
        content.addView(topicInput)

        content.addView(TextView(this).apply { text = "Platform" })
        val platforms = listOf("TikTok", "Instagram Reels", "YouTube Shorts")
        val platformSpinner = Spinner(this)
        platformSpinner.adapter = ArrayAdapter(
            this, android.R.layout.simple_spinner_dropdown_item, platforms
        )
        content.addView(platformSpinner)

        content.addView(TextView(this).apply {
            text = "Durasi target"
            setPadding(0, 10, 0, 0)
        })
        val durationSpinner = Spinner(this)
        durationSpinner.adapter = ArrayAdapter(
            this, android.R.layout.simple_spinner_dropdown_item,
            listOf("30 detik", "45 detik", "60 detik")
        )
        content.addView(durationSpinner)

        notesInput = EditText(this).apply {
            hint = "Catatan riset atau sumber (opsional)"
            minLines = 3
            gravity = Gravity.TOP
        }
        content.addView(notesInput)

        content.addView(makeButton("Buat naskah dan storyboard") {
            val topic = topicInput.text.toString().trim()
            if (topic.isBlank()) {
                toast("Isi topik konten terlebih dahulu.")
                return@makeButton
            }
            val key = secrets.getApiKey()
            if (key.isNullOrBlank()) {
                toast("Simpan Gemini API key terlebih dahulu.")
                return@makeButton
            }
            val model = modelInput.text.toString().trim().ifBlank { "gemini-3.6-flash" }
            val duration = when (durationSpinner.selectedItemPosition) {
                0 -> 30
                2 -> 60
                else -> 45
            }
            val prompt = contentAgent.makePrompt(
                topic, platforms[platformSpinner.selectedItemPosition],
                duration, notesInput.text.toString()
            )
            status.text = "Sedang membuat konten…"
            lifecycleScope.launch {
                try {
                    lastOutput = gemini.respond(key, model, prompt)
                    output.text = lastOutput
                    status.text = "Selesai. Periksa fakta sebelum dipakai."
                } catch (error: Exception) {
                    status.text = "Gagal: ${error.message ?: "Terjadi kesalahan."}"
                }
            }
        })

        content.addView(makeButton("Salin hasil") {
            if (lastOutput.isBlank()) {
                toast("Belum ada hasil.")
            } else {
                val clipboard = getSystemService(CLIPBOARD_SERVICE) as ClipboardManager
                clipboard.setPrimaryClip(ClipData.newPlainText("AI Content Agent", lastOutput))
                toast("Hasil disalin.")
            }
        })
        content.addView(makeButton("Buka Canva Free") {
            openUrl("https://www.canva.com/")
        })

        content.addView(section("3. Hasil"))
        output = TextView(this).apply {
            text = "Naskah, storyboard, caption, hashtag, dan brief Canva akan muncul di sini."
            textSize = 15f
            setTextIsSelectable(true)
            setPadding(0, 10, 0, 24)
        }
        content.addView(output)
        content.addView(TextView(this).apply {
            text = "Versi ini membuat naskah dan storyboard. Riset YouTube dan pengeditan otomatis di Canva belum tersedia."
            textSize = 12f
            setPadding(0, 18, 0, 10)
        })

        setContentView(scroll)
    }

    private fun section(value: String) = TextView(this).apply {
        text = value
        textSize = 18f
        setPadding(0, 22, 0, 8)
    }

    private fun makeButton(title: String, action: () -> Unit) =
        Button(this).apply {
            text = title
            setOnClickListener { action() }
        }

    private fun saveKey() {
        val key = keyInput.text.toString().trim()
        if (key.isBlank()) {
            toast("API key masih kosong.")
            return
        }
        try {
            secrets.saveApiKey(key)
            keyInput.text.clear()
            refreshStatus()
            toast("API key tersimpan terenkripsi di HP.")
        } catch (error: Exception) {
            toast("Tidak bisa menyimpan API key: ${error.message}")
        }
    }

    private fun refreshStatus() {
        status.text = if (secrets.getApiKey().isNullOrBlank()) {
            "Status: Gemini API key belum disimpan."
        } else {
            "Status: Gemini API key sudah tersimpan di HP."
        }
    }

    private fun openUrl(url: String) {
        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
    }

    private fun toast(message: String) =
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
}
