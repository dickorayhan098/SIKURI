import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import mataKuliahRouter from "./mata-kuliah";
import cplRouter from "./cpl";
import cpmkRouter from "./cpmk";
import subCpmkRouter from "./sub-cpmk";
import referensiRouter from "./referensi";
import pemetaanRouter from "./pemetaan";
import rpsRouter from "./rps";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/dashboard", dashboardRouter);
router.use("/mata-kuliah", mataKuliahRouter);
router.use("/cpl", cplRouter);
router.use("/cpmk", cpmkRouter);
router.use("/sub-cpmk", subCpmkRouter);
router.use("/", referensiRouter);
router.use("/pemetaan", pemetaanRouter);
router.use("/rps", rpsRouter);
router.use("/users", usersRouter);
router.use("/", usersRouter);

export default router;
