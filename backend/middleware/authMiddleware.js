const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded.user;

      next();
    } catch (error) {
      console.error('Token 验证失败:', error.message);
      res.status(401).json({ message: '未认证，Token 无效或已过期' });
    }
  }

  if (!token) {
    res.status(401).json({ message: '未认证，没有提供 Token' });
  }
};

const isAdmin = (req, res, next) => {
  if(req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: '无权限访问，需要管理员角色' });
  }
};

const isReviewer = (req, res, next) => {
  if(req.user && (req.user.role === 'reviewer' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: '无权限访问，需要审核员或管理员角色' });
  }
};

module.exports = { protect, isAdmin, isReviewer };