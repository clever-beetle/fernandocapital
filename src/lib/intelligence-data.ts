export interface PillarItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  href: string;
  capabilities: string[];
}

export interface CompanyResearchItem {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  intrinsicValue: number;
  per: number;
  pbv: number;
  roe: number;
  der: number;
  dividendYield: number;
  earningsGrowthYoY: string;
  verdict: "Undervalued" | "Fairly Valued" | "Premium / Core Holding";
  summary: string;
  earningsNote: string;
  macroSensitivity: string;
  lastUpdated: string;
  source: string;
}

export interface ConnectedMacroInsight {
  id: string;
  tag: string;
  title: string;
  date: string;
  source: string;
  summary: string;
  impacts: {
    equities: { direction: "Positif" | "Moderat" | "Tertekan"; detail: string; relatedTicker: string };
    bonds: { direction: "Positif" | "Netral" | "Tertekan"; detail: string };
    gold: { direction: "Bullish" | "Stabil" | "Koreksi"; detail: string };
  };
  linkedToolTab: "valuation" | "ratios" | "compound" | "gold" | "comparison";
  linkedToolLabel: string;
  linkedKnowledgeTitle: string;
}

export interface KnowledgeModule {
  id: string;
  category: string;
  title: string;
  level: "Fundamental" | "Intermediate" | "Institutional";
  readTime: string;
  summary: string;
  keyTakeaway: string;
  formulaOrPrinciple: string;
  linkedToolTab: "valuation" | "ratios" | "compound" | "gold" | "comparison";
  linkedToolLabel: string;
}

export interface AutomationMatrixRow {
  activity: string;
  automationLevel: "Bisa otomatis" | "AI-assisted" | "Human-led";
  humanRole: string;
  systemId: string;
}

export const FIVE_PILLARS: PillarItem[] = [
  {
    id: "equity-research",
    number: "01",
    title: "Equity & Company Research",
    subtitle: "Analisis perusahaan, fundamental, rasio keuangan, valuasi intrinsik, dan bedah laba.",
    href: "/#equity-research",
    capabilities: [
      "Company profiles",
      "Fundamental analysis",
      "Financial ratios",
      "Valuation",
      "Earnings analysis",
    ],
  },
  {
    id: "market-intelligence",
    number: "02",
    title: "Market Intelligence",
    subtitle: "Pemantauan pasar saham, emas & komoditas, valuta asing, obligasi, dan indikator ekonomi.",
    href: "/#market-intelligence",
    capabilities: [
      "Stock market",
      "Gold & commodities",
      "Currency & bonds",
      "Economic indicators",
      "Market outlook",
    ],
  },
  {
    id: "economic-insights",
    number: "03",
    title: "Economic Insights",
    subtitle: "Menghubungkan kebijakan bank sentral, inflasi, dan geopolitik dengan dampak lintas aset.",
    href: "/#economic-insights",
    capabilities: [
      "Macroeconomic analysis",
      "Inflation & interest rates",
      "Central bank policy",
      "Global economy",
      "Geopolitical developments",
    ],
  },
  {
    id: "financial-tools",
    number: "04",
    title: "Financial Data & Tools",
    subtitle: "Kalkulator valuasi, rasio saham, bunga majemuk, referensi emas fisik, dan komparasi emiten.",
    href: "/calculator",
    capabilities: [
      "Stock valuation calculator",
      "Financial ratio calculator",
      "Compound interest calculator",
      "Gold price reference",
      "Company comparison",
    ],
  },
  {
    id: "financial-knowledge",
    number: "05",
    title: "Financial Knowledge",
    subtitle: "Ensiklopedia investasi, laporan keuangan, akuntansi, makroekonomi, dan prinsip kekayaan.",
    href: "/#knowledge",
    capabilities: [
      "Investing fundamentals",
      "Financial statements",
      "Accounting concepts",
      "Economics",
      "Personal wealth principles",
    ],
  },
];

export const COMPANY_RESEARCH_LIST: CompanyResearchItem[] = [
  {
    ticker: "BBCA",
    name: "PT Bank Central Asia Tbk",
    sector: "Perbankan & Jasa Keuangan",
    price: 10250,
    intrinsicValue: 10900,
    per: 22.8,
    pbv: 4.9,
    roe: 21.5,
    der: 0.42,
    dividendYield: 2.8,
    earningsGrowthYoY: "+11.4% YoY",
    verdict: "Premium / Core Holding",
    summary:
      "Franchise dana murah (CASA >80%) terkuat di Indonesia dengan kualitas aset superior (LAR rendah) yang menjaga stabilitas NIM di berbagai siklus suku bunga.",
    earningsNote:
      "Pertumbuhan laba bersih ditopang ekspansi kredit korporasi & konsumer berkualitas tinggi serta efisiensi biaya dana.",
    macroSensitivity: "Diuntungkan oleh stabilitas daya beli domestik & likuiditas sistem perbankan.",
    lastUpdated: "Q3/2026 • Terverifikasi Editor",
    source: "Laporan Keuangan BEI & Riset Internal",
  },
  {
    ticker: "ANTM",
    name: "PT Aneka Tambang Tbk",
    sector: "Pertambangan Emas & Nikel",
    price: 1680,
    intrinsicValue: 2150,
    per: 11.4,
    pbv: 1.38,
    roe: 12.1,
    der: 0.35,
    dividendYield: 4.5,
    earningsGrowthYoY: "+18.2% YoY",
    verdict: "Undervalued",
    summary:
      "Memiliki eksposur langsung terhadap lonjakan volume penjualan emas batangan fisik Logam Mulia di tengah tren akumulasi safe-haven domestik.",
    earningsNote:
      "Segmen emas menyumbang kontribusi pendapatan dominan dengan perputaran kas cepat dan margin distribusi yang solid.",
    macroSensitivity: "Korelasi positif tinggi terhadap kenaikan spot XAU/USD dan lindung nilai inflasi.",
    lastUpdated: "Q3/2026 • Terverifikasi Editor",
    source: "Laporan Keuangan BEI & Data Komoditas",
  },
  {
    ticker: "BMRI",
    name: "PT Bank Mandiri (Persero) Tbk",
    sector: "Perbankan & Jasa Keuangan",
    price: 6850,
    intrinsicValue: 7800,
    per: 10.9,
    pbv: 2.35,
    roe: 21.6,
    der: 0.58,
    dividendYield: 5.2,
    earningsGrowthYoY: "+9.8% YoY",
    verdict: "Undervalued",
    summary:
      "Kombinasi ROE >21% dengan valuasi PER sekitar 11x dan imbal hasil dividen >5% menjadikan BMRI salah satu pemimpin efisiensi wholesale & digital banking (Livin'/Kopra).",
    earningsNote:
      "Pendapatan berbasis komisi (fee-based income) dari ekosistem digital tumbuh dua digit mengimbangi normalisasi biaya dana.",
    macroSensitivity: "Sensitif terhadap siklus belanja modal korporasi dan penurunan suku bunga acuan.",
    lastUpdated: "Q3/2026 • Terverifikasi Editor",
    source: "Laporan Keuangan BEI & Riset Internal",
  },
  {
    ticker: "TLKM",
    name: "PT Telkom Indonesia (Persero) Tbk",
    sector: "Infrastruktur Telekomunikasi & Data",
    price: 3120,
    intrinsicValue: 3950,
    per: 12.2,
    pbv: 2.15,
    roe: 17.6,
    der: 0.64,
    dividendYield: 5.8,
    earningsGrowthYoY: "+6.2% YoY",
    verdict: "Undervalued",
    summary:
      "Diperdagangkan di bawah rata-rata historis PER 5 tahun dengan arus kas bebas (free cash flow) kuat dari konsolidasi Fixed Mobile Convergence (FMC) dan pusat data B2B.",
    earningsNote:
      "Stabilisasi ARPU seluler dan efisiensi belanja modal pasca-integrasi IndiHome meningkatkan kapasitas pembagian dividen.",
    macroSensitivity: "Defensif terhadap fluktuasi komoditas; menarik saat imbal hasil obligasi melandai.",
    lastUpdated: "Q3/2026 • Terverifikasi Editor",
    source: "Laporan Keuangan BEI & Riset Internal",
  },
  {
    ticker: "ASII",
    name: "PT Astra International Tbk",
    sector: "Konglomerasi Otomotif, Alat Berat & Jasa Keuangan",
    price: 5150,
    intrinsicValue: 6100,
    per: 6.8,
    pbv: 1.02,
    roe: 15.1,
    der: 0.49,
    dividendYield: 7.4,
    earningsGrowthYoY: "+4.5% YoY",
    verdict: "Undervalued",
    summary:
      "Valuasi mendekati 1x nilai buku (PBV 1.02x) dengan diversifikasi arus kas dari pembiayaan otomotif, alat berat (UNTR), serta pertambangan emas & nikel.",
    earningsNote:
      "Divisi jasa keuangan dan pertambangan emas menjadi penopang utama laba di tengah moderasi penjualan kendaraan roda empat.",
    macroSensitivity: "Terbantu apabila penurunan suku bunga menurunkan bunga kredit pembiayaan konsumen.",
    lastUpdated: "Q3/2026 • Terverifikasi Editor",
    source: "Laporan Keuangan BEI & Riset Internal",
  },
];

export const CONNECTED_MACRO_INSIGHTS: ConnectedMacroInsight[] = [
  {
    id: "rate-cut-cycle",
    tag: "Central Bank Policy • Interest Rates",
    title: "Sinyal Pelonggaran Suku Bunga The Fed & Implikasinya terhadap BI-Rate",
    date: "22 November 2026",
    source: "Federal Reserve, Bank Indonesia & Konsensus Makro",
    summary:
      "Moderasi inflasi inti global membuka ruang penurunan suku bunga acuan secara bertahap. Biaya modal yang lebih rendah mengubah daya tarik relatif antara instrumen pasar uang, obligasi pemerintah, emas, dan ekuitas berdividen tinggi.",
    impacts: {
      equities: {
        direction: "Positif",
        detail:
          "Penurunan discount rate (WACC) menaikkan valuasi intrinsik saham perbankan besar (BMRI, BBCA) dan telekomunikasi berdividen tinggi (TLKM).",
        relatedTicker: "BMRI",
      },
      bonds: {
        direction: "Positif",
        detail:
          "Imbal hasil (yield) SBN 10 Tahun berpotensi turun sehingga harga obligasi pasar sekunder mengalami apresiasi modal (capital gain).",
      },
      gold: {
        direction: "Bullish",
        detail:
          "Penurunan imbal hasil riil (real yield) Dolar AS mengurangi opportunity cost memegang emas batangan tanpa kupon (XAU/USD & Antam).",
      },
    },
    linkedToolTab: "valuation",
    linkedToolLabel: "Uji Sensitivitas Valuasi Saham",
    linkedKnowledgeTitle: "Hubungan Suku Bunga, Discount Rate & Valuasi Aset",
  },
  {
    id: "central-bank-gold-demand",
    tag: "Global Economy • Commodities",
    title: "Rekor Akumulasi Cadangan Emas Bank Sentral & Premi Fisik Domestik",
    date: "22 November 2026",
    source: "World Gold Council, LBMA & Antam Logam Mulia",
    summary:
      "Diversifikasi cadangan devisa oleh bank sentral negara berkembang menciptakan batas bawah struktural (structural floor) bagi harga emas global di tengah dinamika geopolitik dan defisit fiskal negara maju.",
    impacts: {
      equities: {
        direction: "Moderat",
        detail:
          "Emiten produsen dan distributor emas terintegrasi seperti ANTM dan UNTR menikmati peningkatan harga jual rata-rata (ASP) dan volume transaksi.",
        relatedTicker: "ANTM",
      },
      bonds: {
        direction: "Netral",
        detail:
          "Permintaan lindung nilai inflasi mendorong investor menyeimbangkan portofolio antara SBN kupon tetap dan aset riil.",
      },
      gold: {
        direction: "Bullish",
        detail:
          "Harga fisik emas Antam pecahan 1g hingga 100g bergerak selaras dengan apresiasi spot XAU/USD ditambah komponen kurs USD/IDR.",
      },
    },
    linkedToolTab: "gold",
    linkedToolLabel: "Buka Referensi Emas & Kalkulator Antam",
    linkedKnowledgeTitle: "Mengapa Emas Menjadi Lindung Nilai Daya Beli Jangka Panjang",
  },
  {
    id: "domestic-credit-consumption",
    tag: "Macroeconomic Analysis • Domestic Growth",
    title: "Ketahanan Konsumsi Domestik, Likuiditas Perbankan & Siklus Valuasi Emiten",
    date: "21 November 2026",
    source: "BPS, OJK & Riset Sektoral Fernando Capital",
    summary:
      "Pertumbuhan kredit produktif dan terjaganya rasio kredit bermasalah (NPL) perbankan nasional menopang pertumbuhan laba bersih emiten blue-chip meskipun pasar global mengalami volatilitas.",
    impacts: {
      equities: {
        direction: "Positif",
        detail:
          "Emiten dengan ROE konsisten di atas 15% dan neraca konservatif (BBCA, BMRI, ASII) menawarkan margin of safety menarik bagi investor jangka panjang.",
        relatedTicker: "BBCA",
      },
      bonds: {
        direction: "Positif",
        detail:
          "Stabilitas makro domestik menjaga spread risiko kredit korporasi tetap ketat dan menarik arus modal asing ke pasar surat utang.",
      },
      gold: {
        direction: "Stabil",
        detail:
          "Berfungsi sebagai penyeimbang volatilitas portofolio (alokasi 10%–20%) mendampingi kepemilikan saham fundamental.",
      },
    },
    linkedToolTab: "comparison",
    linkedToolLabel: "Bandingkan Fundamental Emiten",
    linkedKnowledgeTitle: "Membaca Return on Equity (ROE) & Kualitas Laba Perusahaan",
  },
];

export const KNOWLEDGE_MODULES: KnowledgeModule[] = [
  {
    id: "intrinsic-value-mos",
    category: "Investing Fundamentals",
    title: "Nilai Intrinsik & Prinsip Margin of Safety",
    level: "Fundamental",
    readTime: "5 menit baca",
    summary:
      "Harga adalah apa yang Anda bayar, nilai adalah apa yang Anda dapatkan. Memahami selisih antara harga pasar dan nilai wajar bisnis melindungi portofolio dari risiko penurunan permanen.",
    keyTakeaway:
      "Selalu gunakan asumsi pertumbuhan konservatif dan terapkan diskon Margin of Safety minimal 15%–25% sebelum membeli saham.",
    formulaOrPrinciple: "Margin of Safety (%) = ((Nilai Intrinsik - Harga Pasar) / Nilai Intrinsik) × 100%",
    linkedToolTab: "valuation",
    linkedToolLabel: "Praktek di Kalkulator Valuasi",
  },
  {
    id: "financial-ratios-triad",
    category: "Financial Statements & Accounting",
    title: "Tiga Pilar Rasio Fundamental: PER, PBV, dan ROE",
    level: "Fundamental",
    readTime: "6 menit baca",
    summary:
      "Rasio P/E (PER) atau P/BV (PBV) yang rendah belum tentu murah jika tidak disandingkan dengan kemampuan perusahaan mencetak laba atas modal (ROE).",
    keyTakeaway:
      "Perusahaan dengan ROE tinggi yang mampu menginvestasikan kembali labanya akan menggandakan nilai buku jauh lebih cepat.",
    formulaOrPrinciple: "ROE = Laba Bersih / Ekuitas (atau ROE ≈ PBV / PER)",
    linkedToolTab: "ratios",
    linkedToolLabel: "Hitung di Kalkulator Rasio",
  },
  {
    id: "interest-rates-asset-pricing",
    category: "Economics",
    title: "Mekanisme Transmisi Suku Bunga ke Saham, Obligasi & Emas",
    level: "Institutional",
    readTime: "7 menit baca",
    summary:
      "Suku bunga bank sentral bertindak sebagai 'gravitasi' bagi seluruh kelas aset finansial. Ketika suku bunga bebas risiko naik, tingkat diskonto arus kas masa depan ikut meningkat.",
    keyTakeaway:
      "Pahami hubungan terbalik antara yield obligasi, tingkat diskonto valuasi saham, dan biaya peluang kepemilikan emas.",
    formulaOrPrinciple: "Present Value = ∑ [Arus Kas_t / (1 + Risk-Free Rate + Risk Premium)^t]",
    linkedToolTab: "comparison",
    linkedToolLabel: "Bandingkan Valuasi Lintas Sektor",
  },
  {
    id: "compound-wealth-gold-preserve",
    category: "Personal Wealth Principles",
    title: "Efek Bunga Majemuk (Compounding) & Preservasi Daya Beli dengan Emas",
    level: "Intermediate",
    readTime: "5 menit baca",
    summary:
      "Kekayaan dibangun melalui aset produktif yang tumbuh secara majemuk (saham/bisnis) dan dipertahankan daya belinya terhadap inflasi melalui aset riil (emas batangan).",
    keyTakeaway:
      "Waktu dan konsistensi alokasi modal jauh lebih menentukan hasil akhir dibandingkan mencoba menebak puncak dan dasar pasar jangka pendek.",
    formulaOrPrinciple: "FV = P × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]",
    linkedToolTab: "compound",
    linkedToolLabel: "Simulasi di Kalkulator Compounding",
  },
];

export const AUTOMATION_DELEGATION_MATRIX: AutomationMatrixRow[] = [
  {
    activity: "Mencari berita ekonomi",
    automationLevel: "Bisa otomatis",
    humanRole: "Memilih topik penting",
    systemId: "01",
  },
  {
    activity: "Mengumpulkan data pasar",
    automationLevel: "Bisa otomatis",
    humanRole: "Memeriksa sumber",
    systemId: "03",
  },
  {
    activity: "Membuat rangkuman berita",
    automationLevel: "Bisa otomatis",
    humanRole: "Review hasil",
    systemId: "01",
  },
  {
    activity: "Membuat draft artikel",
    automationLevel: "Bisa otomatis",
    humanRole: "Menyunting",
    systemId: "02",
  },
  {
    activity: "SEO dan metadata",
    automationLevel: "Bisa otomatis",
    humanRole: "Persetujuan",
    systemId: "02",
  },
  {
    activity: "Membuat grafik",
    automationLevel: "Bisa otomatis",
    humanRole: "Memeriksa interpretasi",
    systemId: "03",
  },
  {
    activity: "Mengirim newsletter",
    automationLevel: "Bisa otomatis",
    humanRole: "Menentukan isi",
    systemId: "04",
  },
  {
    activity: "Analisis fundamental saham",
    automationLevel: "AI-assisted",
    humanRole: "Memvalidasi analisis",
    systemId: "02",
  },
  {
    activity: "Valuasi perusahaan",
    automationLevel: "AI-assisted",
    humanRole: "Memeriksa asumsi",
    systemId: "03",
  },
  {
    activity: "Editorial dan opini",
    automationLevel: "AI-assisted",
    humanRole: "Menentukan perspektif",
    systemId: "02",
  },
  {
    activity: "Strategi bisnis",
    automationLevel: "Human-led",
    humanRole: "Mengambil keputusan",
    systemId: "05",
  },
];

export const FIVE_AUTOMATED_SYSTEMS = [
  {
    id: "01",
    name: "Market Intelligence Automation",
    status: "Active • Auto-Scan",
    description:
      "Memantau sumber informasi resmi seperti bank sentral (BI & The Fed), bursa efek, lembaga statistik, dan publikasi ekonomi.",
    outputs: [
      "Ringkasan perkembangan pasar",
      "Berita ekonomi penting",
      "Perubahan indikator makro",
      "Ide topik riset harian",
    ],
  },
  {
    id: "02",
    name: "AI Research & Writing",
    status: "Human-Gated • Review Queue",
    description:
      "Mengubah kumpulan sumber dan data tervalidasi menjadi materi editorial terstruktur. Setiap draft wajib menunggu persetujuan editor.",
    outputs: [
      "Research brief & executive summary",
      "Draft artikel analisis mendalam",
      "Tabel perbandingan emiten/aset",
      "Judul & SEO metadata otomatis",
    ],
  },
  {
    id: "03",
    name: "Financial Data Engine",
    status: "Live • 5-Min Sync",
    description:
      "Mengumpulkan dan mengolah data finansial deterministik dengan kode tervalidasi (bukan angka tebakan AI), lengkap dengan timestamp & sumber.",
    outputs: [
      "Harga emas spot (XAU/USD) & fisik Antam",
      "Indeks saham & kurs mata uang (USD/IDR)",
      "Rasio keuangan & valuasi tervalidasi",
      "Indikator makroekonomi berkala",
    ],
  },
  {
    id: "04",
    name: "Content Distribution",
    status: "Ready • Multi-Channel",
    description:
      "Mendistribusikan publikasi yang telah disetujui editor secara konsisten ke berbagai kanal pembaca.",
    outputs: [
      "Penjadwalan publikasi artikel",
      "Ringkasan thread & kartu media sosial",
      "Format buletin newsletter (Brevo-ready)",
      "Notifikasi rilis riset terbaru",
    ],
  },
  {
    id: "05",
    name: "Website Monitoring",
    status: "Healthy • 99.9% Uptime",
    description:
      "Memantau kesehatan teknis dan performa platform secara otomatis sehingga operasional harian tetap ringan.",
    outputs: [
      "Website uptime & status database Neon",
      "Pengecekan broken links & error halaman",
      "Performa Core Web Vitals & Vercel Speed",
      "Analitik trafik & riset terpopuler",
    ],
  },
];
