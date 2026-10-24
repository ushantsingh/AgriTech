const router = require('express').Router();
const { getPosts, createPost, getPost, addComment, deletePost, deleteComment } = require('../controllers/forumController');
const { auth } = require('../middleware/auth');

router.get('/', getPosts);        // Public – view posts
router.get('/:id', getPost);      // Public – view single post

router.post('/', auth, createPost);
router.post('/:id/comments', auth, addComment);
router.delete('/:id', auth, deletePost);
router.delete('/:id/comments/:commentId', auth, deleteComment);

module.exports = router;
