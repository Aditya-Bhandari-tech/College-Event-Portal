import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Announcement title is required"],
      trim: true,
    },

    message: {
      type: String,
      required: [true, "Announcement message is required"],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Faculty or Admin
      required: true,
    },

    branch: {
      type: String, // optional: IT, CS, ENTC OR "all"
      default: "all",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);
