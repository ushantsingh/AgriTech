const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const forumPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  category: {
    type: String,
    enum: ['general', 'crops', 'pest-control', 'equipment', 'consultation', 'market-prices'],
    default: 'general',
  },
  comments: [commentSchema],
}, { timestamps: true });

module.exports = mongoose.model('ForumPost', forumPostSchema);
