const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 示例路由
router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;