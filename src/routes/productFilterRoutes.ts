import express, { Router } from "express";
import { productFilters } from "../controllers/productFilterController";

const router: Router = express.Router();

router.route("/").get(productFilters);

export default router;
