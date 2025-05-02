const User = require('../models/User');

// 获取所有用户
const getAllUsers = async (req, res) => {
  // 检查用户角色是否为管理员
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '只有管理员可以访问此接口' });
  }
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 根据 ID 获取用户
const getUserById = async (req, res) => {
  // 权限检查
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({ message: '无权限访问此用户信息' });
  }
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: '用户未找到' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: '用户未找到' });
    }
    res.status(500).send('服务器错误');
  }
};

// 创建用户
const createUser = async (req, res) => {
  // 检查用户角色是否为管理员
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '只有管理员可以创建用户' });
  }
  try {
    const newUser = new User(req.body);
    const user = await newUser.save();
    res.status(201).json(user);
  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError' || err.name === 'MongoServerError') {
      const errorMessages = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ message: errorMessages.join(', ') });
    }
    res.status(500).send('服务器错误');
  }
};

// 更新用户
const updateUser = async (req, res) => {
  // 权限检查
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({ message: '无权限更新此用户信息' });
  }

  try {
    const { password, ...otherFields } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: '用户未找到' });
    }

    // 过滤可更新字段
    const allowedFields = ['nickname', 'avatar'];
    const filteredFields = {};
    Object.keys(otherFields).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredFields[key] = otherFields[key];
      }
    });

    // 更新非密码字段
    Object.assign(user, filteredFields);

    // 处理密码更新
    if (password) {
      user.password = password;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: '用户未找到' });
    }
    res.status(500).send('服务器错误');
  }
};

// 删除用户
const deleteUser = async (req, res) => {
  // 检查用户角色是否为管理员
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '只有管理员可以删除用户' });
  }
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '用户未找到' });
    }
    res.json({ message: '用户已删除' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: '用户未找到' });
    }
    res.status(500).send('服务器错误');
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};