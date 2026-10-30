/* ================================================
   script.js — Expense & Budget Visualizer
   RevoU Software Engineering Mini Bootcamp
   ================================================
   Struktur kode:
   1. KONSTANTA & KONFIGURASI
   2. MODUL STORAGE    — baca/tulis localStorage
   3. MODUL TRANSAKSI  — tambah & hapus data
   4. MODUL VALIDASI   — cek input pengguna
   5. MODUL RENDER     — tampilkan data ke layar
   6. MODUL CHART      — kelola pie chart Chart.js
   7. MODUL SORT       — urutkan daftar transaksi
   8. MODUL THEME      — dark/light mode
   9. INISIALISASI     — jalankan saat halaman siap
   ================================================ */

/* ------------------------------------------------
   1. KONSTANTA & KONFIGURASI
   ------------------------------------------------ */

// Kunci yang digunakan untuk menyimpan data di localStorage
const STORAGE_KEY_TRANSACTIONS = "expense_transactions";
const STORAGE_KEY_THEME        = "expense_theme";

// Warna untuk setiap kategori (dipakai di chart & badge)
const CATEGORY_COLORS = {
  Food:      "#f6ad55",
  Transport: "#63b3ed",
  Fun:       "#68d391",
};

// Nama bulan dalam Bahasa Indonesia untuk tampilan ringkasan bulanan
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April",
  "Mei", "Juni", "Juli", "Agustus",
  "September", "Oktober", "November", "Desember",
];

/* ------------------------------------------------
   2. MODUL STORAGE
   Semua interaksi dengan localStorage ada di sini
   ------------------------------------------------ */
const Storage = {
  /**
   * Membaca semua transaksi dari localStorage.
   * Jika belum ada data, kembalikan array kosong.
   */
  loadTransactions() {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    return raw ? JSON.parse(raw) : [];
  },

  /**
   * Menyimpan array transaksi ke localStorage.
   * JSON.stringify mengubah array menjadi teks agar bisa disimpan.
   */
  saveTransactions(transactions) {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  },

  /** Membaca preferensi tema (light/dark) */
  loadTheme() {
    return localStorage.getItem(STORAGE_KEY_THEME) || "light";
  },

  /** Menyimpan preferensi tema */
  saveTheme(theme) {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  },
};

/* ------------------------------------------------
   3. MODUL TRANSAKSI
   Logika tambah dan hapus transaksi
   ------------------------------------------------ */
const Transactions = {
  /**
   * Menambahkan transaksi baru.
   * @param {string} name     - Nama item
   * @param {number} amount   - Jumlah dalam Rupiah
   * @param {string} category - "Food" | "Transport" | "Fun"
   */
  add(name, amount, category) {
    const transactions = Storage.loadTransactions();

    // Buat objek transaksi baru
    const newTransaction = {
      // ID unik: gabungan timestamp + angka acak
      id:       `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name:     name.trim(),
      amount:   parseFloat(amount),
      category: category,
      // Simpan tanggal dalam format ISO (YYYY-MM-DD)
      date:     new Date().toISOString().split("T")[0],
    };

    // Tambahkan ke array dan simpan kembali
    transactions.push(newTransaction);
    Storage.saveTransactions(transactions);

    return newTransaction;
  },

  /**
   * Menghapus transaksi berdasarkan ID.
   * @param {string} id - ID transaksi yang akan dihapus
   */
  delete(id) {
    const transactions = Storage.loadTransactions();
    // filter() menyaring array — semua selain ID yang dipilih tetap ada
    const updated = transactions.filter((t) => t.id !== id);
    Storage.saveTransactions(updated);
  },

  /** Mengambil semua transaksi */
  getAll() {
    return Storage.loadTransactions();
  },
};

/* ------------------------------------------------
   4. MODUL VALIDASI
   Memeriksa input form sebelum data disimpan
   ------------------------------------------------ */
const Validation = {
  /**
   * Memvalidasi semua field form.
   * Menampilkan pesan error jika ada yang tidak valid.
   * @returns {boolean} true jika semua valid
   */
  validateForm() {
    const name     = document.getElementById("itemName").value.trim();
    const amount   = document.getElementById("amount").value.trim();
    const category = document.getElementById("category").value;

    let isValid = true;

    // Bersihkan error lama dulu
    this.clearErrors();

    // Validasi nama item
    if (name === "") {
      this.showError("errorItemName", "itemName", "Nama item tidak boleh kosong.");
      isValid = false;
    } else if (name.length < 2) {
      this.showError("errorItemName", "itemName", "Nama item minimal 2 karakter.");
      isValid = false;
    }

      // Validasi jumlah
      // Number() lebih ketat dari parseFloat — menolak "1e5", "  ", dan string campuran
      const amountNum = Number(amount);
      if (amount === "") {
        this.showError("errorAmount", "amount", "Jumlah tidak boleh kosong.");
        isValid = false;
      } else if (isNaN(amountNum) || amountNum <= 0 || !isFinite(amountNum)) {
        this.showError("errorAmount", "amount", "Jumlah harus berupa angka lebih dari 0.");
        isValid = false;
      } else if (!Number.isInteger(amountNum)) {
        this.showError("errorAmount", "amount", "Jumlah tidak boleh menggunakan desimal.");
        isValid = false;
      }

    // Validasi kategori
    if (category === "") {
      this.showError("errorCategory", "category", "Pilih salah satu kategori.");
      isValid = false;
    }

    return isValid;
  },

  /**
   * Menampilkan pesan error di bawah field tertentu.
   * @param {string} errorId  - ID elemen span untuk pesan error
   * @param {string} inputId  - ID input yang error
   * @param {string} message  - Pesan yang ditampilkan
   */
  showError(errorId, inputId, message) {
    const errorEl = document.getElementById(errorId);
    const inputEl = document.getElementById(inputId);

    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.classList.add("input-error");
  },

  /** Menghapus semua pesan error dari form */
  clearErrors() {
    const errorIds = ["errorItemName", "errorAmount", "errorCategory"];
    const inputIds = ["itemName", "amount", "category"];

    errorIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = "";
    });

    inputIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove("input-error");
    });
  },
};

/* ------------------------------------------------
   5. MODUL RENDER
   Semua fungsi untuk menampilkan data ke layar
   ------------------------------------------------ */
const Render = {
  /**
   * Fungsi utama: memperbarui SELURUH tampilan.
   * Dipanggil setiap kali data berubah (tambah/hapus).
   * @param {string} sortBy - "date" | "amount" | "category"
   */
  all(sortBy = "date") {
    const transactions = Transactions.getAll();
    const sorted       = Sort.apply(transactions, sortBy);

    this.transactionList(sorted);
    this.totals(transactions);
    this.monthlyList(transactions);
    Chart.update(transactions);
  },

  /**
   * Merender daftar transaksi ke dalam #transactionList.
   * @param {Array} transactions - Array transaksi yang sudah diurutkan
   */
  transactionList(transactions) {
    const listEl   = document.getElementById("transactionList");
    const countEl  = document.getElementById("transactionCount");

    // Perbarui badge jumlah transaksi
    if (countEl) countEl.textContent = transactions.length;

    if (transactions.length === 0) {
      // Gunakan innerHTML langsung agar tidak bergantung pada DOM node
      // yang bisa hilang setelah innerHTML di-overwrite sebelumnya
      listEl.innerHTML = `
        <div class="empty-state" id="emptyState">
          <span class="empty-icon">🧾</span>
          <p>Belum ada transaksi.</p>
          <p>Tambahkan transaksi pertamamu!</p>
        </div>
      `;
      return;
    }

    // Bangun HTML untuk setiap transaksi
    const html = transactions
      .map((t) => this._createTransactionHTML(t))
      .join("");

    listEl.innerHTML = html;
  },

  /**
   * Membuat HTML satu baris transaksi.
   * @param {Object} t - Objek transaksi
   * @returns {string} HTML string
   */
  _createTransactionHTML(t) {
    const categoryLower = t.category.toLowerCase();
    const formattedAmount = this._formatCurrency(t.amount);
    const formattedDate   = this._formatDate(t.date);

    // Template literal untuk HTML satu item
    return `
      <div class="transaction-item" data-id="${t.id}">
        <span class="item-dot dot-${categoryLower}"></span>
        <div class="item-info">
          <div class="item-name">${this._escapeHTML(t.name)}</div>
          <div class="item-meta">
            <span class="item-category-badge badge-${categoryLower}">${t.category}</span>
            &nbsp;${formattedDate}
          </div>
        </div>
        <span class="item-amount">${formattedAmount}</span>
        <button
          class="btn-delete"
          data-id="${t.id}"
          aria-label="Hapus transaksi ${this._escapeHTML(t.name)}"
          title="Hapus"
        >🗑️</button>
      </div>
    `;
  },

  /**
   * Memperbarui total pengeluaran dan breakdown per kategori.
   * @param {Array} transactions - Semua transaksi
   */
  totals(transactions) {
    // Hitung total keseluruhan
    const grandTotal = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Hitung total per kategori menggunakan reduce
    const totals = transactions.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      },
      { Food: 0, Transport: 0, Fun: 0 }
    );

    // Perbarui tampilan
    const totalEl = document.getElementById("totalAmount");
    if (totalEl) totalEl.textContent = this._formatCurrency(grandTotal);

    const foodEl      = document.getElementById("totalFood");
    const transportEl = document.getElementById("totalTransport");
    const funEl       = document.getElementById("totalFun");

    if (foodEl)      foodEl.textContent      = this._formatCurrency(totals.Food);
    if (transportEl) transportEl.textContent = this._formatCurrency(totals.Transport);
    if (funEl)       funEl.textContent       = this._formatCurrency(totals.Fun);
  },

  /**
   * Merender ringkasan pengeluaran per bulan.
   * @param {Array} transactions - Semua transaksi
   */
  monthlyList(transactions) {
    const listEl = document.getElementById("monthlyList");

    if (transactions.length === 0) {
      // Gunakan innerHTML langsung agar konsisten dengan transactionList
      listEl.innerHTML = `
        <div class="empty-state" id="monthlyEmpty">
          <span class="empty-icon">📆</span>
          <p>Belum ada data bulanan.</p>
        </div>
      `;
      return;
    }

    // Kelompokkan transaksi berdasarkan "YYYY-MM"
    const monthly = transactions.reduce((acc, t) => {
      const key = t.date.slice(0, 7); // "2026-10"
      if (!acc[key]) acc[key] = { total: 0, count: 0 };
      acc[key].total += t.amount;
      acc[key].count += 1;
      return acc;
    }, {});

    // Urutkan bulan dari terbaru ke terlama
    const sorted = Object.keys(monthly).sort((a, b) => b.localeCompare(a));

    const html = sorted
      .map((key) => {
        const [year, month] = key.split("-");
        const monthName = MONTH_NAMES[parseInt(month, 10) - 1];
        const { total, count } = monthly[key];

        return `
          <div class="monthly-item">
            <div>
              <div class="monthly-month">${monthName} ${year}</div>
              <div class="monthly-count">${count} transaksi</div>
            </div>
            <div class="monthly-total">${this._formatCurrency(total)}</div>
          </div>
        `;
      })
      .join("");

    listEl.innerHTML = html;
  },

  /** Memformat angka menjadi format Rupiah. Contoh: 25000 → "Rp 25.000" */
  _formatCurrency(amount) {
    return "Rp " + amount.toLocaleString("id-ID");
  },

  /** Memformat tanggal ISO menjadi format Indonesia. Contoh: "2026-10-31" → "31 Okt 2026" */
  _formatDate(isoDate) {
    const [year, month, day] = isoDate.split("-");
    const shortMonth = MONTH_NAMES[parseInt(month, 10) - 1].slice(0, 3);
    return `${day} ${shortMonth} ${year}`;
  },

  /**
   * Mencegah XSS: mengubah karakter berbahaya di teks
   * sehingga tidak bisa dieksekusi sebagai HTML.
   */
  _escapeHTML(text) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  },

};

/* ------------------------------------------------
   6. MODUL CHART
   Mengelola pie chart menggunakan Chart.js
   ------------------------------------------------ */
const Chart = (() => {
  // Menyimpan satu instance chart agar tidak terbuat berkali-kali
  let chartInstance = null;

  /**
   * Memperbarui (atau membuat pertama kali) pie chart.
   * @param {Array} transactions - Semua transaksi
   */
  function update(transactions) {
    const canvas   = document.getElementById("expenseChart");
    const emptyEl  = document.getElementById("chartEmpty");

    // Hitung total per kategori
    const totals = {
      Food:      0,
      Transport: 0,
      Fun:       0,
    };

    transactions.forEach((t) => {
      totals[t.category] += t.amount;
    });

    const values = [totals.Food, totals.Transport, totals.Fun];
    const hasData = values.some((v) => v > 0);

    if (!hasData) {
      // Sembunyikan canvas, tampilkan pesan kosong
      canvas.style.display = "none";
      if (emptyEl) emptyEl.style.display = "block";

      // Hancurkan chart lama jika ada
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
      return;
    }

    // Ada data: tampilkan canvas, sembunyikan pesan kosong
    canvas.style.display = "block";
    if (emptyEl) emptyEl.style.display = "none";

    const chartData = {
      labels: ["Food 🍔", "Transport 🚗", "Fun 🎮"],
      datasets: [
        {
          data:            values,
          backgroundColor: [
            CATEGORY_COLORS.Food,
            CATEGORY_COLORS.Transport,
            CATEGORY_COLORS.Fun,
          ],
          // Warna tepi sedikit lebih gelap
          borderColor: ["#e89a3a", "#4a9fd9", "#52c47e"],
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };

    // Opsi tampilan chart
    const chartOptions = {
      responsive:          true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding:   16,
            font:      { size: 13 },
            // Warna teks legenda mengikuti tema
            color: document.body.classList.contains("dark") ? "#f1f5f9" : "#1a202c",
          },
        },
        tooltip: {
          callbacks: {
            // Format tooltip: tampilkan nilai dalam Rupiah + persentase
            label(context) {
              const value   = context.parsed;
              const total   = context.dataset.data.reduce((a, b) => a + b, 0);
              const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return ` Rp ${value.toLocaleString("id-ID")} (${percent}%)`;
            },
          },
        },
      },
    };

    if (chartInstance) {
      // Chart sudah ada → perbarui datanya saja (lebih efisien)
      chartInstance.data             = chartData;
      chartInstance.options.plugins.legend.labels.color =
        document.body.classList.contains("dark") ? "#f1f5f9" : "#1a202c";
      chartInstance.update();
    } else {
      // Chart belum ada → buat baru
      // window.Chart merujuk ke library Chart.js dari CDN
      chartInstance = new window.Chart(canvas, {
        type:    "pie",
        data:    chartData,
        options: chartOptions,
      });
    }
  }

  // Expose fungsi update ke luar modul
  return { update };
})();

/* ------------------------------------------------
   7. MODUL SORT
   Mengurutkan array transaksi
   ------------------------------------------------ */
const Sort = {
  /**
   * Mengurutkan transaksi berdasarkan kriteria.
   * @param {Array}  transactions - Array yang akan diurutkan
   * @param {string} sortBy       - "date" | "amount" | "category"
   * @returns {Array} Array baru yang sudah diurutkan
   */
  apply(transactions, sortBy) {
    // Buat salinan agar data asli tidak berubah
    const copy = [...transactions];

    switch (sortBy) {
      case "amount":
        // Urutkan dari jumlah terbesar ke terkecil
        return copy.sort((a, b) => b.amount - a.amount);

      case "category":
        // Urutkan berdasarkan nama kategori A-Z,
        // jika kategori sama, urutkan terbaru dulu
        return copy.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return b.date.localeCompare(a.date);
        });

      case "date":
      default:
        // Urutkan dari tanggal terbaru ke terlama
        return copy.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    }
  },
};

/* ------------------------------------------------
   8. MODUL THEME
   Mengelola dark/light mode
   ------------------------------------------------ */
const Theme = {
  /** Menerapkan tema ke body dan memperbarui teks tombol */
  apply(theme) {
    const body       = document.body;
    const toggleBtn  = document.getElementById("themeToggle");
    const themeIcon  = toggleBtn ? toggleBtn.querySelector(".theme-icon")  : null;
    const themeLabel = toggleBtn ? toggleBtn.querySelector(".theme-label") : null;

    if (theme === "dark") {
      body.className = "dark";
      if (themeIcon)  themeIcon.textContent  = "☀️";
      if (themeLabel) themeLabel.textContent = "Light Mode";
    } else {
      body.className = "light";
      if (themeIcon)  themeIcon.textContent  = "🌙";
      if (themeLabel) themeLabel.textContent = "Dark Mode";
    }

    // Perbarui warna teks legenda chart jika ada
    Storage.saveTheme(theme);
  },

  /** Membaca tema tersimpan dan menerapkannya */
  load() {
    const saved = Storage.loadTheme();
    this.apply(saved);
    return saved;
  },

  /** Mengganti tema: jika gelap → terang, jika terang → gelap */
  toggle() {
    const current = Storage.loadTheme();
    const next    = current === "dark" ? "light" : "dark";
    this.apply(next);

    // Perbarui chart agar warna legenda ikut berubah
    const transactions = Transactions.getAll();
    Chart.update(transactions);
  },
};

/* ------------------------------------------------
   9. INISIALISASI
   Menghubungkan semua modul ke event listener
   Dijalankan saat seluruh halaman HTML sudah siap
   ------------------------------------------------ */
(function init() {
  // Simpan status sort aktif saat ini
  let currentSort = "date";

  // ---- Muat tema tersimpan ----
  Theme.load();

  // ---- Render pertama kali saat halaman dibuka ----
  Render.all(currentSort);

  /* ------------------------------------------
     EVENT: Submit form tambah transaksi
  ------------------------------------------ */
  const form = document.getElementById("transactionForm");
  if (form) {
    form.addEventListener("submit", function (event) {
      // Cegah reload halaman (perilaku default form HTML)
      event.preventDefault();

      // Jalankan validasi; berhenti jika ada error
      if (!Validation.validateForm()) return;

      // Ambil nilai dari form
      const name     = document.getElementById("itemName").value.trim();
      const amount   = parseFloat(document.getElementById("amount").value);
      const category = document.getElementById("category").value;

      // Simpan transaksi baru
      Transactions.add(name, amount, category);

      // Bersihkan form agar siap untuk input berikutnya
      form.reset();
      Validation.clearErrors();

      // Perbarui seluruh tampilan
      Render.all(currentSort);
    });
  }

  /* ------------------------------------------
     EVENT: Klik tombol hapus transaksi
     (Event delegation — satu listener untuk semua tombol hapus)
  ------------------------------------------ */
  const listEl = document.getElementById("transactionList");
  if (listEl) {
    listEl.addEventListener("click", function (event) {
      // Cari apakah yang diklik adalah tombol hapus
      const deleteBtn = event.target.closest(".btn-delete");
      if (!deleteBtn) return;

      const id = deleteBtn.dataset.id;
      if (!id) return;

      // Konfirmasi sebelum hapus
      const confirmed = window.confirm("Hapus transaksi ini?");
      if (!confirmed) return;

      Transactions.delete(id);
      Render.all(currentSort);
    });
  }

  /* ------------------------------------------
     EVENT: Klik tombol sort
  ------------------------------------------ */
  const sortButtons = document.querySelectorAll(".btn-sort");
  sortButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Hapus kelas "active" dari semua tombol
      sortButtons.forEach((b) => b.classList.remove("active"));

      // Berikan kelas "active" pada tombol yang diklik
      this.classList.add("active");

      // Simpan dan terapkan sort yang dipilih
      currentSort = this.dataset.sort;
      Render.all(currentSort);
    });
  });

  /* ------------------------------------------
     EVENT: Klik tombol dark/light mode
  ------------------------------------------ */
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      Theme.toggle();
    });
  }

})(); // Fungsi init langsung dipanggil (IIFE)
