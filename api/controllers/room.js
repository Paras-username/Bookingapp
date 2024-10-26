import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import { createError } from "../utils/error.js";

export const createRoom = async (req, res, next) => {
    const hotelId = req.params.hotelid;
    const newRoom = new Room(req.body);
  
    try {
      const savedRoom = await newRoom.save();
      try {
        // Use $addToSet to avoid duplicate room IDs
        await Hotel.findByIdAndUpdate(hotelId, {
          $addToSet: { rooms: savedRoom._id },
        });
        res.status(200).json(savedRoom);
      } catch (err) {
        next(err);
      }
    } catch (err) {
      next(err);
    }
  };
  
export const updateRoom = async (req, res, next) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedRoom);
  } catch (err) {
    next(err);
  }
};

// export const updateRoomAvailability = async (req, res, next) => {
//   try {
//     await Room.updateOne(
//       { "roomNumbers._id": req.params.id },
//       {
//         $push: {
//           "roomNumbers.$.unavailableDates": req.body.dates
//         },
//       }
//     );
//     res.status(200).json("Room status has been updated.");
//   } catch (err) {
//     next(err);
//   }
// };

export const updateRoomAvailability = async (req, res, next) => {
  try {
    // Step 1: Find the room by roomNumber ID
    const room = await Room.findOne({ "roomNumbers._id": req.params.id });

    if (!room) {
      return res.status(404).json("Room not found.");
    }

    // Step 2: Extract the unavailableDates for the specific room
    const roomNumber = room.roomNumbers.id(req.params.id);
    const existingUnavailableDates = roomNumber.unavailableDates.map(date => new Date(date).getTime());

    // Step 3: Filter out any dates that already overlap with existing unavailableDates
    const newDates = req.body.dates.filter(date => !existingUnavailableDates.includes(new Date(date).getTime()));

    // Step 4: Only push the new non-overlapping dates to unavailableDates
    if (newDates.length > 0) { // Check if there are new dates to add
      await Room.updateOne(
        { "roomNumbers._id": req.params.id },
        {
          $push: {
            "roomNumbers.$.unavailableDates": { $each: newDates }
          }
        }
      );
    }

    // Step 5: Clear out old unavailable dates (optional)
    const today = new Date().getTime();
    await Room.updateOne(
      { "roomNumbers._id": req.params.id },
      {
        $pull: {
          "roomNumbers.$.unavailableDates": {
            $lt: today // Remove dates that are in the past
          }
        }
      }
    );

    // Step 6: Respond with success message
    res.status(200).json("Room status has been updated.");
  } catch (err) {
    next(err); // Pass the error to the error-handling middleware
  }
};

export const deleteRoom = async (req, res, next) => {
  const hotelId = req.params.hotelid;
  try {
    await Room.findByIdAndDelete(req.params.id);
    try {
      await Hotel.findByIdAndUpdate(hotelId, {
        $pull: { rooms: req.params.id },
      });
    } catch (err) {
      next(err);
    }
    res.status(200).json("Room has been deleted.");
  } catch (err) {
    next(err);
  }
};
export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    res.status(200).json(room);
  } catch (err) {
    next(err);
  }
};
export const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
};