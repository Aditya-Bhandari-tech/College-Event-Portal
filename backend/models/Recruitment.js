import mongoose from "mongoose";

const applicantSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: String, // optional message like "I have anchoring experience"
      default: "",
    },
    status: {
      type: String,
      enum: ["applied", "selected", "rejected"],
      default: "applied",
    },
  },
  { timestamps: true }
);

const recruitmentSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Recruitment title is required"],
      trim: true,
    },

    roleType: {
      type: String,
      enum: ["volunteer", "anchor", "coordinator", "technical", "other"],
      default: "volunteer",
    },

    description: {
      type: String,
      required: [true, "Recruitment description is required"],
    },

    branch: {
      type: String, // e.g. "CSE", "IT", "all"
      default: "all",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // faculty/admin
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    applicants: [applicantSchema],
  },
  { timestamps: true }
);

const Recruitment = mongoose.model("Recruitment", recruitmentSchema);

export default Recruitment;
