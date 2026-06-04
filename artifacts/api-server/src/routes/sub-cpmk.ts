import { Router } from "express";
import { db, subCpmkTable } from "@workspace/db";
import {
  CreateSubCpmkBody, UpdateSubCpmkBody, UpdateSubCpmkParams,
  DeleteSubCpmkParams, ListSubCpmkQueryParams,
} from "@workspace/api-zod";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListSubCpmkQueryParams.safeParse(req.query);
    const params = query.success ? query.data : {};

    const conditions = [];
    if (params.mk_id != null) conditions.push(eq(subCpmkTable.mkId, params.mk_id));
    if (params.cpmk_id != null) conditions.push(eq(subCpmkTable.cpmkId, params.cpmk_id));

    const rows = await db
      .select()
      .from(subCpmkTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(subCpmkTable.mkId, subCpmkTable.urutan);

    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list sub-CPMK");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const body = CreateSubCpmkBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const [row] = await db.insert(subCpmkTable).values(body.data).returning();
    res.status(201).json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create sub-CPMK");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  const params = UpdateSubCpmkParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateSubCpmkBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const [row] = await db.update(subCpmkTable).set(body.data).where(eq(subCpmkTable.id, params.data.id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update sub-CPMK");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const params = DeleteSubCpmkParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    await db.delete(subCpmkTable).where(eq(subCpmkTable.id, params.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete sub-CPMK");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
