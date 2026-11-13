// Konten kartu materi 4 level Adventure Map.
// Aturan (EL02, EL03, EL04): maksimal 2–3 kalimat per kartu, visual selalu berdampingan dengan teks,
// siswa mengatur sendiri kecepatan (Sebelumnya / Ulangi / Lanjut).

export const LESSON_CONTENT = {
  'lembah-lingkaran': {
    level: 1,
    title: 'Lembah Lingkaran',
    goal: 'Mengingat r, d, keliling, dan luas lingkaran, memilih π dengan tepat, serta mengenal unsur-unsur tabung.',
    intro: 'Halo, penjelajah! Sebelum menaklukkan tabung, kita pemanasan dulu dengan lingkaran. Alas dan tutup tabung itu lingkaran, lho!',
    activity: 'klik bagian tabung 3D & latihan d → r',
    steps: [
      {
        title: 'Jari-jari dan Diameter',
        text: 'Jari-jari (r) adalah jarak dari titik pusat ke tepi lingkaran. Diameter (d) adalah garis tengah yang melewati pusat, panjangnya 2 kali jari-jari.',
        formula: 'd = 2r   →   r = d ÷ 2',
        visual: { type: 'circle', show: ['r', 'd'] },
        example: { title: 'Contoh', lines: ['Diameter tutup kaleng = 14 cm', 'r = 14 ÷ 2 = 7 cm'] },
        check: {
          q: 'Diameter sebuah tutup gelas 10 cm. Berapa jari-jarinya?',
          options: [
            { t: '5 cm', ok: true, fb: 'Tepat! r = 10 ÷ 2 = 5 cm.' },
            { t: '10 cm', fb: 'Itu diameternya. Jari-jari = diameter ÷ 2.' },
            { t: '20 cm', fb: 'Jari-jari lebih pendek dari diameter, bukan dua kalinya.' },
          ],
        },
      },
      {
        title: 'Keliling dan Luas Lingkaran',
        text: 'Keliling adalah panjang tepi lingkaran. Luas adalah besar daerah di dalam lingkaran. Jangan tertukar: luas memakai r kuadrat.',
        formula: 'K = 2πr      L = πr²',
        visual: { type: 'circle', show: ['r', 'k', 'l'] },
        example: { title: 'Contoh r = 7 cm, π = 22/7', lines: ['K = 2 × 22/7 × 7 = 44 cm', 'L = 22/7 × 7 × 7 = 154 cm²'] },
        check: {
          q: 'Rumus luas lingkaran adalah ...',
          options: [
            { t: 'πr²', ok: true, fb: 'Benar! Luas lingkaran = π × r × r.' },
            { t: '2πr', fb: 'Itu rumus keliling (panjang tepi), bukan luas.' },
            { t: 'πd', fb: 'πd juga rumus keliling (karena d = 2r).' },
          ],
        },
      },
      {
        title: 'Memilih Nilai π',
        text: 'Pakai π = 22/7 jika r atau d kelipatan 7, karena angka 7 bisa dicoret sehingga hitungan jadi bulat. Selain itu, pakai π = 3,14.',
        formula: 'r kelipatan 7 → π = 22/7     selain itu → π = 3,14',
        visual: { type: 'pi' },
        example: { title: 'Contoh r = 10 cm', lines: ['10 bukan kelipatan 7 → π = 3,14', 'L = 3,14 × 10 × 10 = 314 cm²'] },
        check: {
          q: 'Jari-jari sebuah kaleng 21 cm. Nilai π yang paling efisien?',
          options: [
            { t: '22/7', ok: true, fb: 'Tepat! 21 kelipatan 7, jadi 22/7 × 21 = 66 (bulat).' },
            { t: '3,14', fb: 'Boleh saja, tetapi 21 kelipatan 7, jadi 22/7 lebih mudah dihitung.' },
          ],
        },
      },
      {
        title: 'Unsur-unsur Tabung',
        text: 'Tabung punya 3 sisi: alas dan tutup (lingkaran) serta selimut (sisi lengkung). Tabung punya 2 rusuk lengkung dan tidak punya titik sudut.',
        visual: { type: 'identify', required: true },
        example: { title: 'Ingat warnanya', lines: ['Tutup = kuning', 'Alas = oranye', 'Selimut = biru langit'] },
        check: {
          q: 'Berapa banyak titik sudut pada tabung?',
          options: [
            { t: '0 (tidak ada)', ok: true, fb: 'Benar! Rusuk tabung lengkung, jadi tidak ada titik sudut.' },
            { t: '2', fb: 'Yang berjumlah 2 adalah rusuk lengkungnya, bukan titik sudut.' },
            { t: '3', fb: 'Yang berjumlah 3 adalah sisinya (alas, tutup, selimut).' },
          ],
        },
      },
      {
        title: 'Latihan: Cek r atau d?',
        text: 'Sebelum memakai rumus tabung, selalu cek dulu: yang diketahui jari-jari atau diameter? Kalau diameter, bagi 2 dulu.',
        visual: { type: 'radius-drill', required: true },
        tip: 'Perhatikan baik-baik soalnya: yang diketahui diameter atau jari-jari? Jangan lupa r = d ÷ 2!',
      },
    ],
    summary: ['r = d ÷ 2 dan d = 2r', 'Keliling K = 2πr, luas L = πr²', 'π = 22/7 untuk r/d kelipatan 7, selain itu 3,14', 'Tabung: 3 sisi, 2 rusuk lengkung, 0 titik sudut'],
    traps: ['Memakai diameter langsung sebagai r', 'Menukar rumus keliling (2πr) dengan luas (πr²)'],
  },

  'bengkel-jaring': {
    level: 2,
    title: 'Bengkel Jaring-Jaring',
    goal: 'Membentangkan tabung menjadi jaring-jaring dan menemukan sendiri asal angka 2 pada rumus 2πr(r + t).',
    intro: 'Selamat datang di bengkel! Di sini kita akan membongkar tabung. Coba buka jaring-jaring 3D-nya. Ada berapa lingkaran yang kamu lihat?',
    activity: 'slider bentangan jaring-jaring 3D',
    steps: [
      {
        title: 'Tabung Bisa Dibentangkan',
        text: 'Geser slider sampai 100%. Tabung tertutup terbuka menjadi jaring-jaring: 2 lingkaran (alas dan tutup) dan 1 persegi panjang (selimut).',
        visual: { type: 'unfold', required: true },
        check: {
          q: 'Jaring-jaring tabung tertutup terdiri dari ...',
          options: [
            { t: '2 lingkaran + 1 persegi panjang', ok: true, fb: 'Tepat! Alas, tutup, dan selimut.' },
            { t: '1 lingkaran + 1 persegi panjang', fb: 'Itu tabung tanpa tutup. Tabung tertutup punya alas DAN tutup.' },
            { t: '2 persegi panjang + 1 lingkaran', fb: 'Selimut hanya satu persegi panjang.' },
          ],
        },
      },
      {
        title: 'Ukuran Selimut',
        text: 'Selimut melingkari tepi alas tepat satu putaran. Jadi panjang persegi panjangnya = keliling alas (2πr), dan lebarnya = tinggi tabung (t).',
        formula: 'panjang = 2πr     lebar = t',
        visual: { type: 'net', r: 7, t: 10, mode: 'closed' },
        example: { title: 'Contoh r = 7 cm, t = 10 cm', lines: ['panjang = 2 × 22/7 × 7 = 44 cm', 'lebar = t = 10 cm'] },
        check: {
          q: 'Tabung dengan r = 14 cm. Berapa panjang persegi panjang selimutnya? (π = 22/7)',
          options: [
            { t: '88 cm', ok: true, fb: 'Benar! 2 × 22/7 × 14 = 88 cm.' },
            { t: '44 cm', fb: 'Itu πr (lupa dikali 2). Panjang selimut = 2πr.' },
            { t: '616 cm', fb: 'Itu luas lingkaran (πr²), bukan keliling.' },
          ],
        },
      },
      {
        title: 'Luas Selimut',
        text: 'Selimut berbentuk persegi panjang, jadi luasnya = panjang × lebar. Panjangnya 2πr dan lebarnya t.',
        visual: { type: 'derive', stage: 1 },
        example: { title: 'Contoh r = 7 cm, t = 10 cm', lines: ['L selimut = 2πrt', '= 44 × 10 = 440 cm²'] },
      },
      {
        title: 'Asal Angka 2',
        text: 'Alas dan tutup sama besar, masing-masing πr². Karena ada DUA lingkaran, luasnya πr² + πr² = 2πr².',
        visual: { type: 'derive', stage: 2 },
        example: { title: 'Contoh r = 7 cm', lines: ['alas = 154 cm², tutup = 154 cm²', 'alas + tutup = 2 × 154 = 308 cm²'] },
        check: {
          q: 'Mengapa ada 2πr² pada rumus luas permukaan tabung tertutup?',
          options: [
            { t: 'Karena ada 2 lingkaran: alas dan tutup', ok: true, fb: 'Tepat! Itulah asal angka 2.' },
            { t: 'Karena diameter = 2r', fb: 'Bukan. Angka 2 di sini menghitung banyaknya lingkaran.' },
            { t: 'Karena π selalu dikali 2', fb: 'Tidak. Luas satu lingkaran hanya πr².' },
          ],
        },
      },
      {
        title: 'Rumus Lengkap',
        text: 'Jumlahkan semua bagian: 2πr² + 2πrt. Keluarkan faktor yang sama, yaitu 2πr, sehingga menjadi 2πr(r + t).',
        visual: { type: 'derive', stage: 3 },
        example: { title: 'Contoh r = 7 cm, t = 10 cm', lines: ['L = 2πr(r + t)', '= 2 × 22/7 × 7 × (7 + 10)', '= 44 × 17 = 748 cm²'] },
        check: {
          q: 'Luas permukaan tabung tertutup dengan r = 7 cm dan t = 3 cm adalah ... (π = 22/7)',
          options: [
            { t: '440 cm²', ok: true, fb: 'Hebat! 44 × (7 + 3) = 440 cm².' },
            { t: '286 cm²', fb: 'Itu tabung tanpa tutup (hanya 1 lingkaran). Soal ini tertutup.' },
            { t: '132 cm²', fb: 'Itu baru luas selimutnya. Tambahkan alas dan tutup.' },
          ],
        },
      },
    ],
    summary: ['Jaring-jaring tabung tertutup = 2 lingkaran + 1 persegi panjang', 'Panjang selimut = 2πr, lebar = t', 'L selimut = 2πrt, L alas + tutup = 2πr²', 'L permukaan = 2πr² + 2πrt = 2πr(r + t)'],
    traps: ['Lupa angka 2 pada keliling (memakai πr)', 'Lupa bahwa ada 2 lingkaran pada tabung tertutup'],
  },

  'benteng-terbuka': {
    level: 3,
    title: 'Benteng Tabung Terbuka',
    goal: 'Membedakan tabung tertutup, tabung tanpa tutup, dan selimut saja, lalu memilih rumus yang tepat.',
    intro: 'Hati-hati di benteng ini! Tidak semua benda punya tutup. Bagian mana saja yang perlu dihitung luasnya?',
    activity: 'toggle tutup 3D & mencocokkan benda',
    steps: [
      {
        title: 'Tiga Kondisi Tabung',
        text: 'Tidak semua soal meminta seluruh permukaan. Klik tombol mode dan perhatikan bagian yang hilang: tutup, atau alas dan tutup.',
        visual: { type: 'modes', mode: 'closed' },
      },
      {
        title: 'Tabung Tertutup',
        text: 'Kaleng biskuit, kaleng susu, dan drum tertutup punya alas, tutup, dan selimut. Hitung 2 lingkaran + selimut.',
        formula: 'L = 2πr² + 2πrt = 2πr(r + t)',
        visual: { type: 'modes', mode: 'closed', lock: true },
        example: { title: 'Kaleng r = 7 cm, t = 10 cm', lines: ['L = 2 × 22/7 × 7 × 17 = 748 cm²'] },
      },
      {
        title: 'Tabung Tanpa Tutup',
        text: 'Gelas, ember, cangkir, dan tong sampah terbuka hanya punya 1 lingkaran (alas). Jangan ikut menghitung tutupnya!',
        formula: 'L = πr² + 2πrt',
        visual: { type: 'modes', mode: 'open', lock: true },
        example: { title: 'Gelas r = 7 cm, t = 10 cm', lines: ['alas = 154 cm²', 'selimut = 440 cm²', 'L = 154 + 440 = 594 cm²'] },
        check: {
          q: 'Sebuah ember tanpa tutup akan dicat bagian luarnya. Rumus yang tepat?',
          options: [
            { t: 'πr² + 2πrt', ok: true, fb: 'Tepat! 1 lingkaran (alas) + selimut.' },
            { t: '2πr(r + t)', fb: 'Hati-hati! Ember tidak punya tutup, jadi hanya 1 lingkaran.' },
            { t: '2πrt', fb: 'Alas ember ikut dicat, jadi tambahkan πr².' },
          ],
        },
      },
      {
        title: 'Selimut Saja',
        text: 'Label kertas kaleng dan pipa paralon yang terbuka di kedua ujung hanya punya sisi lengkung. Hitung selimutnya saja.',
        formula: 'L = 2πrt',
        visual: { type: 'modes', mode: 'blanket', lock: true },
        example: { title: 'Label kaleng r = 7 cm, t = 10 cm', lines: ['L = 2 × 22/7 × 7 × 10 = 440 cm²'] },
        check: {
          q: 'Pipa paralon terbuka di kedua ujungnya. Bagian yang dihitung?',
          options: [
            { t: 'Selimut saja', ok: true, fb: 'Benar! Tidak ada alas maupun tutup.' },
            { t: '1 lingkaran + selimut', fb: 'Pipa terbuka di KEDUA ujung, jadi tidak ada lingkaran.' },
            { t: '2 lingkaran + selimut', fb: 'Itu untuk tabung tertutup.' },
          ],
        },
      },
      {
        title: 'Cocokkan Benda dan Rumus',
        text: 'Pilih rumus yang tepat untuk setiap benda. Perhatikan kata kunci: "tertutup", "tanpa tutup", "terbuka kedua ujung", "label".',
        visual: { type: 'match', required: true },
      },
    ],
    summary: ['Tertutup: 2πr(r + t), ada 2 lingkaran', 'Tanpa tutup: πr² + 2πrt, ada 1 lingkaran', 'Selimut saja: 2πrt, tidak ada lingkaran', 'Kata kunci di soal menentukan rumus'],
    traps: ['Memakai rumus tertutup untuk gelas/ember', 'Ikut menghitung alas pada pipa atau label'],
  },

  'puncak-literasi': {
    level: 4,
    title: 'Puncak Literasi Tabung',
    goal: 'Menyelesaikan soal cerita panjang dengan strategi 4 langkah: sorot, tanya, hitung bertahap, tafsirkan.',
    intro: 'Kamu hampir sampai di puncak! Soal cerita panjang tidak perlu bikin bingung. Kita pakai 4 langkah, satu per satu.',
    activity: 'menyorot soal cerita & studi kasus',
    story: {
      text: 'OSIS akan mengecat bagian luar 4 tong sampah tanpa tutup, termasuk alasnya. Setiap tong berdiameter 42 cm dan tinggi 60 cm. Berapa cm² luas seluruh bagian yang dicat? Gunakan π = 22/7.',
      phrases: ['4 tong sampah', 'tanpa tutup', 'termasuk alasnya', 'diameter 42 cm', 'tinggi 60 cm', 'cm²', 'π = 22/7'],
    },
    steps: [
      {
        title: 'Langkah 1: Sorot Informasi Penting',
        text: 'Baca pelan-pelan, lalu sorot ukuran (r atau d), tinggi, banyak benda, dan kondisi tutupnya. Kalau bingung, tekan "Sorot otomatis".',
        visual: { type: 'story' },
        check: {
          q: 'Informasi apa yang perlu diubah dulu sebelum menghitung?',
          options: [
            { t: 'Diameter 42 cm → r = 21 cm', ok: true, fb: 'Tepat! Yang diketahui diameter, jadi r = 42 ÷ 2 = 21 cm.' },
            { t: 'Tinggi 60 cm → 30 cm', fb: 'Tinggi tidak perlu dibagi. Yang dibagi 2 adalah diameter.' },
            { t: 'Tidak ada yang perlu diubah', fb: 'Perhatikan: yang diketahui diameter, bukan jari-jari.' },
          ],
        },
      },
      {
        title: 'Langkah 2: Tentukan yang Ditanya',
        text: 'Tulis dengan jelas apa yang ditanyakan dan satuannya. Ini mencegahmu berhenti di tengah jalan.',
        visual: { type: 'story', compact: true },
        check: {
          q: 'Apa yang ditanyakan soal tersebut?',
          options: [
            { t: 'Luas bagian yang dicat untuk 4 tong (cm²)', ok: true, fb: 'Benar! Jangan lupa: ada 4 tong.' },
            { t: 'Luas 1 tong saja', fb: 'Soal menanyakan seluruh bagian yang dicat, yaitu 4 tong.' },
            { t: 'Volume tong', fb: 'Mengecat berhubungan dengan permukaan (luas), bukan isi.' },
          ],
        },
      },
      {
        title: 'Langkah 3: Pilih Rumus & Hitung Bertahap',
        text: 'Tong tanpa tutup memakai rumus πr² + 2πrt. Ketuk tombol untuk membuka setiap baris perhitungan satu per satu.',
        visual: {
          type: 'reveal',
          lines: ['r = 42 ÷ 2 = 21 cm', 'Rumus: L = πr² + 2πrt (tanpa tutup)', 'Alas = 22/7 × 21 × 21 = 1.386 cm²', 'Selimut = 2 × 22/7 × 21 × 60 = 7.920 cm²', '1 tong = 1.386 + 7.920 = 9.306 cm²', '4 tong = 4 × 9.306 = 37.224 cm²'],
        },
      },
      {
        title: 'Langkah 4: Tafsirkan & Cek',
        text: 'Cek satuan (cm² atau m²) dan apakah jawabanmu masuk akal. Jika hasilnya banyak barang, seperti kaleng cat atau lembar seng, bulatkan KE ATAS.',
        formula: '1 m² = 10.000 cm²',
        visual: { type: 'rounding' },
        example: { title: 'Contoh', lines: ['37.224 cm² = 3,7224 m²', '1 kaleng cat untuk 1 m² → perlu 3,72 kaleng', 'Bulatkan ke atas → beli 4 kaleng'] },
        check: {
          q: 'Pengrajin butuh 6,2 lembar seng. Berapa lembar yang harus dibeli?',
          options: [
            { t: '7 lembar', ok: true, fb: 'Tepat! 6 lembar tidak cukup, jadi bulatkan ke atas.' },
            { t: '6 lembar', fb: 'Jika beli 6 lembar, sengnya kurang 0,2 lembar. Bulatkan ke atas!' },
          ],
        },
      },
      {
        title: 'Studi Kasus: Giliranmu!',
        text: 'Selesaikan kasus kaleng cat ini dengan 4 langkah tadi. Isi setiap tahap, lalu tekan Periksa.',
        visual: { type: 'case', required: true },
      },
    ],
    summary: ['1) Sorot: r/d, t, banyak benda, kondisi tutup', '2) Tulis yang ditanya + satuannya', '3) Pilih rumus, hitung bertahap', '4) Tafsirkan: cek satuan, bulatkan ke atas untuk kebutuhan barang'],
    traps: ['Lupa mengalikan dengan banyak benda', 'Membulatkan ke bawah pada kebutuhan bahan', 'Salah konversi cm² ↔ m²'],
  },
}
