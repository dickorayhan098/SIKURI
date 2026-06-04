import { Router } from "express";
import { db, cplProdiTable, cpmkTable, mkCplTable } from "@workspace/db";
import {
  CreateCplBody, UpdateCplBody, UpdateCplParams, DeleteCplParams,
  GetCplParams, CreateCpmkBody, UpdateCpmkBody, UpdateCpmkParams,
  DeleteCpmkParams, ListCpmkQueryParams,
} from "@workspace/api-zod";
import { eq, count, and } from "drizzle-orm";

const router = Router();

// ─── CPL Prodi ────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const rows = await db.select().from(cplProdiTable).orderBy(cplProdiTable.kode);

    const enriched = await Promise.all(rows.map(async (cpl) => {
      const [mkCount] = await db.select({ count: count() }).from(mkCplTable).where(eq(mkCplTable.cplId, cpl.id));
      const [cpmkCount] = await db.select({ count: count() }).from(cpmkTable).where(eq(cpmkTable.cplProdiId, cpl.id));
      return {
        ...cpl,
        createdAt: cpl.createdAt.toISOString(),
        updatedAt: cpl.updatedAt.toISOString(),
        jumlahMk: mkCount.count,
        jumlahCpmk: cpmkCount.count,
      };
    }));

    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to list CPL");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const body = CreateCplBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const [row] = await db.insert(cplProdiTable).values(body.data).returning();
    res.status(201).json({ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(), jumlahMk: 0, jumlahCpmk: 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to create CPL");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const params = GetCplParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    const [row] = await db.select().from(cplProdiTable).where(eq(cplProdiTable.id, params.data.id));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    const [mkCount] = await db.select({ count: count() }).from(mkCplTable).where(eq(mkCplTable.cplId, row.id));
    const [cpmkCount] = await db.select({ count: count() }).from(cpmkTable).where(eq(cpmkTable.cplProdiId, row.id));
    res.json({ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(), jumlahMk: mkCount.count, jumlahCpmk: cpmkCount.count });
  } catch (err) {
    req.log.error({ err }, "Failed to get CPL");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  const params = UpdateCplParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateCplBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const [row] = await db.update(cplProdiTable).set(body.data).where(eq(cplProdiTable.id, params.data.id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(), jumlahMk: 0, jumlahCpmk: 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to update CPL");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const params = DeleteCplParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    await db.delete(cplProdiTable).where(eq(cplProdiTable.id, params.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete CPL");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
