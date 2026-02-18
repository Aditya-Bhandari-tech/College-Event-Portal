import mongoose from "mongoose";
import bcrypt from "bcryptjs";  

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please provide a valid email",
    ],
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },

  phone: {
    type: String,
    match: [/^\d{10}$/, "Phone must be 10 digits"],
    required: false,
  },

  branch: {
    type: String,
    required: [true, "Branch is required"],
  },

  year: {
    type: String,
    enum: ["First Year", "Second Year", "Third Year"],
    // only students need to specify year
    required: function() {
      return this.role === "student";
    }
  },

  role: {
  type: String,
  enum: ["student", "faculty", "admin"],
  default: "student"
},
isApproved: {
  type: Boolean,
  default: function() {
    return this.role === "student";
  }
},
profilePic: {
  public_id: String,
  url: String,
}


});


/**
 * 🔐 Pre-save hook
 * This runs automatically BEFORE saving a user (create or save).
 * It will hash the password if it was modified/added.
 */


// ✅ Pre-save hook WITHOUT 'next'
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ✅ Password compare method
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
