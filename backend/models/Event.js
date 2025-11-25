import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Event description is required"],
    },

    date: {
      type: Date,
      required: [true, "Event date is required"],
    },

    status: {
      type: String,
      enum: ["upcoming", "ongoing", "previous"],
      default: "upcoming",
    },

    branch: {
      type: String,   // IT, CS, ENTC, Mechanical, etc.
      default: "all", // If event is for whole college
    },

    image: {
      type: String,   // Cloudinary URL
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // faculty or admin
      required: true,
    },

    volunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // students who applied as volunteers
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
