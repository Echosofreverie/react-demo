const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  images: { type: [String], required: true },
  video: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  rejectionReason: { type: String },
  isDeleted: { type: Boolean, default: false, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Diary', diarySchema);