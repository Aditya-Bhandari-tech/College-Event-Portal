import mongoose from "mongoose";

const eventRequestSchema = new mongoose.Schema(
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

    venue: {
      type: String,
      required: [true, "Venue is required"],
    },

    branch: {
      type: String, // e.g. CSE, IT, all
      default: "all",
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // student who requested
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    reviewComment: {
      type: String,
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // faculty/admin who approved/rejected
    },

    // If approved and actual Event created, store its id
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },
  },
  { timestamps: true }
);

const EventRequest = mongoose.model("EventRequest", eventRequestSchema);

export default EventRequest;
