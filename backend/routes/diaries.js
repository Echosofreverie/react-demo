const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');

// 示例路由
router.get('/', diaryController.getApprovedDiariesPublic);
router.get('/:id', diaryController.getDiaryById);
router.post('/', diaryController.createDiary);
router.put('/:id', diaryController.updateDiary);
router.delete('/:id', diaryController.deleteDiary);
router.put('/:id/review', diaryController.reviewDiary);


// 管理后台获取日记列表
router.get('/admin', diaryController.getDiariesForAdmin);

module.exports = router;