import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilLulusanTable = pgTable("profil_lulusan", {
  id: serial("id").primaryKey(),
  kode: text("kode").notNull().unique(),
  deskripsi: text("deskripsi").notNull(),
  tipe: text("tipe"),
  referensi: text("referensi"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const bahanKajianTable = pgTable("bahan_kajian", {
  id: serial("id").primaryKey(),
  kode: text("kode").notNull().unique(),
  nama: text("nama").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cplSndiktiTable = pgTable("cpl_sndikti", {
  id: serial("id").primaryKey(),
  kode: text("kode").notNull().unique(),
  kelompok: text("kelompok").notNull(),
  deskripsi: text("deskripsi").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProfilLulusanSchema = createInsertSchema(profilLulusanTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBahanKajianSchema = createInsertSchema(bahanKajianTable).omit({ id: true, createdAt: true });
export const insertCplSndiktiSchema = createInsertSchema(cplSndiktiTable).omit({ id: true, createdAt: true });

export type ProfilLulusan = typeof profilLulusanTable.$inferSelect;
export type BahanKajian = typeof bahanKajianTable.$inferSelect;
export type CplSndikti = typeof cplSndiktiTable.$inferSelect;
export type InsertProfilLulusan = z.infer<typeof insertProfilLulusanSchema>;
export type InsertBahanKajian = z.infer<typeof insertBahanKajianSchema>;
