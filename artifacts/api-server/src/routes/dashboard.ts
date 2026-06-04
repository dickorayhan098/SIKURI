import { Router } from "express";
import { db } from "@workspace/db";
import {
  mataKuliahTable, rpsTable, cplProdiTable, cpmkTable,
  mkCplTable, subCpmkTable,
} from "@workspace/db";
import { eq, count, sum, sql } from "drizzle-orm";

const router = Router();

router.get("/stats", async (req, res) => {
  try {
    const [mkCount] = await db.select({ count: count() }).from(mataKuliahTable);
    const [cplCount] = await db.select({ count: count() }).from(cplProdiTable);
    const [cpmkCount] = await db.select({ count: count() }).from(cpmkTable);
    const [sksSum] = await db.select({ total: sum(mataKuliahTable.sks) }).from(mataKuliahTable);
    const [rpsCount] = await db.select({ count: count() }).from(rpsTable);
    const [rpsLengkapCount] = await db
      .select({ count: count() })
      .from(rpsTable)
      .where(eq(rpsTable.status, "LENGKAP"));

    res.json({
      totalMataKuliah: mkCount.count,
      totalCpl: cplCount.count,
      totalCpmk: cpmkCount.count,
      totalSks: Number(sksSum.total ?? 0),
      totalRps: rpsCount.count,
      rpsLengkap: rpsLengkapCount.count,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/sks-per-semester", async (req, res) => {
  try {
    const rows = await db
      .select({
        semester: mataKuliahTable.semester,
        totalSks: sum(mataKuliahTable.sks),
        jumlahMk: count(),
      })
      .from(mataKuliahTable)
      .groupBy(mataKuliahTable.semester)
      .orderBy(mataKuliahTable.semester);

    res.json(rows.map((r) => ({
      semester: r.semester,
      totalSks: Number(r.totalSks ?? 0),
      jumlahMk: r.jumlahMk,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get sks per semester");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/kelengkapan", async (req, res) => {
  try {
    const [mkTotal] = await db.select({ count: count() }).from(mataKuliahTable);
    const totalMk = mkTotal.count;

    // RPS tersusun
    const [rpsDone] = await db
      .select({ count: count() })
      .from(rpsTable)
      .where(sql`${rpsTable.status} IN ('DRAFT','REVIEW','LENGKAP','REVISI')`);

    // Pemetaan CPL-MK: MK yang punya minimal 1 CPL
    const mkWithCpl = await db
      .selectDistinct({ mkId: mkCplTable.mkId })
      .from(mkCplTable);

    // CPMK terdefinisi: MK yang punya CPMK
    const cpmkRows = await db
      .selectDistinct({ mkId: subCpmkTable.mkId })
      .from(subCpmkTable);

    // Sub-CPMK terisi
    const subCpmkRows = await db
      .selectDistinct({ mkId: subCpmkTable.mkId })
      .from(subCpmkTable);

    res.json({
      rpsTersusun: rpsDone.count,
      rpsTersusunTotal: totalMk,
      pemetaanCplMk: mkWithCpl.length,
      pemetaanCplMkTotal: totalMk,
      cpmkTerdefinisi: cpmkRows.length,
      cpmkTerdefinisiTotal: totalMk,
      bobotPenilaian: 0,
      bobotPenilaianTotal: totalMk,
      subCpmkTerisi: subCpmkRows.length,
      subCpmkTerisiTotal: totalMk,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get kelengkapan");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
