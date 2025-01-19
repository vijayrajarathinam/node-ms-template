const mongoose = require("mongoose");
const argon2 = require("argon2");

const userField = { type: String, required: true, unique: true, trim: true };

const userSchema = new mongoose.Schema(
  {
    username: { ...userField },
    email: { ...userField, lowercase: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await argon2.hash(this.password);
    } catch (error) {
      return next(error);
    }
  }
});

userSchema.methods.comparePassword = async function (passwordInput) {
  try {
    return await argon2.verify(this.password, passwordInput);
  } catch (error) {
    throw error;
  }
};

userSchema.index({ username: "text" });

const User = mongoose.model("User", userSchema);
module.exports = User;
