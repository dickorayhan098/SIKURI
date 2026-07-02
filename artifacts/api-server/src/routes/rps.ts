import { Router } from "express";
import { db, rpsTable, rpsPertemuanTable, mataKuliahTable } from "@workspace/db";
import {
  CreateRpsBody, UpdateRpsBody, UpdateRpsParams, DeleteRpsParams,
  GetRpsParams, ListRpsQueryParams, UpdateRpsStatusBody,
} from "@workspace/api-zod";
import { eq, and } from "drizzle-orm";

const router = Router();

function formatRps(rps: typeof rpsTable.$inferSelect, mk?: { kode: string | null; nama: string | null; semester: number | null; dosenPengampu?: string | null }) {
  return {
    ...rps,
    mkKode: mk?.kode ?? null,
    mkNama: mk?.nama ?? null,
    mkSemester: mk?.semester ?? null,
    mkDosenPengampu: mk?.dosenPengampu ?? null,
    createdAt: rps.createdAt.toISOString(),
    updatedAt: rps.updatedAt.toISOString(),
    tanggalPenyusunan: rps.tanggalPenyusunan ?? null,
  };
}

router.get("/", async (req, res) => {
  try {
    const query = ListRpsQueryParams.safeParse(req.query);
    const params = query.success ? query.data : {};

    const conditions = [];
    if (params.status) conditions.push(eq(rpsTable.status, params.status));

    const rows = await db
      .select({
        rps: rpsTable,
        mkKode: mataKuliahTable.kode,
        mkNama: mataKuliahTable.nama,
        mkSemester: mataKuliahTable.semester,
        mkDosenPengampu: mataKuliahTable.dosenPengampu,
      })
      .from(rpsTable)
      .leftJoin(mataKuliahTable, eq(mataKuliahTable.id, rpsTable.mkId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(mataKuliahTable.semester, mataKuliahTable.kode);

    const filtered = params.semester != null
      ? rows.filter((r) => r.mkSemester === params.semester)
      : rows;

    res.json(filtered.map((r) => formatRps(r.rps, { kode: r.mkKode ?? null, nama: r.mkNama ?? null, semester: r.mkSemester ?? null, dosenPengampu: r.mkDosenPengampu ?? null })));
  } catch (err) {
    req.log.error({ err }, "Failed to list RPS");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const body = CreateRpsBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    if (body.data.tanggalPenyusunan) {
      const parsedDate = Date.parse(body.data.tanggalPenyusunan);
      if (Number.isNaN(parsedDate)) {
        res.status(400).json({ error: "Format tanggal penyusunan tidak valid. Contoh: YYYY-MM-DD" });
        return;
      }
    }

    const [row] = await db.insert(rpsTable).values({
      mkId: body.data.mkId,
      kodeDokumen: body.data.kodeDokumen ?? null,
      tanggalPenyusunan: body.data.tanggalPenyusunan ?? null,
      dosenPengembang: body.data.dosenPengembang ?? null,
      koordinatorBk: body.data.koordinatorBk ?? null,
      kaprodi: body.data.kaprodi ?? null,
    }).returning();
    res.status(201).json(formatRps(row));
  } catch (err) {
    req.log.error({ err }, "Failed to create RPS");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const params = GetRpsParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    const [row] = await db
      .select({ rps: rpsTable, mkKode: mataKuliahTable.kode, mkNama: mataKuliahTable.nama, mkSemester: mataKuliahTable.semester, mkDosenPengampu: mataKuliahTable.dosenPengampu })
      .from(rpsTable)
      .leftJoin(mataKuliahTable, eq(mataKuliahTable.id, rpsTable.mkId))
      .where(eq(rpsTable.id, params.data.id));

    if (!row) { res.status(404).json({ error: "Not found" }); return; }

    const pertemuans = await db.select().from(rpsPertemuanTable).where(eq(rpsPertemuanTable.rpsId, params.data.id)).orderBy(rpsPertemuanTable.pertemuanKe);

    res.json({
      ...formatRps(row.rps, { kode: row.mkKode ?? null, nama: row.mkNama ?? null, semester: row.mkSemester ?? null, dosenPengampu: row.mkDosenPengampu ?? null }),
      pertemuans: pertemuans.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get RPS");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  const params = UpdateRpsParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateRpsBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const updateData: Record<string, unknown> = {};
    if (body.data.kodeDokumen !== undefined) updateData.kodeDokumen = body.data.kodeDokumen;
    if (body.data.tanggalPenyusunan !== undefined) {
      if (body.data.tanggalPenyusunan !== null && body.data.tanggalPenyusunan !== "") {
        const parsedDate = Date.parse(body.data.tanggalPenyusunan as string);
        if (Number.isNaN(parsedDate)) {
          res.status(400).json({ error: "Format tanggal penyusunan tidak valid. Contoh: YYYY-MM-DD" });
          return;
        }
      }
      updateData.tanggalPenyusunan = body.data.tanggalPenyusunan;
    }
    if (body.data.dosenPengembang !== undefined) updateData.dosenPengembang = body.data.dosenPengembang;
    if (body.data.koordinatorBk !== undefined) updateData.koordinatorBk = body.data.koordinatorBk;
    if (body.data.kaprodi !== undefined) updateData.kaprodi = body.data.kaprodi;
    if (body.data.catatanRevisi !== undefined) updateData.catatanRevisi = body.data.catatanRevisi;

    const [row] = await db.update(rpsTable).set(updateData).where(eq(rpsTable.id, params.data.id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatRps(row));
  } catch (err) {
    req.log.error({ err }, "Failed to update RPS");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const params = DeleteRpsParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    await db.delete(rpsTable).where(eq(rpsTable.id, params.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete RPS");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/pertemuan", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const rows = await db.select().from(rpsPertemuanTable).where(eq(rpsPertemuanTable.rpsId, id)).orderBy(rpsPertemuanTable.pertemuanKe);
    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list pertemuan");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/pertemuan", async (req, res) => {
  const rpsId = Number(req.params.id);
  const { pertemuans } = req.body as { pertemuans: Array<{ pertemuanKe: number;[key: string]: unknown }> };
  if (!Array.isArray(pertemuans)) { res.status(400).json({ error: "pertemuans must be array" }); return; }

  try {
    await db.delete(rpsPertemuanTable).where(eq(rpsPertemuanTable.rpsId, rpsId));

    if (pertemuans.length > 0) {
      const inserts = pertemuans.map((p) => ({
        rpsId,
        pertemuanKe: p.pertemuanKe,
        subCpmkId: (p.subCpmkId as number | null) ?? null,
        materi: (p.materi as string | null) ?? null,
        metodePembelajaran: (p.metodePembelajaran as string | null) ?? null,
        aktivitas: (p.aktivitas as string | null) ?? null,
        media: (p.media as string | null) ?? null,
        waktuMenit: (p.waktuMenit as number | null) ?? null,
        referensi: (p.referensi as string | null) ?? null,
        indikator: (p.indikator as string | null) ?? null,
        bobotNilai: (p.bobotNilai as number | null) ?? null,
      }));
      await db.insert(rpsPertemuanTable).values(inserts);
    }

    const rows = await db.select().from(rpsPertemuanTable).where(eq(rpsPertemuanTable.rpsId, rpsId)).orderBy(rpsPertemuanTable.pertemuanKe);
    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to upsert pertemuan");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const body = UpdateRpsStatusBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const [row] = await db.update(rpsTable).set({ status: body.data.status }).where(eq(rpsTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatRps(row));
  } catch (err) {
    req.log.error({ err }, "Failed to update RPS status");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
