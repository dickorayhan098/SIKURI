import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import {
  CreateUserBody, UpdateUserBody, UpdateUserParams, DeleteUserParams,
  LoginBody,
} from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "sikuri_salt_2025").digest("hex");
}

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    nama: u.nama,
    email: u.email,
    role: u.role,
    isAktif: u.isAktif,
    lastLogin: u.lastLogin?.toISOString() ?? null,
    createdAt: u.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    const rows = await db.select().from(usersTable).orderBy(usersTable.nama);
    res.json(rows.map(formatUser));
  } catch (err) {
    req.log.error({ err }, "Failed to list users");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const body = CreateUserBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const [row] = await db.insert(usersTable).values({
      nama: body.data.nama,
      email: body.data.email,
      password: hashPassword(body.data.password),
      role: body.data.role,
      isAktif: body.data.isAktif ?? true,
    }).returning();
    res.status(201).json(formatUser(row));
  } catch (err) {
    req.log.error({ err }, "Failed to create user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  const params = UpdateUserParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateUserBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const [row] = await db.update(usersTable).set(body.data).where(eq(usersTable.id, params.data.id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatUser(row));
  } catch (err) {
    req.log.error({ err }, "Failed to update user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const params = DeleteUserParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    await db.delete(usersTable).where(eq(usersTable.id, params.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete user");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post("/auth/login", async (req, res) => {
  const body = LoginBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid input" }); return; }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, body.data.email));
    if (!user || user.password !== hashPassword(body.data.password)) {
      res.status(401).json({ error: "Email atau password salah" }); return;
    }
    if (!user.isAktif) { res.status(401).json({ error: "Akun tidak aktif" }); return; }

    await db.update(usersTable).set({ lastLogin: new Date() }).where(eq(usersTable.id, user.id));

    const token = Buffer.from(`${user.id}:${user.role}:${Date.now()}`).toString("base64");
    res.json({ user: formatUser(user), token });
  } catch (err) {
    req.log.error({ err }, "Failed to login");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (req, res) => {
  res.json({ message: "Logged out" });
});

router.get("/auth/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }

  try {
    const token = authHeader.slice(7);
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const userId = parseInt(decoded.split(":")[0]);
    if (isNaN(userId)) { res.status(401).json({ error: "Invalid token" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) { res.status(401).json({ error: "User not found" }); return; }
    res.json(formatUser(user));
  } catch (err) {
    req.log.error({ err }, "Failed to get me");
    res.status(401).json({ error: "Unauthorized" });
  }
});

export default router;
