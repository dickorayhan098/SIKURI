import { Router } from "express";
import { db, mkCplTable, cplBkTable, mkBahanKajianTable, cplProdiProfilLulusanTable, mkCpmkTable, mataKuliahTable, cplProdiTable, bahanKajianTable, profilLulusanTable, cpmkTable } from "@workspace/db";
import {
  TogglePemetaanCplMkBody, TogglePemetaanCplBkBody,
  TogglePemetaanBkMkBody, TogglePemetaanCplPlBody, TogglePemetaanMkCpmkBody,
} from "@workspace/api-zod";
import { eq, and } from "drizzle-orm";

const router = Router();

// ─── CPL ↔ MK ────────────────────────────────────────────────────────────────
router.get("/cpl-mk", async (req, res) => {
  try {
    const cpls = await db.select({ id: cplProdiTable.id, kode: cplProdiTable.kode }).from(cplProdiTable).orderBy(cplProdiTable.kode);
    const mataKuliahs = await db.select({ id: mataKuliahTable.id, kode: mataKuliahTable.kode, nama: mataKuliahTable.nama, semester: mataKuliahTable.semester }).from(mataKuliahTable).orderBy(mataKuliahTable.semester, mataKuliahTable.kode);
    const rels = await db.select().from(mkCplTable);

    const matrix: Record<number, Record<number, boolean>> = {};
    for (const mk of mataKuliahs) {
      matrix[mk.id] = {};
      for (const cpl of cpls) matrix[mk.id][cpl.id] = false;
    }
    for (const r of rels) {
      if (matrix[r.mkId]) matrix[r.mkId][r.cplId] = true;
    }

    res.json({ cpls, mataKuliahs, matrix });
  } catch (err) {
    req.log.error({ err }, "Failed to get pemetaan CPL-MK");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/cpl-mk/toggle", async (req, res) => {
  const body = TogglePemetaanCplMkBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const { rowId: mkId, colId: cplId } = body.data;
  try {
    const [existing] = await db.select().from(mkCplTable).where(and(eq(mkCplTable.mkId, mkId), eq(mkCplTable.cplId, cplId)));
    if (existing) {
      await db.delete(mkCplTable).where(and(eq(mkCplTable.mkId, mkId), eq(mkCplTable.cplId, cplId)));
      res.json({ active: false });
    } else {
      await db.insert(mkCplTable).values({ mkId, cplId });
      res.json({ active: true });
    }
  } catch (err) {
    req.log.error({ err }, "Failed to toggle pemetaan CPL-MK");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── CPL ↔ BK ────────────────────────────────────────────────────────────────
router.get("/cpl-bk", async (req, res) => {
  try {
    const cpls = await db.select({ id: cplProdiTable.id, kode: cplProdiTable.kode }).from(cplProdiTable).orderBy(cplProdiTable.kode);
    const bahanKajians = await db.select({ id: bahanKajianTable.id, kode: bahanKajianTable.kode, nama: bahanKajianTable.nama }).from(bahanKajianTable).orderBy(bahanKajianTable.kode);
    const rels = await db.select().from(cplBkTable);

    const matrix: Record<number, Record<number, boolean>> = {};
    for (const bk of bahanKajians) {
      matrix[bk.id] = {};
      for (const cpl of cpls) matrix[bk.id][cpl.id] = false;
    }
    for (const r of rels) {
      if (matrix[r.bkId]) matrix[r.bkId][r.cplId] = true;
    }

    res.json({ cpls, bahanKajians, matrix });
  } catch (err) {
    req.log.error({ err }, "Failed to get pemetaan CPL-BK");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/cpl-bk/toggle", async (req, res) => {
  const body = TogglePemetaanCplBkBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const { rowId: bkId, colId: cplId } = body.data;
  try {
    const [existing] = await db.select().from(cplBkTable).where(and(eq(cplBkTable.bkId, bkId), eq(cplBkTable.cplId, cplId)));
    if (existing) {
      await db.delete(cplBkTable).where(and(eq(cplBkTable.bkId, bkId), eq(cplBkTable.cplId, cplId)));
      res.json({ active: false });
    } else {
      await db.insert(cplBkTable).values({ cplId, bkId });
      res.json({ active: true });
    }
  } catch (err) {
    req.log.error({ err }, "Failed to toggle pemetaan CPL-BK");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── BK ↔ MK ────────────────────────────────────────────────────────────────
router.get("/bk-mk", async (req, res) => {
  try {
    const bahanKajians = await db.select({ id: bahanKajianTable.id, kode: bahanKajianTable.kode, nama: bahanKajianTable.nama }).from(bahanKajianTable).orderBy(bahanKajianTable.kode);
    const mataKuliahs = await db.select({ id: mataKuliahTable.id, kode: mataKuliahTable.kode, nama: mataKuliahTable.nama }).from(mataKuliahTable).orderBy(mataKuliahTable.kode);
    const rels = await db.select().from(mkBahanKajianTable);

    const matrix: Record<number, Record<number, boolean>> = {};
    for (const mk of mataKuliahs) {
      matrix[mk.id] = {};
      for (const bk of bahanKajians) matrix[mk.id][bk.id] = false;
    }
    for (const r of rels) {
      if (matrix[r.mkId]) matrix[r.mkId][r.bkId] = true;
    }

    res.json({ bahanKajians, mataKuliahs, matrix });
  } catch (err) {
    req.log.error({ err }, "Failed to get pemetaan BK-MK");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bk-mk/toggle", async (req, res) => {
  const body = TogglePemetaanBkMkBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const { rowId: mkId, colId: bkId } = body.data;
  try {
    const [existing] = await db.select().from(mkBahanKajianTable).where(and(eq(mkBahanKajianTable.mkId, mkId), eq(mkBahanKajianTable.bkId, bkId)));
    if (existing) {
      await db.delete(mkBahanKajianTable).where(and(eq(mkBahanKajianTable.mkId, mkId), eq(mkBahanKajianTable.bkId, bkId)));
      res.json({ active: false });
    } else {
      await db.insert(mkBahanKajianTable).values({ mkId, bkId });
      res.json({ active: true });
    }
  } catch (err) {
    req.log.error({ err }, "Failed to toggle pemetaan BK-MK");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── CPL ↔ PL ────────────────────────────────────────────────────────────────
router.get("/cpl-pl", async (req, res) => {
  try {
    const cpls = await db.select({ id: cplProdiTable.id, kode: cplProdiTable.kode }).from(cplProdiTable).orderBy(cplProdiTable.kode);
    const profilLulusans = await db.select({ id: profilLulusanTable.id, kode: profilLulusanTable.kode }).from(profilLulusanTable).orderBy(profilLulusanTable.kode);
    const rels = await db.select().from(cplProdiProfilLulusanTable);

    const matrix: Record<number, Record<number, boolean>> = {};
    for (const cpl of cpls) {
      matrix[cpl.id] = {};
      for (const pl of profilLulusans) matrix[cpl.id][pl.id] = false;
    }
    for (const r of rels) {
      if (matrix[r.cplProdiId]) matrix[r.cplProdiId][r.profilLulusanId] = true;
    }

    res.json({ cpls, profilLulusans, matrix });
  } catch (err) {
    req.log.error({ err }, "Failed to get pemetaan CPL-PL");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/cpl-pl/toggle", async (req, res) => {
  const body = TogglePemetaanCplPlBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const { rowId: cplProdiId, colId: profilLulusanId } = body.data;
  try {
    const [existing] = await db.select().from(cplProdiProfilLulusanTable).where(and(eq(cplProdiProfilLulusanTable.cplProdiId, cplProdiId), eq(cplProdiProfilLulusanTable.profilLulusanId, profilLulusanId)));
    if (existing) {
      await db.delete(cplProdiProfilLulusanTable).where(and(eq(cplProdiProfilLulusanTable.cplProdiId, cplProdiId), eq(cplProdiProfilLulusanTable.profilLulusanId, profilLulusanId)));
      res.json({ active: false });
    } else {
      await db.insert(cplProdiProfilLulusanTable).values({ cplProdiId, profilLulusanId });
      res.json({ active: true });
    }
  } catch (err) {
    req.log.error({ err }, "Failed to toggle pemetaan CPL-PL");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── MK ↔ CPMK ───────────────────────────────────────────────────────────────
router.post("/mk-cpmk/toggle", async (req, res) => {
  const body = TogglePemetaanMkCpmkBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const { rowId: mkId, colId: cpmkId } = body.data;
  try {
    const [existing] = await db.select().from(mkCpmkTable).where(and(eq(mkCpmkTable.mkId, mkId), eq(mkCpmkTable.cpmkId, cpmkId)));
    if (existing) {
      await db.delete(mkCpmkTable).where(and(eq(mkCpmkTable.mkId, mkId), eq(mkCpmkTable.cpmkId, cpmkId)));
      res.json({ active: false });
    } else {
      await db.insert(mkCpmkTable).values({ mkId, cpmkId });
      res.json({ active: true });
    }
  } catch (err) {
    req.log.error({ err }, "Failed to toggle pemetaan MK-CPMK");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Hierarki CPL → CPMK → MK ────────────────────────────────────────────────
router.get("/cpl-mk-cpmk", async (req, res) => {
  try {
    const cpls = await db.select().from(cplProdiTable).orderBy(cplProdiTable.kode);
    const result = await Promise.all(cpls.map(async (cpl) => {
      const cpmks = await db.select().from(cpmkTable).where(eq(cpmkTable.cplProdiId, cpl.id)).orderBy(cpmkTable.kode);
      const cpmksWithMk = await Promise.all(cpmks.map(async (cpmk) => {
        const mks = await db
          .select({ id: mataKuliahTable.id, kode: mataKuliahTable.kode, nama: mataKuliahTable.nama })
          .from(mkCpmkTable)
          .innerJoin(mataKuliahTable, eq(mataKuliahTable.id, mkCpmkTable.mkId))
          .where(eq(mkCpmkTable.cpmkId, cpmk.id));
        return { cpmkId: cpmk.id, cpmkKode: cpmk.kode, cpmkDeskripsi: cpmk.deskripsi, mataKuliahs: mks };
      }));
      return { cplId: cpl.id, cplKode: cpl.kode, cplDeskripsi: cpl.deskripsi, cpmks: cpmksWithMk };
    }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get hierarki CPL-CPMK-MK");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
