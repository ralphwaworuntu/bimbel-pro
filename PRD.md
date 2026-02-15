Peranmu:
Bertindaklah sebagai senior full‑stack software architect dan developer yang berpengalaman membuat:

PWA (Progressive Web App)
Sistem multi‑tenant / white‑label
Portal pemesanan produk digital + payment gateway
Admin panel dan dashboard analytics


🎯 Goal
Bantu saya merancang dan kemudian membangun sebuah PWA yang berfungsi sebagai:

Portfolio & katalog produk: menampilkan contoh dan penjelasan produk website bimbel yang sudah saya buat.
Platform pemesanan website bimbel: tempat para pengusaha bimbel bisa melakukan order website bimbel white‑label yang saya sediakan, dari pengisian data sampai pembayaran.
Admin panel untuk saya (owner): mengelola semua order, status pengerjaan, status aktif/tidaknya website klien, monitoring trafik, dan detail pembayaran.

Output awal yang saya harapkan dari kamu:

Desain arsitektur sistem yang lengkap
Skema database & model data
Desain alur user (user flow) untuk pebisnis bimbel dan untuk admin
Desain API & modul utama
Rencana implementasi PWA & multi‑tenant white‑label
Setelah itu, barulah bantu saya generate kode step-by-step.


🧩 Context (Latar Belakang Bisnis)

Saya sudah punya website bimbel TNI dan POLRI yang fiturnya sangat lengkap.
Website ini akan saya jadikan produk white‑label untuk dijual ke para pengusaha bimbel lain.
Para pebisnis bimbel cukup memesan melalui PWA ini, lalu mereka akan mendapatkan website bimbel mereka sendiri dengan template dan fitur yang sudah saya bangun sebelumnya, namun bisa dibedakan brand/identity‑nya.

Pengguna utama PWA:


Pebisnis bimbel (klien)

Ingin melihat portfolio dan contoh website bimbel yang sudah saya buat
Ingin memesan website bimbel dengan skema yang jelas dan mudah
Lebih fokus pada hasil & kemudahan, bukan detail teknis



Saya sebagai owner / admin platform

Ingin melihat semua order website yang masuk, lengkap dengan datanya
Ingin mengatur status pengerjaan dan status aktif/tidaknya website mereka
Ingin memonitor performa (trafik) website‑website klien
Ingin punya akses langsung ke admin panel tiap website klien
Ingin melihat dan mengelola data pembayaran (via payment gateway)




🔧 Fitur Utama yang Harus Ada
1. Fitur untuk Pebisnis Bimbel (Front PWA)
a. Portfolio & katalog produk

Halaman untuk menampilkan:

Contoh website bimbel yang sudah saya buat (screenshot, demo link, video demo kalau bisa)
Daftar fitur utama (tryout online, bank soal, manajemen siswa, dsb.)
Paket harga / skema layanan (misal: Basic, Pro, Premium)


Penjelasan value proposition: cepat jadi, sudah terbukti, fokus bimbel TNI/POLRI, dsb.

b. Alur pemesanan website bimbel
Pengusaha bimbel bisa:

Memilih paket / jenis website bimbel
Menentukan nama untuk website bimbel mereka (misalnya “Bimbel Garuda Jaya”)
Memilih domain yang mereka inginkan:

Form untuk input domain yang diinginkan
(Opsional) Cek ketersediaan domain jika memungkinkan / gunakan placeholder dulu


Mengisi detail pemilik bisnis bimbel, misalnya:

Nama pemilik
Nama brand bimbel
Alamat
Kontak (WhatsApp, email, dll.)
Preferensi subdomain jika pakai subdomain saya


Memilih metode pembayaran:

Pembayaran penuh (full payment)
Sistem down payment (DP) + pelunasan


Checkout & pembayaran menggunakan payment gateway API

Integrasi dengan payment gateway lokal (gunakan abstraksi generic, jangan sebut merk kalau tidak perlu)
Menyimpan detail transaksi, status pembayaran, dan tipe pembayaran (full/DP)



c. Status & konfirmasi order untuk klien

Setelah order, klien bisa melihat:

Status: “Baru Order / Dalam Pengerjaan / Siap Digunakan / Nonaktif”
Informasi estimasi proses (bisa statis dulu)
Detail paket & pembayaran


Kirim notifikasi (email / WhatsApp placeholder) ketika:

Order berhasil dibuat
Pembayaran terkonfirmasi
Website sudah aktif




2. Admin Panel untuk Saya (Owner)
Di halaman admin, saya ingin:


Melihat daftar semua pemesan website bimbel, termasuk:

Data pemilik & bisnis bimbel
Paket yang diambil
Domain yang diminta
Status order & status pembayaran
Waktu order dan update terakhir



Mengubah status website klien, misalnya:

Baru Selesai Order
Dalam Proses Pengerjaan
Sudah Ready / Aktif
Nonaktif



Mengendalikan website mereka aktif/tidak dari admin panel saya:

Tombol atau kontrol untuk mengaktifkan / menonaktifkan website klien
Logika di backend sehingga website klien yang nonaktif tidak bisa diakses publik (atau menampilkan halaman khusus)



Melihat traffic / performa website klien:

Minimal: jumlah kunjungan / page view per website
Bisa menggunakan integrasi dengan tools analytics (boleh pakai pendekatan generic / abstraksi)
Tampilkan ringkasan di dashboard



Punya akses langsung ke admin panel masing‑masing website klien:

Desain skema autentikasi / single sign‑on (SSO) sederhana atau mekanisme secure lainnya yang memungkinkan saya sebagai super admin bisa masuk ke admin panel mereka
Jelaskan pendekatan keamanan yang aman namun praktis



Melihat detail pembayaran & integrasi payment gateway:

Rekam semua transaksi (full payment dan DP)
Status pembayaran (pending, sukses, gagal)
Metode bayar (VA, e-wallet, dsb. – cukup generik)
Data ini tampil di dashboard admin



Dashboard ringkasan keseluruhan, misalnya:

Total klien bimbel
Jumlah website aktif/nonaktif
Jumlah order baru minggu ini/bulan ini
Total pendapatan (atau ringkasan)
Traffic total per hari/bulan (jika memungkinkan)




3. Otomatisasi White‑Label & Multi‑Tenant
Saya sudah punya template website bimbel yang siap pakai. Saya ingin:


Setiap kali ada order baru yang “disetujui/diaktifkan”, sistem bisa:

Menghasilkan instance website baru berdasarkan template tersebut
Mengaitkannya dengan domain/subdomain yang dipilih klien
Mengatur konfigurasi awal (nama bimbel, logo, kontak, dsb.)



Arsitektur yang mendukung:

Multi-tenant / white-label: banyak website klien berjalan di atas satu platform / codebase
Pemisahan data tiap klien (tenant) dengan aman
Kemudahan scaling ke banyak klien bimbel



Tolong jelaskan beberapa opsi pendekatan arsitektur (misalnya: single codebase multi-tenant, subdomain per tenant, dsb.) beserta kelebihan/kekurangannya, lalu rekomendasikan yang paling cocok untuk kasus saya.

📱 Persyaratan PWA
Pastikan PWA ini:

Responsif (mobile-first), nyaman dipakai di HP
Bisa di‑install sebagai “aplikasi” di perangkat (menggunakan manifest & service worker)
Memiliki basic offline support untuk halaman-halaman statis utama (opsional tapi ideal)
Performa baik dan ringan

Jelaskan bagaimana kamu akan mengimplementasikan fitur PWA ini (manifest, service worker, caching strategy, dsb.).

🧱 Ekspektasi Output dari Kamu (AI Agent)


Langkah 1 – Klarifikasi

Jika ada hal yang kurang jelas dari kebutuhan di atas, ajukan list pertanyaan klarifikasi dulu (maksimal 10 poin) sebelum langsung mendesain atau coding.



Langkah 2 – Desain Sistem

Deskripsikan arsitektur sistem tingkat tinggi (frontend PWA, backend API, database, integrasi payment gateway, modul multi-tenant, dsb.)
Buat diagram arsitektur dalam bentuk teks (misalnya: bullet/diagram ASCII)
Rancang skema database / model data untuk entitas utama:

User / Admin
Pebisnis Bimbel
WebsiteInstance / Tenant
Order
Payment / Transaction
Domain / Subdomain
Traffic / Analytics (minimal struktur log)





Langkah 3 – Desain Alur & API

Buat user flow untuk:

Pebisnis bimbel dari “lihat portfolio → pilih paket → order → bayar → lihat status”
Admin dari “lihat order → ubah status → aktifkan/nonaktifkan website → akses admin klien → lihat dashboard”


Rancang daftar endpoint API utama (nama endpoint, method, deskripsi singkat, parameter penting).



Langkah 4 – Rencana Teknologi & Implementasi

Rekomendasikan stack teknologi modern yang cocok untuk:

Frontend PWA
Backend (REST/GraphQL API)
Database
Integrasi payment gateway


Berikan alasan singkat untuk pilihanmu.



Langkah 5 – Kode Awal (opsional setelah desain)

Setelah desain disetujui, bantu saya dengan:

Boilerplate/project structure
Contoh implementasi beberapa modul kunci (misalnya: model Order, endpoint create order, integrasi payment gateway dummy, struktur multi-tenant sederhana, manifest & service worker dasar).





Gunakan bahasa campuran Indonesia + istilah teknis bahasa Inggris yang wajar, dan jelaskan hal‑hal kompleks dengan jelas tapi tidak terlalu panjang per poin.