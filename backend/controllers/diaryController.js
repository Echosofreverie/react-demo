const Diary = require('../models/Diary');
const User = require('../models/User'); 
const fs = require('fs');
const path = require('path');

// 获取所有日记
const getApprovedDiariesPublic = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query;
    if (search) {
      const users = await User.find({ nickname: { $regex: search, $options: 'i' } }).select('_id');
      const userIds = users.map(user => user._id);
      query = {
        status: 'approved',
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { author: { $in: userIds } }
        ]
      };
    } else {
      query = { status: 'approved' };
    }

    const diaries = await Diary.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'nickname avatar');

    res.status(200).json({ message: '获取已通过日记', data: diaries });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 创建新日记
const createDiary = async (req, res) => {
  try {
    const { title, content } = req.body;
    const images = req.files?.images?.map(file => file.path) || [];
    const video = req.file?.path;

    if (!title || !content || images.length === 0) {
      return res.status(400).json({ message: '标题、内容和图片为必填项' });
    }

    const newDiary = new Diary({ title, content, images, video, author: req.user._id, status: 'pending' });
    await newDiary.save();

    res.status(201).json({ message: '日记创建成功', data: newDiary });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 根据 ID 获取日记
const getDiaryById = async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id).populate('author', 'nickname avatar');
    if (!diary) {
      return res.status(404).json({ message: '日记未找到' });
    }
    // 权限检查
    if (diary.status !== 'approved' && req.user._id.toString() !== diary.author._id.toString() && !['reviewer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: '无访问权限' });
    }
    res.status(200).json({ message: '获取日记成功', data: diary });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 更新日记
const updateDiary = async (req, res) => {
  try {
    const { title, content } = req.body;
    const diary = await Diary.findById(req.params.id);
    if (!diary) {
      return res.status(404).json({ message: '日记未找到' });
    }
    if (diary.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '无权限更新此日记' });
    }
    if (diary.status !== 'pending' && diary.status !== 'rejected') {
      return res.status(403).json({ message: '只有待审核或未通过的日记才能编辑' });
    }

    // 处理新上传的图片
    if (req.files && req.files.images) {
      // 删除旧图片
      diary.images.forEach(image => {
        if (fs.existsSync(image)) {
          fs.unlinkSync(image);
        }
      });
      diary.images = req.files.images.map(file => file.path);
    }

    // 处理新上传的视频
    if (req.file && req.file.fieldname === 'video') {
      // 删除旧视频
      if (diary.video && fs.existsSync(diary.video)) {
        fs.unlinkSync(diary.video);
      }
      diary.video = req.file.path;
    }

    diary.title = title || diary.title;
    diary.content = content || diary.content;
    diary.status = 'pending'; // 重置为待审核
    diary.rejectionReason = ''; // 清除之前的拒绝原因（如果之前是 rejected）

    await diary.save();
    res.status(200).json({ message: '日记更新成功', data: diary });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 删除日记
const deleteDiary = async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id);
    if (!diary) {
      return res.status(404).json({ message: '日记未找到' });
    }
    if (diary.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权限删除此日记' });
    }
    if (diary) {
      // 清理图片文件
      diary.images.forEach(image => {
        if (fs.existsSync(image)) {
          fs.unlinkSync(image);
        }
      });
      // 清理视频文件
      if (diary.video && fs.existsSync(diary.video)) {
        fs.unlinkSync(diary.video);
      }
    }
    if (req.user.role === 'admin') { // 管理员执行逻辑删除 
      diary.isDeleted = true;
      await diary.save();
      res.status(200).json({ message: '日记已逻辑删除' });
    } else if (diary.author.toString() === req.user._id.toString()) { // 作者执行物理删除 
      await Diary.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: '日记已删除' });
    } else { 
      // 这个分支理论上不应该走到，因为权限检查已经覆盖 
      return res.status(403).json({ message: '无权限删除此日记' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

const reviewDiary = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const diary = await Diary.findById(req.params.id);
    if (!diary) {
      return res.status(404).json({ message: '日记未找到' });
    }
    if (!['reviewer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: '无权限审核日记' });
    }
    diary.status = status;
    diary.rejectionReason = status === 'rejected' ? rejectionReason : '';
    await diary.save();
    res.status(200).json({ message: '日记审核完成', data: diary });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};



// 获取管理后台日记列表
const getDiariesForAdmin = async (req, res) => {
  // 添加权限检查
  if (!['reviewer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: '无权限访问管理后台日记列表' });
  }
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const statusFilter = req.query.status; // e.g., 'pending', 'approved', 'rejected'
    const skip = (page - 1) * limit;

    let query = { isDeleted: false }; // 基础查询：未被逻辑删除的
    if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
      query.status = statusFilter; // 如果提供了有效的状态，则加入查询
    }

    const diaries = await Diary.find(query)
      .sort({ _id: -1 }) // 或按更新时间等排序
      .skip(skip)
      .limit(limit)
      .populate('author', 'nickname avatar'); // 填充作者信息
    const totalDiaries = await Diary.countDocuments(query);

    res.status(200).json({
      message: '获取管理后台日记列表成功',
      data: diaries,
      currentPage: page,
      totalPages: Math.ceil(totalDiaries / limit),
      totalDiaries: totalDiaries
    });
  } catch (err) {
    console.error('获取管理后台日记列表失败:', err.message);
    res.status(500).send('服务器错误');
  }
};

module.exports = {
  getApprovedDiariesPublic,
  createDiary,
  getDiaryById,
  updateDiary,
  deleteDiary,
  reviewDiary,
  getDiariesForAdmin
};
