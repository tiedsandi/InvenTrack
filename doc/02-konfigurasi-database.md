# 02 — Konfigurasi Database (.env)

Setelah project Laravel dibuat, langkah berikutnya adalah menghubungkan aplikasi ke database.

---

## File `.env`

Laravel menyimpan konfigurasi environment di file `.env` yang ada di root project. File ini **tidak di-commit ke Git** karena berisi data sensitif (password, API key, dll).

---

## Konfigurasi PostgreSQL (yang kita pakai)

Buka file `.env`, cari bagian `DB_*` lalu ubah:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=asietex_db
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

| Key             | Keterangan                                           |
| --------------- | ---------------------------------------------------- |
| `DB_CONNECTION` | Jenis database: `pgsql`, `mysql`, `sqlite`, `sqlsrv` |
| `DB_HOST`       | Alamat server database (localhost = `127.0.0.1`)     |
| `DB_PORT`       | Port PostgreSQL default = `5432`, MySQL = `3306`     |
| `DB_DATABASE`   | Nama database yang akan digunakan                    |
| `DB_USERNAME`   | Username database                                    |
| `DB_PASSWORD`   | Password database                                    |

---

## Konfigurasi MySQL (alternatif)

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=asietex_db
DB_USERNAME=root
DB_PASSWORD=
```

---

## Tes Koneksi

Jalankan perintah berikut untuk memastikan koneksi berhasil:

```bash
php artisan db:show
```

Jika database belum ada, Laravel 12 akan **otomatis menawarkan untuk membuat database** saat pertama kali menjalankan `php artisan migrate`.

---

## Catatan Penting

- Jangan hapus file `.env.example` — file ini digunakan sebagai template untuk developer lain.
- Setelah clone project dari Git, selalu buat `.env` dari template:
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```
