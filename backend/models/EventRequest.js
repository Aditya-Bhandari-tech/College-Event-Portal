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
      required: [true, "Proposed event date is required"],
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },

    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Faculty ID is required"],
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("EventRequest", eventRequestSchema);
