const mongoose = require("mongoose");

const remainderSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
    trim: true,
  },
  message: {
    type: String,
    require: true,
    trim: true,
  },
  sendTimer: {
    type: Date,
    require: true,
  },
  createdOn: {
    type: Date,
    require: true,
  },
  modifiedOn: {
    type: Date,
  },
  status: {
    type: Boolean,
    require: true,
  },
  userId: {
    type: String,
    require: true,
  },
  emailId: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: Number,
    required: true,
    trim: true,
  },
});

module.exports = mongoose.model("RemainderSchema", remainderSchema);
