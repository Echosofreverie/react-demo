const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 登录
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: '用户不存在' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: '密码错误' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 注册
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let userN  = await User.findOne({ username });
    if (userN) {
      return res.status(400).json({ message: '此用户名已被注册，请选择其他唯一的用户名。' });
    }
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: '此邮箱地址已被注册，请使用该邮箱进行登录。' });
    }

    user = new User({  username, email, password });
    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

module.exports = {
  login,
  register
};