import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { mataKuliahTable, subCpmkTable } from "./mata-kuliah";
import { usersTable } from "./users";

export const rpsTable = pgTable("rps", {
  id: serial("id").primaryKey(),
  mkId: integer("mk_id").notNull().references(() => mataKuliahTable.id, { onDelete: "cascade" }),
  kodeDokumen: text("kode_dokumen"),
  tanggalPenyusunan: date("tanggal_penyusunan", { mode: "string" }),
  dosenPengembang: text("dosen_pengembang"),
  koordinatorBk: text("koordinator_bk"),
  kaprodi: text("kaprodi"),
  status: text("status").notNull().default("DRAFT"),
  versi: integer("versi").notNull().default(1),
  catatanRevisi: text("catatan_revisi"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  createdBy: integer("created_by").references(() => usersTable.id),
});

export const rpsPertemuanTable = pgTable("rps_pertemuan", {
  id: serial("id").primaryKey(),
  rpsId: integer("rps_id").notNull().references(() => rpsTable.id, { onDelete: "cascade" }),
  pertemuanKe: integer("pertemuan_ke").notNull(),
  subCpmkId: integer("sub_cpmk_id").references(() => subCpmkTable.id),
  materi: text("materi"),
  metodePembelajaran: text("metode_pembelajaran"),
  aktivitas: text("aktivitas"),
  media: text("media"),
  waktuMenit: integer("waktu_menit"),
  referensi: text("referensi"),
  indikator: text("indikator"),
  bobotNilai: integer("bobot_nilai"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRpsSchema = createInsertSchema(rpsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRpsPertemuanSchema = createInsertSchema(rpsPertemuanTable).omit({ id: true, createdAt: true });

export type Rps = typeof rpsTable.$inferSelect;
export type RpsPertemuan = typeof rpsPertemuanTable.$inferSelect;
export type InsertRps = z.infer<typeof insertRpsSchema>;
export type InsertRpsPertemuan = z.infer<typeof insertRpsPertemuanSchema>;
