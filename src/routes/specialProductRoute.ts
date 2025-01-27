import express, { Router } from "express";
import { specialProductController } from "../controllers/specialProductController";

const router: Router = express.Router();

router.route("/best-offers").get(specialProductController.bestOffers);
router.route("/best-seller").get(specialProductController.bestSeller);
router.route("/live-search").get(specialProductController.liveSearch);
router
  .route("/recommended-products")
  .get(specialProductController.recommendedProducts);
router.route("/product-filters").get(specialProductController.productFilters);

export default router;
