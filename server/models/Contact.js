const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    category: { type: String, trim: true },
    notes: { type: String, trim: true },
    photo: { type: String, maxlength: 2000000 },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
    isFavourite: { type: Boolean, default: false },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Contact", contactSchema);