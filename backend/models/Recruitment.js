import mongoose from "mongoose";

const recruitmentSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },

    role: {
      type: String,
      required: [true, "Volunteer role is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Role description is required"],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Faculty or Admin
      required: true,
    },

    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // students applying for volunteer role
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Recruitment", recruitmentSchema);
