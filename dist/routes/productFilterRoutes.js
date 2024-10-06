"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productFilterController_1 = require("../controllers/productFilterController");
const router = express_1.default.Router();
router.route("/").get(productFilterController_1.productFilters);
exports.default = router;
//# sourceMappingURL=productFilterRoutes.js.map