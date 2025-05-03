const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');
const { protect, isReviewer, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// 示例路由
router.get('/', diaryController.getApprovedDiariesPublic);
router.get('/:id', protect, diaryController.getDiaryById);
// --- 创建日记的路由 ---
// 1. auth: 认证
// 2. upload.fields([...]): 处理多个不同字段的文件上传
// 3. diaryController.createDiary: 执行 Controller 逻辑
router.post(
  '/',
  protect,
  upload.fields([ // 使用 .fields() 处理混合字段
    { name: 'images', maxCount: 5 }, // 处理名为 'images' 的字段，最多允许 5 个文件
    { name: 'video', maxCount: 1 }   // 处理名为 'video' 的字段，最多允许 1 个文件
  ]),
  diaryController.createDiary // Controller 现在可以访问 req.files
);
router.put('/:id', protect, diaryController.updateDiary);
router.delete('/:id', protect, diaryController.deleteDiary);
router.put('/:id/review', protect, isReviewer, diaryController.reviewDiary);


// 管理后台获取日记列表
router.get('/admin', protect, isReviewer, diaryController.getDiariesForAdmin);

module.exports = router;