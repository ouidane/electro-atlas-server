import express, { Router } from "express";
import { reviewController } from "../controllers/reviewController";
import {
  authenticateUser,
  authorizeReviewAccess,
} from "../middlewares/premissions";
import {
  validateCreateReview,
  validateUpdateReview,
} from "../middlewares/validateReview";

const router: Router = express.Router({ mergeParams: true });

router.route("/").get(reviewController.getReviews).post(
  authenticateUser,
  validateCreateReview,

  reviewController.createReview
);

router
  .route("/:reviewId")
  .get(reviewController.getReviewById)
  .patch(
    authenticateUser,
    authorizeReviewAccess,
    validateUpdateReview,
    reviewController.updateReview
  )
  .delete(
    authenticateUser,
    authorizeReviewAccess,
    reviewController.deleteReview
  );

export default router;
