"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bestOffersController_1 = require("../controllers/bestOffersController");
const bestSellerController_1 = require("../controllers/bestSellerController");
const liveSearchController_1 = require("../controllers/liveSearchController");
const recommendController_1 = require("../controllers/recommendController");
const productFilterController_1 = require("../controllers/productFilterController");
const router = express_1.default.Router();
router.route("/best-offers").get(bestOffersController_1.bestOffers);
router.route("/best-seller").get(bestSellerController_1.bestSeller);
router.route("/live-search").get(liveSearchController_1.liveSearch);
router.route("/recommended-products").get(recommendController_1.recommendedProducts);
router.route("/product-filters").get(productFilterController_1.productFilters);
exports.default = router;
//# sourceMappingURL=specialProductRoute.js.map