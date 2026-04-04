import express from "express";
import {
  createReservation,
  getReservations,
  getUserReservations,
  deleteReservation,
  verifyCheckIn,
  acceptCheckIn,
} from "../controllers/ReservationController.js";

const router = express.Router();

router.route("/").post(createReservation).get(getReservations);
router.route("/myreservations/:userId").get(getUserReservations);
router.route("/:id").delete(deleteReservation);
router.route("/verify-checkin").post(verifyCheckIn);
router.route("/accept-checkin").post(acceptCheckIn);
export default router;
