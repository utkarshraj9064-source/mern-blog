const express = require('express');
const Post = require('../models/Post');

const router = express.Router();

// GET /api/posts - list all posts (newest first)
router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/:id - single post
router.get('/:id', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// POST /api/posts - create post
router.post('/', async (req, res, next) => {
  try {
    const { title, author, content } = req.body;
    const post = await Post.create({ title, author, content });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

// PUT /api/posts/:id - update post
router.put('/:id', async (req, res, next) => {
  try {
    const { title, author, content } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, author, content },
      { new: true, runValidators: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/posts/:id - delete post
router.delete('/:id', async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
