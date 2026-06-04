import { Router } from "express";
import { db, profilLulusanTable, bahanKajianTable, cplSndiktiTable } from "@workspace/db";
import {
  CreateProfilLulusanBody, UpdateProfilLulusanBody, UpdateProfilLulusanParams, DeleteProfilLulusanParams,
  CreateBahanKajianBody, UpdateBahanKajianBody, UpdateBahanKajianParams, DeleteBahanKajianParams,
} from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router = Router();

// ─── Profil Lulusan ───────────────────────────────────────────────────────────
router.get("/profil-lulusan", async (req, res) => {
  try {
    const rows = await db.select().from(profilLulusanTable).orderBy(profilLulusanTable.kode);
    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list profil lulusan");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/profil-lulusan", async (req, res) => {
  const body = CreateProfilLulusanBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const [row] = await db.insert(profilLulusanTable).values(body.data).returning();
    res.status(201).json({ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create profil lulusan");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/profil-lulusan/:id", async (req, res) => {
  const params = UpdateProfilLulusanParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateProfilLulusanBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const [row] = await db.update(profilLulusanTable).set(body.data).where(eq(profilLulusanTable.id, params.data.id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update profil lulusan");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/profil-lulusan/:id", async (req, res) => {
  const params = DeleteProfilLulusanParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    await db.delete(profilLulusanTable).where(eq(profilLulusanTable.id, params.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete profil lulusan");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Bahan Kajian ─────────────────────────────────────────────────────────────
router.get("/bahan-kajian", async (req, res) => {
  try {
    const rows = await db.select().from(bahanKajianTable).orderBy(bahanKajianTable.kode);
    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list bahan kajian");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bahan-kajian", async (req, res) => {
  const body = CreateBahanKajianBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const [row] = await db.insert(bahanKajianTable).values(body.data).returning();
    res.status(201).json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create bahan kajian");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/bahan-kajian/:id", async (req, res) => {
  const params = UpdateBahanKajianParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateBahanKajianBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const [row] = await db.update(bahanKajianTable).set(body.data).where(eq(bahanKajianTable.id, params.data.id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update bahan kajian");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/bahan-kajian/:id", async (req, res) => {
  const params = DeleteBahanKajianParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    await db.delete(bahanKajianTable).where(eq(bahanKajianTable.id, params.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete bahan kajian");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── CPL SN-Dikti ─────────────────────────────────────────────────────────────
router.get("/cpl-sndikti", async (req, res) => {
  try {
    const rows = await db.select().from(cplSndiktiTable).orderBy(cplSndiktiTable.kelompok, cplSndiktiTable.kode);
    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list CPL SN-Dikti");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
