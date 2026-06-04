import { pgTable, text, serial, timestamp, integer, boolean, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { cplProdiTable, cpmkTable } from "./cpl";
import { bahanKajianTable } from "./referensi";

export const mataKuliahTable = pgTable("mata_kuliah", {
  id: serial("id").primaryKey(),
  kode: text("kode").notNull().unique(),
  nama: text("nama").notNull(),
  sks: integer("sks").notNull(),
  semester: integer("semester").notNull(),
  tipe: text("tipe").notNull(),
  kelompok: text("kelompok"),
  dosenPengampu: text("dosen_pengampu"),
  isAktif: boolean("is_aktif").notNull().default(true),
  mbkm: boolean("mbkm").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const mkBahanKajianTable = pgTable("mk_bahan_kajian", {
  mkId: integer("mk_id").notNull().references(() => mataKuliahTable.id, { onDelete: "cascade" }),
  bkId: integer("bk_id").notNull().references(() => bahanKajianTable.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.mkId, t.bkId] })]);

export const mkCplTable = pgTable("mk_cpl", {
  mkId: integer("mk_id").notNull().references(() => mataKuliahTable.id, { onDelete: "cascade" }),
  cplId: integer("cpl_id").notNull().references(() => cplProdiTable.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.mkId, t.cplId] })]);

export const mkCpmkTable = pgTable("mk_cpmk", {
  mkId: integer("mk_id").notNull().references(() => mataKuliahTable.id, { onDelete: "cascade" }),
  cpmkId: integer("cpmk_id").notNull().references(() => cpmkTable.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.mkId, t.cpmkId] })]);

export const cplBkTable = pgTable("cpl_bk", {
  cplId: integer("cpl_id").notNull().references(() => cplProdiTable.id, { onDelete: "cascade" }),
  bkId: integer("bk_id").notNull().references(() => bahanKajianTable.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.cplId, t.bkId] })]);

export const subCpmkTable = pgTable("sub_cpmk", {
  id: serial("id").primaryKey(),
  kode: text("kode").notNull(),
  cpmkId: integer("cpmk_id").notNull().references(() => cpmkTable.id, { onDelete: "cascade" }),
  mkId: integer("mk_id").notNull().references(() => mataKuliahTable.id, { onDelete: "cascade" }),
  deskripsi: text("deskripsi").notNull(),
  urutan: integer("urutan").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMataKuliahSchema = createInsertSchema(mataKuliahTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSubCpmkSchema = createInsertSchema(subCpmkTable).omit({ id: true, createdAt: true });

export type MataKuliah = typeof mataKuliahTable.$inferSelect;
export type SubCpmk = typeof subCpmkTable.$inferSelect;
export type InsertMataKuliah = z.infer<typeof insertMataKuliahSchema>;
export type InsertSubCpmk = z.infer<typeof insertSubCpmkSchema>;
