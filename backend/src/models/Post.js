const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 150 },
    author: { type: String, required: [true, 'Author is required'], trim: true, maxlength: 80 },
    content: { type: String, required: [true, 'Content is required'], trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
