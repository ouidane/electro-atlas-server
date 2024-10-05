import express, { Router } from "express";
import { getNavData } from "../controllers/navDataController";

const router: Router = express.Router();

router.route("/").get(getNavData);

export default router;
