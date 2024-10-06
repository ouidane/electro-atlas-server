"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const premissions_1 = require("../middleware/premissions");
const router = express_1.default.Router({ mergeParams: true });
router
    .route("/")
    .get(reviewController_1.getReviews)
    .post(premissions_1.authenticateUser, reviewController_1.createReview);
router
    .route("/:reviewId")
    .get(reviewController_1.getReviewById)
    .patch(premissions_1.authenticateUser, premissions_1.authorizeReviewAccess, reviewController_1.updateReview)
    .delete(premissions_1.authenticateUser, premissions_1.authorizeReviewAccess, reviewController_1.deleteReview);
exports.default = router;
//# sourceMappingURL=reviewRoute.js.map