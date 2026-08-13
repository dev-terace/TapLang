import { Router } from "express";
import { translate } from "../controller/translator.controller";

const router = Router();

router.post("/", translate);

export default router;