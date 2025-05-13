const User = require('../models/User');
const fs = require('fs'); // 引入 Node.js 文件系统模块
const path = require('path'); // 引入 path 模块

// --- Helper function to safely delete a file ---
const deleteFile = (filePath) => {
  const absolutePath = path.join(__dirname, '..', filePath); 
  const isDefaultAvatar = filePath === 'path/to/your/default/avatar.png'; // 修改为你的默认头像路径或判断逻辑

  if (filePath && !isDefaultAvatar && fs.existsSync(absolutePath)) {
    try {
      fs.unlinkSync(absolutePath);
      console.log(`文件已删除: ${absolutePath}`);
      return true;
    } catch (err) {
      console.error(`删除文件失败: ${absolutePath}`, err);
      return false;
    }
  }
  return false; // 文件不存在或无需删除
};

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
    const allowedFields = req.user.role === 'admin' ? ['username', 'avatar', 'role'] : ['username', 'avatar'];
    const filteredFields = {};
    Object.keys(otherFields).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredFields[key] = otherFields[key];
      }
    });

    // 更新非密码字段
    Object.assign(user, filteredFields);

    // 处理头像更新
    if (req.file && req.file.fieldname === 'avatar') {
      const newAvatarPath = req.file.path;
      if (user.avatar) {
        deleteFile(user.avatar);
      }
      user.avatar = newAvatarPath;
    }

    // 处理密码更新
    if (password) {
      user.password = password;
    }

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    res.json({ message: '用户信息更新成功', data: userResponse });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: '用户未找到' });
    }
    if (req.file) {
      deleteFile(req.file.path);
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
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '用户未找到' });
    }
    if (user.avatar) {
      deleteFile(user.avatar);
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: '用户已删除' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: '用户未找到' });
    }
    res.status(500).send('服务器错误');
  }
};

// 获取当前登录用户信息
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: '用户未找到' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

module.exports = {
  getAllUsers,
  getMe,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};