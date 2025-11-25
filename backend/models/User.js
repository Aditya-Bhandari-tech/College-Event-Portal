import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
     match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
    },

    phone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Phone must be 10 digits']
    },


    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
    },

    branch: {
      type: String,
      default: null,      // Students/faculty may have branch
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
