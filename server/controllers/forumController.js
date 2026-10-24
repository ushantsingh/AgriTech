const ForumPost = require('../models/ForumPost');

// GET /api/forum
const getPosts = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      ForumPost.find(filter)
        .populate('author', 'name role')
        .populate('comments.author', 'name role')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      ForumPost.countDocuments(filter),
    ]);

    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// POST /api/forum
const createPost = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const post = await ForumPost.create({ author: req.user._id, title, content, category });
    const populated = await ForumPost.findById(post._id).populate('author', 'name role');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// GET /api/forum/:id
const getPost = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name role')
      .populate('comments.author', 'name role');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    next(error);
  }
};

// POST /api/forum/:id/comments
const addComment = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (!req.body.content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    post.comments.push({ author: req.user._id, content: req.body.content });
    await post.save();

    const updated = await ForumPost.findById(post._id)
      .populate('author', 'name role')
      .populate('comments.author', 'name role');
    res.status(201).json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/forum/:id
const deletePost = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Only author or admin can delete
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await ForumPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/forum/:id/comments/:commentId
const deleteComment = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    post.comments.pull(req.params.commentId);
    await post.save();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPosts, createPost, getPost, addComment, deletePost, deleteComment };
