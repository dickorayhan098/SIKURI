import { Router } from "express";
import { db, mataKuliahTable, rpsTable } from "@workspace/db";
import {
  CreateMataKuliahBody,
  UpdateMataKuliahBody,
  UpdateMataKuliahParams,
  DeleteMataKuliahParams,
  GetMataKuliahParams,
  ListMataKuliahQueryParams,
} from "@workspace/api-zod";
import { eq, ilike, and, type SQL } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListMataKuliahQueryParams.safeParse(req.query);
    const params = query.success ? query.data : {};

    const conditions: SQL[] = [];
    if (params.semester != null) conditions.push(eq(mataKuliahTable.semester, params.semester));
    if (params.tipe) conditions.push(eq(mataKuliahTable.tipe, params.tipe));
    if (params.search) conditions.push(ilike(mataKuliahTable.nama, `%${params.search}%`));

    const rows = await db
      .select({
        id: mataKuliahTable.id,
        kode: mataKuliahTable.kode,
        nama: mataKuliahTable.nama,
        sks: mataKuliahTable.sks,
        semester: mataKuliahTable.semester,
        tipe: mataKuliahTable.tipe,
        kelompok: mataKuliahTable.kelompok,
        dosenPengampu: mataKuliahTable.dosenPengampu,
        isAktif: mataKuliahTable.isAktif,
        mbkm: mataKuliahTable.mbkm,
        createdAt: mataKuliahTable.createdAt,
        updatedAt: mataKuliahTable.updatedAt,
        statusRps: rpsTable.status,
      })
      .from(mataKuliahTable)
      .leftJoin(rpsTable, eq(rpsTable.mkId, mataKuliahTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(mataKuliahTable.semester, mataKuliahTable.kode);

    res.json(rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      statusRps: r.statusRps ?? null,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list mata kuliah");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const body = CreateMataKuliahBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input", details: body.error }); return; }

  try {
    const [row] = await db
      .insert(mataKuliahTable)
      .values({
        kode: body.data.kode,
        nama: body.data.nama,
        sks: body.data.sks,
        semester: body.data.semester,
        tipe: body.data.tipe,
        kelompok: body.data.kelompok ?? null,
        dosenPengampu: body.data.dosenPengampu ?? null,
        isAktif: body.data.isAktif ?? true,
        mbkm: body.data.mbkm ?? false,
      })
      .returning();

    res.status(201).json({
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      statusRps: null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create mata kuliah");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const params = GetMataKuliahParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    const [row] = await db
      .select({
        id: mataKuliahTable.id,
        kode: mataKuliahTable.kode,
        nama: mataKuliahTable.nama,
        sks: mataKuliahTable.sks,
        semester: mataKuliahTable.semester,
        tipe: mataKuliahTable.tipe,
        kelompok: mataKuliahTable.kelompok,
        dosenPengampu: mataKuliahTable.dosenPengampu,
        isAktif: mataKuliahTable.isAktif,
        mbkm: mataKuliahTable.mbkm,
        createdAt: mataKuliahTable.createdAt,
        updatedAt: mataKuliahTable.updatedAt,
        statusRps: rpsTable.status,
      })
      .from(mataKuliahTable)
      .leftJoin(rpsTable, eq(rpsTable.mkId, mataKuliahTable.id))
      .where(eq(mataKuliahTable.id, params.data.id));

    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      statusRps: row.statusRps ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get mata kuliah");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  const params = UpdateMataKuliahParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateMataKuliahBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const [row] = await db
      .update(mataKuliahTable)
      .set({
        ...(body.data.kode !== undefined && { kode: body.data.kode }),
        ...(body.data.nama !== undefined && { nama: body.data.nama }),
        ...(body.data.sks !== undefined && { sks: body.data.sks }),
        ...(body.data.semester !== undefined && { semester: body.data.semester }),
        ...(body.data.tipe !== undefined && { tipe: body.data.tipe }),
        ...(body.data.kelompok !== undefined && { kelompok: body.data.kelompok }),
        ...(body.data.dosenPengampu !== undefined && { dosenPengampu: body.data.dosenPengampu }),
        ...(body.data.isAktif !== undefined && { isAktif: body.data.isAktif }),
        ...(body.data.mbkm !== undefined && { mbkm: body.data.mbkm }),
      })
      .where(eq(mataKuliahTable.id, params.data.id))
      .returning();

    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      statusRps: null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update mata kuliah");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const params = DeleteMataKuliahParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    await db.delete(mataKuliahTable).where(eq(mataKuliahTable.id, params.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete mata kuliah");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
