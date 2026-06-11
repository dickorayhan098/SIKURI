import { db, pool, usersTable, cplProdiTable, mataKuliahTable } from "./index";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "sikuri_salt_2025").digest("hex");
}

async function main() {
  console.log("Seeding database...");

  try {
    // ─────────────────────────────────────────
    // 1. Seed Users
    // ─────────────────────────────────────────
    const existingAdmin = await db.select().from(usersTable).limit(1);
    if (existingAdmin.length === 0) {
      await db.insert(usersTable).values({
        nama: "Administrator",
        email: "admin@sikuri.id",
        password: hashPassword("admin123"),
        role: "ADMIN",
        isAktif: true,
      });
      console.log("✓ Seeded default admin user (admin@sikuri.id / admin123)");
    } else {
      console.log("○ Default admin user already exists");
    }

    // ─────────────────────────────────────────
    // 2. Seed CPL Prodi (14 CPL dari sheet "3. CPL Prodi")
    // ─────────────────────────────────────────
    const cplCount = await db.select().from(cplProdiTable).limit(1);
    if (cplCount.length === 0) {
      await db.insert(cplProdiTable).values([
        {
          kode: "CPL01",
          deskripsi:
            "Mampu memahami, menganalisis, dan menilai konsep dasar dan peran sistem informasi dalam mengelola data dan memberikan rekomendasi pengambilan keputusan pada proses dan sistem organisasi.",
        },
        {
          kode: "CPL02",
          deskripsi:
            "Mampu merancang dan menggunakan database, serta mengolah dan menganalisa data dengan alat dan teknik pengolahan data.",
        },
        {
          kode: "CPL03",
          deskripsi:
            "Mampu memahami dan menggunakan berbagai metodologi pengembangan sistem beserta alat pemodelan sistem dan menganalisa kebutuhan pengguna dalam membangun sistem informasi untuk mencapai tujuan organisasi.",
        },
        {
          kode: "CPL04",
          deskripsi:
            "Mampu membuat perencanaan infrastruktur TI, arsitektur jaringan, layanan fisik dan cloud, menganalisa konsep identifikasi, otentikasi, otorisasi akses dalam konteks melindungi orang dan perangkat.",
        },
        {
          kode: "CPL05",
          deskripsi:
            "Mampu memahami dan menerapkan kode etik dalam penggunaan informasi dan data pada perancangan, implementasi, dan penggunaan suatu sistem.",
        },
        {
          kode: "CPL06",
          deskripsi:
            "Memiliki kemampuan merencanakan, menerapkan, memelihara dan meningkatkan sistem informasi organisasi untuk mencapai tujuan dan sasaran organisasi yang strategis baik jangka pendek maupun jangka panjang.",
        },
        {
          kode: "CPL07",
          deskripsi:
            "Mampu memahami, mengidentifikasi dan menerapkan konsep, teknik dan metodologi manajemen proyek sistem informasi.",
        },
        {
          kode: "CPL08",
          deskripsi:
            "Mampu memahami dan menerapkan konsep, metode, teknik, dan tahapan data mining serta visualisasi data dalam pengolahan data, pengorganisasian data, dan penyajian informasi yang efektif, efisien, dan estetik.",
        },
        {
          kode: "CPL09",
          deskripsi:
            "Mampu memahami dan menerapkan model sistem, metode dan berbagai teknik peningkatan bisnis proses, peluang inovasi digital dalam pengelolaan bisnis bidang kesehatan yang memanfaatkan teknologi.",
        },
        {
          kode: "CPL10",
          deskripsi:
            "Mampu menunjukkan sikap profesionalitas, integritas, dan berjati diri islami yang dilengkapi dengan kemampuan komunikasi, kepemimpinan, bekerja sama dan bertanggung jawab atas pekerjaan di bidang keahliannya, bermasyarakat, berbangsa, dan bernegara sebagai warga negara yang bangga dan cinta tanah air berlandaskan nilai ahlus sunah waljamahah.",
        },
        {
          kode: "CPL11",
          deskripsi:
            "Mampu menunjukkan sikap taat hukum, disiplin, dan menghargai keanekaragaman melalui internalisasi nilai, norma, etika akademik, semangat kemandirian, kejuangan, dan kewirausahaan.",
        },
        {
          kode: "CPL12",
          deskripsi:
            "Mampu menunjukkan kinerja mandiri, bermutu, terukur, berfikir logis, kritis, sistematis, dan inovatif, komunikatif dalam mengembangkan ilmu pengetahuan yang memperhatikan nilai humaniora sesuai bidang keahliannya.",
        },
        {
          kode: "CPL13",
          deskripsi:
            "Mampu mengkaji implikasi pengembangan ilmu pengetahuan dengan menerapkan keahliannya dalam rangka menghasilkan solusi, menyusun deskripsi saintifik hasil kajian dalam bentuk laporan ilmiah yang sahih dan original dan memelihara serta mengembangan jaringan kerja dengan pembimbing, kolega, sejawat baik di dalam maupun di luar lembaga.",
        },
        {
          kode: "CPL14",
          deskripsi:
            "Mampu melakukan evaluasi diri dan supervisi terhadap penyelesaian pekerjaan sebagai wujud tanggung jawab atas pencapaian hasil kelompok kerja.",
        },
      ]);
      console.log("✓ Seeded 14 CPL Prodi (CPL01–CPL14)");
    } else {
      console.log("○ CPL Prodi data already exists");
    }

    // ─────────────────────────────────────────
    // 3. Seed Mata Kuliah (49 MK dari sheet "11. Susunan Mata Kuliah")
    //    Semester ditentukan dari kolom 1–8 pada sheet tersebut.
    //    Tipe: WAJIB untuk MK wajib prodi; PILIHAN untuk MK pilihan.
    //    Kelompok: MKWK (MK Wajib Kurikulum), MKDU (MK Dasar Umum), PRODI.
    //    Referensi sheet "12. Organisasi Mata Kuliah" untuk klasifikasi.
    // ─────────────────────────────────────────
    const mkCount = await db.select().from(mataKuliahTable).limit(1);
    if (mkCount.length === 0) {
      await db.insert(mataKuliahTable).values([
        // ── Semester 1 ──────────────────────────────────────────────────
        { kode: "MK01", nama: "AGAMA",                              sks: 3, semester: 1, tipe: "WAJIB", kelompok: "MKWK"  },
        { kode: "MK02", nama: "PANCASILA",                          sks: 2, semester: 1, tipe: "WAJIB", kelompok: "MKWK"  },
        { kode: "MK03", nama: "BAHASA INDONESIA",                   sks: 2, semester: 1, tipe: "WAJIB", kelompok: "MKWK"  },
        { kode: "MK04", nama: "PENGANTAR SISTEM INFORMASI",         sks: 3, semester: 1, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK05", nama: "ALGORITMA DAN PEMROGRAMAN",          sks: 3, semester: 1, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK06", nama: "LITERASI TIK",                       sks: 2, semester: 1, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK07", nama: "MATEMATIKA DISKRIT",                  sks: 3, semester: 1, tipe: "WAJIB", kelompok: "PRODI" },

        // ── Semester 2 ──────────────────────────────────────────────────
        { kode: "MK08", nama: "ASWAJA",                             sks: 2, semester: 2, tipe: "WAJIB", kelompok: "MKDU"  },
        { kode: "MK09", nama: "KEWARGANEGARAAN",                    sks: 2, semester: 2, tipe: "WAJIB", kelompok: "MKWK"  },
        { kode: "MK10", nama: "LOGIKA DAN METODE BERFIKIR KRITIS",  sks: 2, semester: 2, tipe: "WAJIB", kelompok: "MKDU"  },
        { kode: "MK11", nama: "MANAJEMEN DATA",                     sks: 2, semester: 2, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK12", nama: "STRUKTUR DATA",                      sks: 2, semester: 2, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK13", nama: "SISTEM OPERASI",                     sks: 2, semester: 2, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK14", nama: "PENGANTAR MANAJEMEN",                sks: 3, semester: 2, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK15", nama: "MANAJEMEN PROSES BISNIS",            sks: 3, semester: 2, tipe: "WAJIB", kelompok: "PRODI" },

        // ── Semester 3 ──────────────────────────────────────────────────
        { kode: "MK16", nama: "KEWIRAUSAHAAN",                      sks: 3, semester: 3, tipe: "WAJIB", kelompok: "MKDU"  },
        { kode: "MK17", nama: "PENGANTAR AKUNTANSI",                sks: 3, semester: 3, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK18", nama: "PEMROGRAMAN BERORIENTASI OBJEK",     sks: 3, semester: 3, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK19", nama: "ANALISIS DAN PERANCANGAN SISTEM INFORMASI", sks: 3, semester: 3, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK20", nama: "DESAIN UI/UX",                       sks: 3, semester: 3, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK21", nama: "SISTEM DAN MANAJEMEN BASIS DATA",    sks: 4, semester: 3, tipe: "WAJIB", kelompok: "PRODI" },

        // ── Semester 4 ──────────────────────────────────────────────────
        { kode: "MK22", nama: "PEMROGRAMAN WEB",                    sks: 3, semester: 4, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK23", nama: "MANAJEMEN PROYEK SISTEM INFORMASI",  sks: 3, semester: 4, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK24", nama: "DATA SCIENCE",                       sks: 2, semester: 4, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK25", nama: "SISTEM ENTERPRISE",                  sks: 3, semester: 4, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK26", nama: "RINTISAN BISNIS DIGITAL",            sks: 3, semester: 4, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK27", nama: "DESAIN DAN MANAJEMEN JARINGAN KOMPUTER", sks: 3, semester: 4, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK28", nama: "RISET OPERASI",                      sks: 3, semester: 4, tipe: "WAJIB", kelompok: "PRODI" },

        // ── Semester 5 ──────────────────────────────────────────────────
        { kode: "MK29", nama: "PENGUJIAN PERANGKAT LUNAK",          sks: 3, semester: 5, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK30", nama: "MANAJEMEN INVESTASI TI",             sks: 3, semester: 5, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK31", nama: "PROTEKSI ASET INFORMASI",            sks: 3, semester: 5, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK32", nama: "DATA WAREHOUSE DAN DATA MINING",     sks: 3, semester: 5, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK33", nama: "TATA KELOLA TI",                     sks: 3, semester: 5, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK34", nama: "CAPSTONE PROJECT",                   sks: 4, semester: 5, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK35", nama: "STATISTIK",                          sks: 3, semester: 5, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK36", nama: "BAHASA INGGRIS",                     sks: 2, semester: 5, tipe: "WAJIB", kelompok: "MKDU"  },

        // ── Semester 6 ──────────────────────────────────────────────────
        { kode: "MK37", nama: "PERENCANAAN STRATEGIS SI/TI",        sks: 3, semester: 6, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK38", nama: "MANAJEMEN LAYANAN TI",               sks: 3, semester: 6, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK39", nama: "ETIKA PROFESI",                      sks: 2, semester: 6, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK47", nama: "PEMROGRAMAN MOBILE",                 sks: 3, semester: 6, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK48", nama: "INTERNET UNTUK SEGALA",              sks: 3, semester: 6, tipe: "WAJIB", kelompok: "PRODI" },

        // ── Semester 7 ──────────────────────────────────────────────────
        { kode: "MK40", nama: "MAGANG",                             sks: 5, semester: 7, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK41", nama: "METODOLOGI PENELITIAN",              sks: 3, semester: 7, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK42", nama: "KETERAMPILAN INTERPERSONAL",         sks: 2, semester: 7, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK43", nama: "KULIAH KERJA NYATA",                 sks: 2, semester: 7, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK49", nama: "TEKNOLOGI PEMROGRAMAN",              sks: 3, semester: 7, tipe: "WAJIB", kelompok: "PRODI" },

        // ── Semester 8 ──────────────────────────────────────────────────
        { kode: "MK44", nama: "TUGAS AKHIR",                        sks: 6, semester: 8, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK45", nama: "TEKNOLOGI DAN MASYARAKAT",           sks: 3, semester: 8, tipe: "WAJIB", kelompok: "PRODI" },
        { kode: "MK46", nama: "KULIAH LAPANGAN",                    sks: 2, semester: 8, tipe: "WAJIB", kelompok: "PRODI" },
      ]);
      console.log("✓ Seeded 49 Mata Kuliah (MK01–MK49)");
    } else {
      console.log("○ Mata Kuliah data already exists");
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await pool.end();
  }
}

main();
