# Spesifikasi Desain & Teknis: Coffee Shop Mobile POS (Kopi Senja)

Dokumen lengkap arsitektur desain, layout UI, komponen, katalog produk, dan struktur data untuk aplikasi Kasir Mobile Coffee Shop. Bebas diedit sesuai kebutuhan.

---

## 1. Identitas Brand & Design Tokens

### Palet Warna (Warm Cafe Aesthetic)
| Nama Token | Hex Code | Penggunaan |
|---|---|---|
| `--color-dark-roast` | `#2C1810` | Header, button utama, teks penting, kitchen ticket |
| `--color-caramel` | `#C67C4E` | Accent, tombol aksi (CTA), tag rekomendasi, harga terpilih |
| `--color-cream-warm` | `#EFE8E1` | Background badge, tombol sekunder, kartu aktif |
| `--color-bg-canvas` | `#F8F6F2` | Background aplikasi (off-white warm) |
| `--color-card-white` | `#FFFFFF` | Background kartu produk & container modal |
| `--color-text-main` | `#1E1B18` | Teks judul & label utama |
| `--color-text-muted` | `#8C827A` | Deskripsi, SKU, timestamp, sub-label |
| `--color-border` | `#E8DFD8` | Border divider & garis pemisah |
| `--color-success` | `#3E7B54` | Status sukses, uang kembalian, payment matched |
| `--color-whatsapp` | `#25D366` | Tombol kirim e-receipt WhatsApp |

### Tipografi
* **Font Family:** Inter / Plus Jakarta Sans / Roboto
* **H1 (Judul Layar):** 18–20px, Bold (700)
* **H2 (Nama Produk/Subheading):** 14–16px, Semi-Bold (600)
* **Body / Info:** 12–13px, Regular (400)
* **Micro / Tag:** 10–11px, Medium (500)
* **Harga & Angka Besar:** 24–30px, Extra Bold (800)

---

## 2. Struktur Layar & Komponen UI

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                ALUR UTAMA APLIKASI                                     │
├────────────────────┬────────────────────┬────────────────────┬─────────────────────────┤
│ 1. DASHBOARD       │ 2. POS ORDER       │ 3. KUSTOMISASI     │ 4. PEMBAYARAN & STRUK   │
│ (Ringkasan & Tren) │ (Mode Full Lanskap)│ (Varian & Modifier)│ (Split Bill, QRIS, Tiket│
├────────────────────┴────────────────────┴────────────────────┴─────────────────────────┤
│ 5. REKAP KAS & LAPORAN ◄──► SINKRONISASI PRINTER BLUETOOTH (Struk, Tiket Bar, Tutup Shift)│
└────────────────────────────────────────────────────────────────────────────────────────┘
          │
          └──► [Tombol: "Mulai Menjual"] ──► Auto-rotate beralih ke Mode Lanskap POS
```

---

### Layar 1: Dashboard Ringkasan & Tren (`DashboardScreen` - Portrait)
*Mode: Portrait (Tampilan Awal Kasir / Owner)*

* **Header Dashboard:**
  * Nama Toko: `Three Coffee`
  * Status Operasional: `Shift Pagi (08:00 - 15:00) • Kasir: Budi`
  * Tombol Pengaturan / Profil / Tutup Kasir
* **1. Kartu Metrik Utama (KPI Cards - 3 Kolom):**
  * **Card 1 (Jumlah Produk):**
    * Label: `Jumlah Produk`
    * Nilai: `48 SKU` (Aktif)
    * Sub: `6 Kategori Menu`
  * **Card 2 (Transaksi Hari Ini):**
    * Label: `Transaksi Hari Ini`
    * Nilai: `128 TRX`
    * Sub: `Rp 4.850.000 (Omset)`
  * **Card 3 (Produk Terjual):**
    * Label: `Produk Terjual`
    * Nilai: `312 Cup/Item`
    * Sub: `+18% vs Kemarin`
* **2. Diagram Tren Penjualan (`SalesTrendWidget`):**
  * **Tab Filter Waktu:** `[Harian]` • `[Mingguan]` • `[Bulanan]`
  * **Grafik Visual (Bar / Area Chart):**
    * *Mode Harian:* Tren jam-jam sibuk (*Peak Hours: 13.00 - 16.00*)
    * *Mode Mingguan:* Grafik perbandingan omset Senin - Minggu
    * *Mode Bulanan:* Kurva pertumbuhan transaksi per minggu dalam 1 bulan
  * **Top 3 Menu Terlaris (Mini Summary):**
    1. Kopsu Aren (84 cup)
    2. Butterscotch Latte (62 cup)
    3. Americano Normal (45 cup)
* **3. Tombol Aksi Utama (Floating / Prominent CTA):**
  * **Label Tombol:** `▶ Mulai Menjual`
  * **Ikon / Sub-info:** `Buka Terminal Kasir (Full Mode Lanskap)`
  * **Aksi Transisi:** Mengunci orientasi layar ke **Lanskap (Landscape 16:9 / Tablet/Phone POS)** dan langsung masuk ke layar kasir untuk input pesanan.

---

### Layar 2: POS - Order (`POS_OrderScreen` - Mode Lanskap)
*Mode: Full Lanskap (2 Panel: Kiri Katalog Grid, Kanan Order Cart)*
* **Header:**
  * Nama Toko: `Three Coffee`
  * Status Kasir: Nama kasir aktif & indikator shift
* **Search & Quick Action:**
  * Input pencarian: placeholder `"Cari kopi atau non-coffee..."`
  * Tombol Filter kategori & Barcode Scanner shortcut
* **Tabs Kategori Produk:**
  * `[Semua]` • `[Best Coffee]` • `[Non Coffee]`
* **Grid Katalog Produk (2 Kolom / 3 Kolom Lanskap):**
  * Thumbnail placeholder produk
  * Kode SKU / initial badge (contoh: `AMR`, `KPS`, `BSL`, `RVT`, `LMT`)
  * Tag status: `Best Seller`, `Strong Option`, `Fresh Tea`, `Favorit`
  * Nama produk & kategori
  * Harga tertera (contoh: `Rp 5.000`, `Rp 10.000`, `Rp 12.000`)
  * Tombol aksi cepat: `+` (Buka kustomisasi modifier rasa/kekuatan espresso)
* **Sticky Bottom Bar (Cart Floating):**
  * Ringkasan: `3 Pesanan Aktif • Rp 27.000`
  * Tombol Aksi: `Bayar >` (Mengarahkan ke Pembayaran)

---

### Layar 3: Kustomisasi Varian Minuman (`DrinkCustomizerScreen`)
* **Hero Info:**
  * Nama Item: `Caffe Latte`
  * Deskripsi: `Espresso blend dengan fresh milk creamy`
  * Base Price: `Rp 8.000`
* **Section 1: Pilihan Shot / Kekuatan Kopi:**
  * `[Normal (Rp 8.000)]` • `[Strong (+Rp 2.000 -> Rp 10.000)]`
* **Section 2: Temperatur Minuman:**
  * `[Iced (Dingin)]` *(Default)* • `[Hot (Panas)]`
* **Section 3: Tingkat Kemanisan (Sweetness):**
  * `[Normal (100%)]` • `[Less Sugar (50%)]` • `[No Sugar (0%)]` • `[Extra Sweet]`
* **Section 4: Catatan Barista (Text Area):**
  * Input bebas: contoh `"Banyakin es batu, gula pisah"`
* **Floating CTA:**
  * `Simpan Kustomisasi - Rp 10.000`

---

### Layar 4: Pembayaran & Split Bill (`PaymentScreen`)
* **Card Total Tagihan:**
  * Rincian: Subtotal (3 Item: Kopsu Aren + Butterscotch Latte + Lemon Tea)
  * Total Display: `Rp 27.000`
  * Tombol Fitur: `Split Bill (Bagi Tagihan per Orang / per Item)`
* **Pilihan Metode Bayar (Single Select Card):**
  1. **QRIS Dinamis:** (Integrasi GoPay, dana, ShopeePay, BCA QR)
  2. **Tunai / Cash:** Dilengkapi kalkulator kembalian otomatis
  3. **Debit / Transfer Bank:** (BCA, Mandiri, BRI)
* **Kalkulator Kasir Cepat (Khusus Tunai):**
  * Input uang diterima: default `Rp 50.000`
  * Tombol Quick Nominal: `[Uang Pas (27k)]` • `[30k]` • `[50k]` • `[100k]`
  * Box Kembalian (Highlight Hijau): `Kembalian: Rp 23.000`
* **Tombol Eksekusi:**
  * `Konfirmasi Pembayaran Selesai`

---

### Layar 5: Tiket Kitchen & Struk Pembayaran (`ReceiptTicketScreen`)
* **Badge Status:** `OK - Pembayaran Diterima (TRX #089)`
* **1. Tiket Barista (Kitchen Slip):**
  * Khusus diprint ke printer bar:
    * Waktu: `16/11/2026 00:15`
    * Item & Modifier:
      * `1x Kopsu Aren (Iced) -> Normal Sugar`
      * `1x Butterscotch Latte (Iced) -> Normal`
      * `1x Lemon Tea (Iced) -> Normal Sugar`
* **2. Struk Pelanggan (Customer Receipt):**
  * Header: Three Coffee, No. Telp 
  * Rincian:
    * `Kopsu Aren           Rp 10.000`
    * `Butterscotch Latte    Rp 12.000`
    * `Lemon Tea            Rp  5.000`
  * Total: `Rp 27.000`
  * Detail Bayar: Tunai Rp 50.000, Kembali Rp 23.000
* **Tombol Aksi Cepat:**
  * `[Cetak Barista (58mm)]`
  * `[Cetak Struk Kasir]`
  * `[Kirim WA Pelanggan]`
  * `[+ Pesanan Baru]`

---

### Layar 6: Rekap Kas & Tutup Shift (`CashManagementScreen`)
*Mode: Portrait / Modal Drawer Kasir*
* **Informasi Kasir & Shift:**
  * Kasir: `Budi (Shift Pagi)` • Dibuka: `16/11/2026 08:00` • Durasi: `6 Jam 45 Menit`
* **1. Rekapitulasi Kas Masuk (Cash Inflow):**
  * Modal Kas Awal (Opening Float): `Rp 200.000`
  * Total Penjualan Tunai: `Rp 1.450.000`
  * Pemasukan Kas Lain / Titipan Modal: `Rp 0`
  * *Ekspektasi Uang Masuk Tunai: Rp 1.650.000*
* **2. Rekapitulasi Kas Keluar (Cash Outflow / Petty Cash):**
  * Total Biaya Operasional Kas Kecil: `Rp 150.000`
  * Rincian: *Es Batu Kristal (Rp 30.000), Susu Fresh Tambahan (Rp 70.000), Galon Air (Rp 50.000)*
  * Penarikan Owner / Setor Brankas (Cash Pull): `Rp 0`
* **3. Rekap Non-Tunai (Digital Settlements - Tanpa Kartu ATM Fisik):**
  * Transfer via QRIS (GoPay, DANA, OVO, ShopeePay, m-Banking): `Rp 2.100.000` (64 Transaksi)
  * Transfer Bank (Manual via No. Rekening Toko): `Rp 1.300.000` (22 Transaksi)
  * *Total Omset Bruto Shift Ini: Rp 4.850.000 (128 Transaksi)*
* **4. Formulir Penghitungan Fisik Laci (Cash Count):**
  * Input nominal fisik di laci kasir: `Rp 1.500.000`
  * Kalkulasi Sistem:
    * `Kas Seharusnya = (Modal Awal + Penjualan Tunai + Kas Masuk) - Kas Keluar`
    * `Kas Seharusnya = (200.000 + 1.450.000 + 0) - 150.000 = Rp 1.500.000`
    * `Selisih (Variance): Rp 0 [STATUS: COCOK / BALANCED]`
* **5. Tombol Aksi Akhir:**
  * `[🖨️ Cetak Rekap Tutup Shift (Z-Report)]`
  * `[📲 Kirim Rekap WhatsApp ke Owner]`
  * `[🔒 Konfirmasi & Selesaikan Tutup Shift]`

---

## 3. Matriks Produk & Modifier (Menu Resmi Three Coffee)

### A. Kategori: Best Coffee (9 Varian)
| No | SKU | Nama Menu | Pilihan Varian / Ukuran | Harga (Rp) |
|:--:|---|---|---|:--:|
| 1 | `AMR-NRM` | **Americano** (Normal) | Regular Shot, Iced / Hot | **5.000** |
| 2 | `AMR-STR` | **Americano** (Strong) | Extra Double Shot, Iced / Hot | **8.000** |
| 3 | `CFL-NRM` | **Caffe Latte** (Normal) | Espresso + Fresh Milk Regular | **8.000** |
| 4 | `CFL-STR` | **Caffe Latte** (Strong) | Espresso Strong + Fresh Milk | **10.000** |
| 5 | `KPS-ARN` | **Kopsu Aren** | Espresso + Susu + Gula Aren Asli | **10.000** |
| 6 | `VNL-LAT` | **Vanilla Latte** | Espresso + Fresh Milk + Sirup Vanilla | **10.000** |
| 7 | `KPS-SGN` | **Kopsu Signature** | Kopi Susu Creamy Resep Rahasia | **12.000** |
| 8 | `HZL-LAT` | **Hazelnut Latte** | Espresso + Fresh Milk + Roasted Hazelnut | **12.000** |
| 9 | `BSC-LAT` | **Butterscotch Latte** | Espresso + Milk + Salted Butterscotch | **12.000** |
| 10 | `CFE-MTC` | **Caffee Matcha** | Fusion Matcha + Espresso Layer | **12.000** |
| 11 | `AVO-COF` | **Avocado Coffee** | Alpukat Creamy + Espresso Float | **12.000** |

### B. Kategori: Non Coffee (9 Varian)
| No | SKU | Nama Menu | Deskripsi / Karakter Rasa | Harga (Rp) |
|:--:|---|---|---|:--:|
| 12 | `TEA-LMN` | **Lemon Tea** | Teh Seduh Segar + Sari Lemon Asli | **5.000** |
| 13 | `TEA-LYC` | **Lychee Tea** | Teh Manis Segar + Aroma Buah Leci | **5.000** |
| 14 | `MTC-ORI` | **Matcha Original** | Pure Green Tea Matcha Klasik | **9.000** |
| 15 | `MLO-ORI` | **Milo** | Cokelat Malt Milo Rich & Creamy | **9.000** |
| 16 | `MLK-AVO` | **Milk Avocado** | Susu Segar Rasa Buah Alpukat Manis | **9.000** |
| 17 | `CKL-ORI` | **Cokelat** | Dark Chocolate Blend Gurih Manis | **10.000** |
| 18 | `MLK-MTC` | **Milk Matcha** | Premium Japanese Matcha + Fresh Milk | **12.000** |
| 19 | `RED-VLT` | **Red Velvet** | Red Velvet Creamy Dessert Drink | **12.000** |
| 20 | `HZL-CHO` | **Hazelnut Choco** | Cokelat Susu dengan Sirup Hazelnut | **12.000** |

---

## 4. Struktur Database / Skema Data (JSON Schema)

### Entity: Order / Transaksi Riil
```json
{
  "order_id": "TRX-20261116-001",
  "table_number": "Take Away",
  "order_type": "TAKE_AWAY",
  "cashier_id": "USR-001",
  "cashier_name": "Kasir Three Coffee",
  "timestamp": "2026-11-16T00:15:00Z",
  "items": [
    {
      "product_id": "KPS-ARN",
      "name": "Kopsu Aren",
      "qty": 1,
      "base_price": 10000,
      "modifiers": [
        {"type": "TEMP", "value": "ICED", "price": 0},
        {"type": "SUGAR", "value": "100%", "price": 0}
      ],
      "subtotal": 10000,
      "notes": ""
    },
    {
      "product_id": "CFL-STR",
      "name": "Caffe Latte",
      "qty": 1,
      "base_price": 8000,
      "modifiers": [
        {"type": "STRENGTH", "value": "STRONG", "price": 2000},
        {"type": "TEMP", "value": "ICED", "price": 0},
        {"type": "SUGAR", "value": "50%", "price": 0}
      ],
      "subtotal": 10000,
      "notes": "Less sugar"
    },
    {
      "product_id": "TEA-LMN",
      "name": "Lemon Tea",
      "qty": 1,
      "base_price": 5000,
      "modifiers": [
        {"type": "TEMP", "value": "ICED", "price": 0}
      ],
      "subtotal": 5000,
      "notes": ""
    }
  ],
  "subtotal": 25000,
  "discount": 0,
  "total": 25000,
  "payment": {
    "method": "CASH",
    "amount_received": 50000,
    "change": 25000,
    "status": "PAID"
  }
}
```

---

## 5. Modul Rekapitulasi Kas Masuk & Kas Keluar (Cash Management)

Modul ini mengontrol arus uang tunai fisik di laci kasir secara *real-time* untuk mencegah kecurangan dan mempermudah rekonsiliasi kas di akhir shift.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      RUMUS REKONSILIASI KAS LACI KASIR                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│  KAS SEHARUSNYA = (Modal Kas Awal + Total Penjualan Tunai + Kas Masuk Lain)     │
│                   - (Total Kas Keluar / Petty Cash + Setor Kas / Cash Pull)     │
│                                                                                 │
│  SELISIH (VARIANCE) = Total Kas Fisik Aktual di Laci - Kas Seharusnya           │
│  • Selisih = 0  -> Status: SEIMBANG / COCOK                                     │
│  • Selisih > 0  -> Status: LEBIH (Over Cash)                                    │
│  • Selisih < 0  -> Status: KURANG (Short Cash - perlu keterangan kasir)         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1. Kategori Kas Masuk (Cash In):
* **Modal Awal Shift (Starting Float):** Diinput kasir saat awal buka toko/shift (contoh: Rp 200.000 untuk pecahan uang kembalian).
* **Penambahan Modal Kas:** Tambahan uang kecil dari owner/supervisor di tengah shift.
* **Pendapatan Tunai Non-Penjualan:** Penerimaan titipan atau penerimaan lainnya.

### 2. Kategori Kas Keluar (Cash Out / Petty Cash):
Setiap pengeluaran kas wajib mencantumkan: `Waktu`, `Kategori`, `Nominal`, `Kasir Bertugas`, dan `Catatan / Lampiran Foto Nota`:
* **Bahan Baku Darurat:** Pembelian es batu kristal, susu fresh tambahan, air galon, gas melon.
* **Operasional Toko:** Pembayaran iuran sampah, parkir, kebersihan, lakban, plastik kresek.
* **Pengambilan Kas (Cash Pull):** Penyetoran uang tunai dari laci ke brankas/owner jika uang di laci sudah melampaui batas aman (misal laci > Rp 3.000.000).

---

## 6. Format Penulisan Laporan (Reporting & Exporting)

Sistem menyediakan 3 format laporan standar yang otomatis tergenerate dan dapat dicetak atau dibagikan:

### A. Template Rekap Tutup Shift (Z-Report Thermal Print 58mm/80mm)
```text
================================
         THREE COFFEE           
   LAPORAN PENUTUPAN SHIFT      
================================
No. Laporan : RKP-20261116-01
Shift       : Shift 1 (Pagi)
Kasir       : Budi
Buka Shift  : 16/11/2026 08:00
Tutup Shift : 16/11/2026 15:00
--------------------------------
RINGKASAN PENJUALAN:
Total Transaksi : 128 TRX
Produk Terjual  : 312 Cup/Item
Gross Sales     : Rp 4.850.000
Diskon          : Rp         0
NET SALES       : Rp 4.850.000

METODE PEMBAYARAN:
- Tunai (Cash)       : Rp 1.450.000 (42 TRX)
- Transfer via QRIS  : Rp 2.100.000 (64 TRX)
- Transfer Bank (ATM): Rp 1.300.000 (22 TRX)
--------------------------------
Subtotal Non-Tunai   : Rp 3.400.000 (86 TRX)
(Tanpa Kartu ATM Fisik / Tanpa Mesin EDC)
--------------------------------
REKONSILIASI KAS LACI:
(+) Modal Awal  : Rp   200.000
(+) Tunai Masuk : Rp 1.450.000
(+) Kas Masuk   : Rp         0
(-) Kas Keluar  : Rp   150.000
--------------------------------
Kas Seharusnya  : Rp 1.500.000
Kas Fisik Aktual: Rp 1.500.000
SELISIH (VAR)   : Rp         0 [PAS]
--------------------------------
DETAIL KAS KELUAR:
1. Beli Es Batu     : Rp  30.000
2. Susu Tambahan    : Rp  70.000
3. Galon Air Minum  : Rp  50.000
--------------------------------
TOP 3 MENU SHIFT INI:
1. Kopsu Aren          : 84 Cup
2. Butterscotch Latte  : 62 Cup
3. Americano Normal    : 45 Cup
================================
Tanda Tangan Kasir,   Supervisor,


(   Budi   )       (   Owner   )
================================
```

### B. Format Laporan Harian Siap Kirim WhatsApp (Auto-Copy Text)
```text
☕ *LAPORAN PENJUALAN HARIAN - THREE COFFEE* ☕
📅 Tanggal: Senin, 16 November 2026
👤 Kasir Shift: Budi & Rian

📊 *RINGKASAN OMSET:*
• Total Transaksi : 128 Transaksi
• Total Cup/Item  : 312 Cup
• *Total Omset    : Rp 4.850.000*

💳 *RINCIAN PEMBAYARAN:*
• Tunai (Cash)                         : Rp 1.450.000 (42 Transaksi - 29.9%)
• Transfer via QRIS (GoPay/DANA/OVO)   : Rp 2.100.000 (64 Transaksi - 43.3%)
  _(Pelanggan scan barcode QRIS fisik / foto layar kasir)_
• Transfer Bank (Nomor Rekening Toko)  : Rp 1.300.000 (22 Transaksi - 26.8%)
  _(Pelanggan transfer via m-Banking/ATM ke rekening toko)_

💵 *KAS KECIL & LACI:*
• Modal Kas Awal    : Rp 200.000
• Penjualan Tunai   : Rp 1.450.000
• Kas Keluar (Beban): Rp 150.000 (Es, Susu, Galon)
• *Uang Fisik Laci  : Rp 1.500.000 (Cocok / Selisih Rp 0)*

⭐ *TOP 3 TERLARIS:*
1. Kopsu Aren (84 Cup)
2. Butterscotch Latte (62 Cup)
3. Americano Normal (45 Cup)

_Laporan otomatis digenerate dari Three Coffee POS._
```

### C. Konfigurasi Pembayaran Non-Tunai Toko (`PaymentSettings`)
*Sistem dirancang khusus untuk operasional tanpa mesin gesek kartu ATM / tanpa EDC perbankan:*
1. **Penyimpanan Foto QRIS Fisik Toko:**
   * Toko mengunggah foto / barcode QRIS fisik statis (GoPay, DANA, OVO, ShopeePay, BCA QR, LinkAja, dsb).
   * Pada layar pembayaran kasir, terdapat tombol `[Tampilkan Barcode QRIS Layar Penuh]` untuk kemudahan scan pelanggan jika stiker meja kurang jelas.
2. **Daftar Rekening Bank Toko (Transfer Manual):**
   * Menyimpan daftar rekening resmi Three Coffee:
     * **Bank BCA:** `8735-0912-34` a.n. Three Coffee
     * **Bank BRI:** `0123-01-000456-53-1` a.n. Three Coffee
     * **Bank Mandiri:** `137-00-1928374-5` a.n. Three Coffee
   * Tombol `[Salin Nomor Rekening]` (1-klik copy untuk memudahkan pengiriman nomor rekening via WhatsApp jika pemesanan take-away / delivery).
3. **Pemisahan Laporan Otomatis:**
   * Laporan kasir memisahkan secara tegas antara omset **Transfer via QRIS** dan **Transfer Bank**, sehingga owner dapat mencocokkan mutasi rekening bank dan saldo e-wallet merchant secara terpisah.

---

## 7. Integrasi & Sinkronisasi Printer Bluetooth (Thermal ESC/POS)

Aplikasi kasir mobile tersinkronisasi langsung dengan printer thermal mini portable melalui protokol **Bluetooth SPP (Serial Port Profile)** dan **BLE (Bluetooth Low Energy)** menggunakan standar perintah **ESC/POS**.

### 1. Spesifikasi Teknis & Kompatibilitas Hardware
* **Jenis Printer:** Printer Thermal Kasir Bluetooth Portabel (58mm dan 80mm).
* **Kompatibilitas Merk/Model Populer:**
  * Panda POS (PRJ-58D / 80B)
  * Iware (C-58BT / MP-58A / 80)
  * Eppos (EP-5802AI / RPP02N)
  * Zjiang / GOOJPRT (JP-PT210 / MTP-II)
  * Terminal All-in-One: Sunmi V2/V2 Pro, iMin Swift 1.
* **Lebar Kertas & Karakter per Baris:**
  * **Kertas 58mm:** Lebar cetak 48mm / 32 kolom karakter font standard (Font A: 12x24 dot).
  * **Kertas 80mm:** Lebar cetak 72mm / 48 kolom karakter font standard.

### 2. Alur Kerja Sinkronisasi Bluetooth (Connection Flow)
```
[Buka Layar Settings / Kasir]
            │
            ▼
[Scan Bluetooth Devices Sekitar] ──► Ditemukan: "RPP02N" / "POS-58" (MAC: 66:32:B1:..)
            │
            ▼
[Pairing & Simpan Default Device] ──► Disimpan di local storage (Auto-reconnect aktif)
            │
            ▼
[Tombol Cetak Ditekan di POS]
            │
            ├─► Cek status Bluetooth ON?
            ├─► Terhubung ke Printer? (Jika putus, auto-reconnect dalam 1.5 detik)
            ├─► Konversi Text & Format ke Byte Array ESC/POS Command
            └─► Kirim Byte Stream via Bluetooth Socket -> Printer Cetak Langsung
```

### 3. Konfigurasi ESC/POS Command yang Digunakan
| Perintah | Hex Code ESC/POS | Fungsi |
|---|---|---|
| `INIT_PRINTER` | `\x1B\x40` | Reset printer dan set default format |
| `ALIGN_LEFT` | `\x1B\x61\x00` | Rata kiri (untuk list nama menu & SKU) |
| `ALIGN_CENTER` | `\x1B\x61\x01` | Rata tengah (untuk Logo/Nama Toko & Footer) |
| `ALIGN_RIGHT` | `\x1B\x61\x02` | Rata kanan (untuk harga & total) |
| `BOLD_ON / OFF` | `\x1B\x45\x01` / `\x00` | Huruf tebal pada Total & Nama Menu |
| `FONT_DOUBLE_HEIGHT` | `\x1B\x21\x10` | Tulisan membesar (untuk Nomor Meja / Nomor Antrian) |
| `FEED_LINES_AND_CUT` | `\x1D\x56\x41\x03` | Feed kertas 3 baris lalu potong (Paper Cut khusus 80mm) |
| `OPEN_CASH_DRAWER` | `\x1B\x70\x00\x19\xFA` | Sinyal pulsa ke RJ11 port untuk membuka laci kasir otomatis saat bayar Tunai |

### 4. Mode Cetak Otomatis (Dual Printing Mode):
* **Mode Barista (Kitchen Slip):** Mencetak tiket hanya berisi nama item, ukuran, dan modifier detail (tanpa mencantumkan harga) untuk diserahkan ke bagian pembuatan kopi.
* **Mode Struk Pelanggan:** Mencetak nota lengkap dengan logo toko, rincian pembayaran, status QRIS/Cash, kembalian, dan ucapan terima kasih.
* **Mode Cetak Ulang (Reprint):** Fitur cetak ulang struk dari riwayat transaksi jika kertas habis atau macet.

---

## 8. Skema Data Kas & Laporan Shift (JSON Schema)

```json
{
  "shift_id": "SFT-20261116-01",
  "cashier_id": "USR-001",
  "cashier_name": "Budi",
  "opened_at": "2026-11-16T08:00:00Z",
  "closed_at": "2026-11-16T16:00:00Z",
  "opening_cash_float": 200000,
  "sales_summary": {
    "total_transactions": 128,
    "total_items_sold": 312,
    "gross_sales": 4850000,
    "discounts": 0,
    "net_sales": 4850000,
    "by_payment_method": {
      "cash": {"amount": 1450000, "count": 42},
      "transfer_via_qris": {"amount": 2100000, "count": 64, "channel": "QRIS_PHYSICAL"},
      "transfer_bank": {"amount": 1300000, "count": 22, "channel": "MANUAL_ATM_MBANKING"}
    }
  },
  "cash_movements": [
    {
      "id": "CSH-OUT-001",
      "type": "CASH_OUT",
      "category": "RAW_MATERIAL",
      "amount": 30000,
      "note": "Beli Es Batu Kristal 3 pack",
      "timestamp": "2026-11-16T10:15:00Z"
    },
    {
      "id": "CSH-OUT-002",
      "type": "CASH_OUT",
      "category": "RAW_MATERIAL",
      "amount": 70000,
      "note": "Susu UHT Fresh 4 liter",
      "timestamp": "2026-11-16T12:30:00Z"
    },
    {
      "id": "CSH-OUT-003",
      "type": "CASH_OUT",
      "category": "OPERATIONAL",
      "amount": 50000,
      "note": "Air Galon 2 buah",
      "timestamp": "2026-11-16T14:00:00Z"
    }
  ],
  "cash_reconciliation": {
    "expected_cash_in_drawer": 1500000,
    "actual_cash_counted": 1500000,
    "variance": 0,
    "status": "BALANCED"
  },
  "printer_logs": {
    "device_name": "RPP02N Thermal",
    "mac_address": "66:32:B1:88:99:A2",
    "print_status": "SUCCESS"
  }
}
```

---

## 9. Rencana Pengembangan (Roadmap Fitur)

1. [x] **Desain Wireframe & Hi-Fi di FigCraft** (Katalog, Kustomisasi, Checkout, Struk)
2. [x] **Spesifikasi Menu & Harga Riil Three Coffee** (20 Varian Best Coffee & Non-Coffee)
3. [x] **Modul Rekapitulasi Kas Masuk & Keluar (Cash In / Out & Petty Cash)**
4. [x] **Penulisan Format Laporan (Z-Report Thermal & Template WhatsApp)**
5. [x] **Integrasi Hardware Printer Thermal Bluetooth 58mm & Cash Drawer (ESC/POS)**
6. [ ] **Manajemen Meja Visual (Table Layout Dine-In)**
7. [ ] **Export Laporan Berkala ke Excel (.xlsx) & PDF Summary**
