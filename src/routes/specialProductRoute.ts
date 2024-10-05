import express, { Router } from "express";
import { bestOffers } from "../controllers/bestOffersController";
import { bestSeller } from "../controllers/bestSellerController";
import { liveSearch } from "../controllers/liveSearchController";
import { recommendedProducts } from "../controllers/recommendController";
import { productFilters } from "../controllers/productFilterController";

const router: Router = express.Router();

router.route("/best-offers").get(bestOffers);
router.route("/best-seller").get(bestSeller);
router.route("/live-search").get(liveSearch);
router.route("/recommended-products").get(recommendedProducts);
router.route("/product-filters").get(productFilters);

export default router;
