import Reservation from "../models/ReservationModel.js";

// @desc    Create new reservation
export const createReservation = async (req, res) => {
  try {
    const { userId, date, time, seats, location, tableId } = req.body;

    const reservationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const reservation = new Reservation({
      userId,
      date,
      time,
      seats,
      location,
      tableId,
      reservationCode,
      status: "Confirmed",
    });

    const createdReservation = await reservation.save();
    res.status(201).json(createdReservation);
  } catch (error) {
    res.status(500).json({ message: "Error creating reservation", error: error.message });
  }
};

// @desc    Get all reservations
export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({}).populate("userId", "name email");
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reservations", error: error.message });
  }
};

// @desc    Get user reservations
export const getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.params.userId });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user reservations", error: error.message });
  }
};

// @desc    Cancel/Delete reservation
export const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (reservation) {
      await Reservation.deleteOne({ _id: req.params.id });
      res.json({ message: "Reservation removed" });
    } else {
      res.status(404).json({ message: "Reservation not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting reservation", error: error.message });
  }
};

// @desc    Verify Check-in
export const verifyCheckIn = async (req, res) => {
  try {
    const { email, reservationCode, tableId, location } = req.body;

    // Find reservation
    const reservation = await Reservation.findOne({ reservationCode, tableId: Number(tableId) }).populate("userId", "email fullName");

    if (!reservation) {
      return res.status(404).json({ message: "No reservation found with this code for this table." });
    }

    if (reservation.userId.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ message: "Email does not match the reservation." });
    }

    if (reservation.status === "Checked-In") {
      return res.status(400).json({ message: "Reservation is already checked in." });
    }

    // 30 minute rule check
    const now = new Date();
    const [timePart, modifier] = reservation.time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const resTimeMinutes = hours * 60 + minutes;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // To be perfectly accurate across midnight, this is simplified for the same day check.
    const diff = nowMinutes - resTimeMinutes;
    
    // Allow check-in only at or after the reserved time, up to 30 mins late
    if (diff < 0) {
      return res.status(400).json({ message: `You are too early. You can only check in at or after your reserved time (${reservation.time}).` });
    }
    if (diff > 30) {
      return res.status(400).json({ message: `Reservation expired. You are over 30 minutes late for your ${reservation.time} reservation.` });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: "Error verifying check-in", error: error.message });
  }
};

// @desc    Accept Check-in
export const acceptCheckIn = async (req, res) => {
  try {
    const { reservationCode } = req.body;
    const reservation = await Reservation.findOne({ reservationCode });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    reservation.status = "Checked-In";
    await reservation.save();

    res.json({ message: "Successfully checked in to your table!", reservation });
  } catch (error) {
    res.status(500).json({ message: "Error accepting check-in", error: error.message });
  }
};
