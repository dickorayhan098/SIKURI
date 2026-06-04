import { Router } from "express";
import { db, cpmkTable, cplProdiTable } from "@workspace/db";
import {
  CreateCpmkBody, UpdateCpmkBody, UpdateCpmkParams,
  DeleteCpmkParams, ListCpmkQueryParams,
} from "@workspace/api-zod";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListCpmkQueryParams.safeParse(req.query);
    const params = query.success ? query.data : {};

    const rows = await db
      .select({
        id: cpmkTable.id,
        kode: cpmkTable.kode,
        cplProdiId: cpmkTable.cplProdiId,
        deskripsi: cpmkTable.deskripsi,
        createdAt: cpmkTable.createdAt,
        updatedAt: cpmkTable.updatedAt,
        cplKode: cplProdiTable.kode,
      })
      .from(cpmkTable)
      .leftJoin(cplProdiTable, eq(cplProdiTable.id, cpmkTable.cplProdiId))
      .where(params.cpl_id != null ? eq(cpmkTable.cplProdiId, params.cpl_id) : undefined)
      .orderBy(cpmkTable.kode);

    res.json(rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      cplKode: r.cplKode ?? null,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list CPMK");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const body = CreateCpmkBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const [row] = await db.insert(cpmkTable).values(body.data).returning();
    const [cpl] = await db.select({ kode: cplProdiTable.kode }).from(cplProdiTable).where(eq(cplProdiTable.id, row.cplProdiId));
    res.status(201).json({ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(), cplKode: cpl?.kode ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to create CPMK");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  const params = UpdateCpmkParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateCpmkBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const [row] = await db.update(cpmkTable).set(body.data).where(eq(cpmkTable.id, params.data.id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    const [cpl] = await db.select({ kode: cplProdiTable.kode }).from(cplProdiTable).where(eq(cplProdiTable.id, row.cplProdiId));
    res.json({ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(), cplKode: cpl?.kode ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to update CPMK");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const params = DeleteCpmkParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    await db.delete(cpmkTable).where(eq(cpmkTable.id, params.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete CPMK");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
