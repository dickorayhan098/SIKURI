import { pgTable, text, serial, timestamp, integer, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { profilLulusanTable, cplSndiktiTable } from "./referensi";

export const cplProdiTable = pgTable("cpl_prodi", {
  id: serial("id").primaryKey(),
  kode: text("kode").notNull().unique(),
  deskripsi: text("deskripsi").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const cplProdiSndiktiTable = pgTable("cpl_prodi_sndikti", {
  cplProdiId: integer("cpl_prodi_id").notNull().references(() => cplProdiTable.id, { onDelete: "cascade" }),
  cplSndiktiId: integer("cpl_sndikti_id").notNull().references(() => cplSndiktiTable.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.cplProdiId, t.cplSndiktiId] })]);

export const cplProdiProfilLulusanTable = pgTable("cpl_prodi_profil_lulusan", {
  cplProdiId: integer("cpl_prodi_id").notNull().references(() => cplProdiTable.id, { onDelete: "cascade" }),
  profilLulusanId: integer("profil_lulusan_id").notNull().references(() => profilLulusanTable.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.cplProdiId, t.profilLulusanId] })]);

export const cpmkTable = pgTable("cpmk", {
  id: serial("id").primaryKey(),
  kode: text("kode").notNull().unique(),
  cplProdiId: integer("cpl_prodi_id").notNull().references(() => cplProdiTable.id, { onDelete: "cascade" }),
  deskripsi: text("deskripsi").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCplProdiSchema = createInsertSchema(cplProdiTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCpmkSchema = createInsertSchema(cpmkTable).omit({ id: true, createdAt: true, updatedAt: true });

export type CplProdi = typeof cplProdiTable.$inferSelect;
export type Cpmk = typeof cpmkTable.$inferSelect;
export type InsertCplProdi = z.infer<typeof insertCplProdiSchema>;
export type InsertCpmk = z.infer<typeof insertCpmkSchema>;
