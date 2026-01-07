# Website Portfolio Aplikasi Lapor.in

Website portfolio modern dan responsif untuk aplikasi Lapor.in dengan fitur download tracking, rating, dan review system.

## 🎨 Fitur Utama

- ✅ **Desain Modern & Responsif** - Tampilan menarik dengan gradient biru dan animasi
- 📱 **Mobile-First Design** - Optimal di semua perangkat
- ⬇️ **Download Tracking** - Statistik unduhan real-time dimulai dari 0
- ⭐ **Rating & Review System** - Pengguna dapat memberikan rating dan ulasan setelah login
- 🔐 **Google Authentication** - Login menggunakan akun Google
- 🔥 **Firebase Backend** - Database dan autentikasi terintegrasi
- 🎯 **Smooth Scrolling** - Navigasi halus antar section
- 💬 **Toast Notifications** - Notifikasi interaktif untuk user
- 📝 **Form Review** - Form untuk menulis review selalu ditampilkan

## 📋 Tentang Lapor.in

Lapor.in adalah aplikasi Android yang membantu masyarakat membuat laporan kepada petugas desa secara terstruktur, sekaligus memudahkan petugas desa/RT/RW dalam mengelola laporan secara cepat, transparan, dan efisien.

### Fitur Aplikasi:

- **Buat Laporan dengan Mudah** - Warga dapat membuat laporan dengan foto, kategori, lokasi, dan deskripsi
- **Pelacakan Status Laporan** - Warga dapat melihat progres: Diajukan → Diproses → Selesai
- **Prioritas Laporan Darurat** - Sistem membantu RT/RW memberi prioritas lebih tinggi pada laporan darurat
- **Notifikasi Otomatis** - Notifikasi dikirim saat status laporan berubah
- **Panel Admin** - Petugas dapat mengelola laporan, memperbarui status, dan memberi tindakan

## 🛠️ Teknologi yang Digunakan

- **HTML5** - Struktur website
- **CSS3** - Styling dengan gradients biru/indigo, animations, dan responsive design
- **Vanilla JavaScript** - Interaktivitas tanpa framework berat
- **Firebase** - Backend (Authentication & Firestore Database)
- **Font Awesome** - Icons

## 📦 Setup & Instalasi

### 1. Clone atau Download Project

```bash
cd e:\project\portfolio
```

### 2. Setup Firebase

#### a. Buat Project Firebase

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Klik "Add Project" atau "Tambah Project"
3. Beri nama project (misalnya: "lapor-in")
4. Ikuti langkah-langkah setup
5. Aktifkan Google Analytics (opsional)

#### b. Aktifkan Authentication

1. Di Firebase Console, pilih project Anda
2. Klik "Authentication" di menu sidebar
3. Klik tab "Sign-in method"
4. Aktifkan "Google" sebagai provider
5. Klik "Enable" dan "Save"

#### c. Buat Firestore Database

1. Di Firebase Console, klik "Firestore Database"
2. Klik "Create database"
3. Pilih mode "Start in test mode" (untuk development)
4. Pilih lokasi server (misalnya: asia-southeast2)
5. Klik "Enable"

#### d. Atur Security Rules

Di tab "Rules" Firestore, gunakan rules berikut:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reviews collection
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }

    // Stats collection
    match /stats/{statId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

#### e. Dapatkan Firebase Config

1. Di Firebase Console, klik ⚙️ (Settings) → Project Settings
2. Scroll ke bawah ke section "Your apps"
3. Klik icon Web (</>) untuk menambahkan web app
4. Beri nama app dan klik "Register app"
5. Copy konfigurasi Firebase

#### f. Update firebase-config.js

Buka file `firebase-config.js` dan replace dengan konfigurasi Anda:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...", // Ganti dengan API Key Anda
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX",
};
```

### 3. Jalankan Website

#### Opsi 1: Live Server (Recommended)

1. Install extension [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) di VS Code
2. Klik kanan pada `index.html`
3. Pilih "Open with Live Server"
4. Website akan terbuka di `http://localhost:5500`

#### Opsi 2: Python HTTP Server

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Buka browser dan akses `http://localhost:8000`

#### Opsi 3: Node.js HTTP Server

```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 8000
```

Buka browser dan akses `http://localhost:8000`

## 📁 Struktur File

```
portfolio/
├── index.html           # Halaman utama website
├── styles.css           # Styling lengkap
├── script.js            # JavaScript untuk interaktivitas
├── firebase-config.js   # Konfigurasi Firebase
└── README.md           # Dokumentasi ini
```

## 🎯 Fitur Detail

### 1. Download Tracking

- Setiap kali tombol download diklik, counter akan bertambah dari 0
- Data disimpan di Firestore collection `stats/downloads`
- Tampilan real-time di section statistik
- Tidak ada dummy data, dimulai dari 0

### 2. Rating & Review System

- User harus login dengan Google untuk memberikan review
- Rating menggunakan sistem bintang (1-5)
- Review disimpan di Firestore collection `reviews`
- Tampilan statistik rating dengan bar chart
- List review terbaru ditampilkan
- Form review selalu ditampilkan, tidak ada dummy review
- Rating dan statistik dimulai dari 0

### 3. Google Authentication

- Login menggunakan Firebase Authentication
- Popup window untuk login Google
- User info ditampilkan di navbar setelah login
- Logout functionality

### 4. Responsive Design

Breakpoints:

- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px

## 🚀 Deployment

### Deploy ke Firebase Hosting

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login ke Firebase:

```bash
firebase login
```

3. Initialize Firebase Hosting:

```bash
firebase init hosting
```

- Pilih project yang sudah dibuat
- Public directory: `.` (current directory)
- Single-page app: No
- Overwrite index.html: No

4. Deploy:

```bash
firebase deploy
```

Website akan live di `https://your-project-id.web.app`

### Deploy ke Netlify

1. Buat akun di [Netlify](https://netlify.com)
2. Drag & drop folder project ke Netlify
3. Website akan otomatis deploy

### Deploy ke Vercel

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy:

```bash
vercel
```

## 🎨 Kustomisasi

### Mengubah Warna

Edit file `styles.css` di bagian `:root`:

```css
:root {
  --primary: #3b82f6; /* Warna utama - Biru */
  --primary-dark: #2563eb; /* Warna gelap */
  --primary-light: #93c5fd; /* Warna terang */
}
```

### Menambahkan Screenshot Aplikasi

1. Siapkan gambar screenshot (rasio 9:16)
2. Simpan di folder `images/`
3. Edit section screenshots di `index.html`

### Mengubah Link Download

Edit `script.js` di fungsi `handleDownload()`:

```javascript
// Uncomment dan ganti dengan URL APK Anda
window.location.href = "https://example.com/path/to/your-app.apk";
```

## 🔧 Troubleshooting

### Firebase tidak terkoneksi

- Pastikan konfigurasi di `firebase-config.js` sudah benar
- Cek console browser (F12) untuk error messages
- Pastikan Firebase SDK sudah loaded dengan benar

### Review tidak tersimpan

- Pastikan Firestore sudah diaktifkan
- Cek security rules di Firestore
- Pastikan user sudah login

### Download counter tidak update

- Cek koneksi ke Firestore
- Pastikan collection `stats` sudah dibuat
- Cek security rules untuk write permission

## 📝 Lisensi

Project ini dibuat untuk Tugas Rekayasa Interaksi - Universitas Muhammadiyah Malang.

### Tim Pengembang

- M. Adriyan Maulana (202210370311005)
- M. Rafly Achiyar (202210370311032)
- Satria Kalkautsar Hasmen (202210370311016)
- Rachmad Mauluddin (202210370311043)
- Maulana Ziddan Abdillah (202210370311033)

**Mata Kuliah:** Rekayasa Interaksi  
**Tahun:** 2025/2026  
**Universitas:** Universitas Muhammadiyah Malang

## 🤝 Kontribusi

Feel free to fork project ini dan mengembangkannya lebih lanjut!

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buat issue di repository ini.

---

**Happy Coding! 🚀**
