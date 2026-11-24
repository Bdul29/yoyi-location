package com.agent.content

class ContentAgent {
    fun makePrompt(topic: String, platform: String, durationSeconds: Int, researchNotes: String): String {
        val hookEnd = maxOf(3, (durationSeconds * 0.08).toInt())
        val contextEnd = (durationSeconds * 0.30).toInt()
        val mainEnd = (durationSeconds * 0.82).toInt()

        return """
            Kamu adalah asisten riset dan penulis naskah video pendek.
            Buat paket konten dalam Bahasa Indonesia.

            TOPIK: $topic
            PLATFORM: $platform
            DURASI: $durationSeconds detik
            FORMAT: Vertikal 9:16

            CATATAN RISET PENGGUNA:
            \${researchNotes.ifBlank { "Tidak ada. Jangan mengarang sumber atau mengaku sudah memverifikasi fakta." }}

            RENCANA DURASI:
            - Hook: 0-$hookEnd detik.
            - Konteks: $hookEnd-$contextEnd detik.
            - Isi utama: $contextEnd-$mainEnd detik.
            - Penutup: $mainEnd-$durationSeconds detik.

            HASIL WAJIB:
            1. Angle konten dan target penonton.
            2. Tiga pilihan hook.
            3. Naskah voice-over lengkap dengan penanda waktu.
            4. Storyboard per scene: visual, teks layar, durasi, transisi.
            5. Caption dan 5-8 hashtag.
            6. Daftar klaim/fakta yang perlu diverifikasi.
            7. Brief desain Canva Free untuk video vertikal 9:16.
            8. Checklist persetujuan sebelum publikasi.

            Gunakan bahasa natural, tidak terasa seperti teks robot.
            Jangan mengklaim sudah menonton tautan atau memverifikasi sumber yang tidak diberikan.
            Jangan menyalin naskah kreator lain.
            Beri label jelas pada fakta yang belum terverifikasi.
        """.trimIndent()
    }
}
