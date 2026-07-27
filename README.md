# Website Portofolio Pribadi

Selamat datang di repositori website portofolio saya. Proyek ini dibuat untuk menampilkan profil, keahlian, proyek yang pernah dikerjakan, dan informasi kontak saya. Website ini dibangun dengan desain yang bersih, modern, dan sepenuhnya responsif.

## 🚀 Teknologi yang Digunakan

Halaman CV (Profil, CV Lengkap, Portofolio, Kontak) memakai sistem desain sendiri
tanpa kerangka kerja apa pun:

-   **HTML5**: Untuk struktur konten website.
-   **CSS3**: `assets/css/cv2026.css` — seluruh tampilan (tema terang & gelap, tata letak
    responsif, dan gaya cetak untuk PDF) ada di satu file ini.
-   **JavaScript**: `assets/js/cv2026.js` — menu mobile, tombol Bagikan, tombol Unduh CV
    (memanggil dialog cetak browser), dan animasi saat konten masuk layar. Tanpa dependensi.
-   **[Font Awesome](https://fontawesome.com/)**: Ikon.

> Berkas lama dari template *Live Resume* (`assets/css/live-resume.css`, `assets/css/cv-pro.css`,
> `assets/js/live-resume.js`, `assets/js/cv-pro.js`, Bootstrap/jQuery di `assets/vendors/`) masih
> ada karena dipakai `pages/blog.html` yang belum ikut didesain ulang. Aman dihapus bila `pages/blog.html`
> tidak dipakai.

## 🛠️ Instalasi dan Penggunaan

Karena ini adalah proyek web statis, Anda tidak memerlukan instalasi khusus atau server web untuk menjalankannya. Cukup ikuti langkah-langkah berikut:

1.  **Clone repositori ini ke komputer Anda:**
    ```bash
    git clone https://github.com/username/Cv_Portofolio.git
    ```
    *(Jangan lupa ganti `username/Cv_Portofolio.git` dengan URL repositori Anda)*

2.  **Buka file `index.html`:**
    Navigasi ke direktori proyek yang sudah di-clone, lalu buka file `index.html` di browser favorit Anda (misalnya, Google Chrome, Firefox, atau Safari).

## 📂 Struktur File

Struktur direktori proyek ini diatur sebagai berikut untuk kemudahan pemeliharaan:

```
Cv_Portofolio/
├── index.html                # Halaman utama portofolio
├── pages/                    # Halaman tambahan (CV, portofolio, kontak, blog)
├── assets/
│   ├── css/                  # File CSS kustom
│   ├── images/               # Gambar dan aset visual
│   ├── js/                   # File JavaScript kustom
│   └── vendors/              # Pustaka pihak ketiga (Bootstrap, jQuery, dll.)
└── README.md                 # File yang sedang Anda baca
```

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT.
