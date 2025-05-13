const express = require('express');
const router = express.Router();
const pool = require('./server');
// 示例：获取所有数据
router.get('/data', async (req, res) => {
try {
        const [rows] = await pool.execute('SELECT * FROM your_table');
res.json(rows);
  } catch (error) {
      console.error('查询数据失败:', error);
         res.status(500).json({ error: '服务器错误' });
          }
        });

// 新增 API 端点：获取所有旅行日记
router.get('/trip/diaries', async (req, res) => {
  try {
    const Diary = require('../models/Diary');
    const diaries = await Diary.find();
    res.json(diaries);
  } catch (error) {
    console.error('获取旅行日记失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 新增 API 端点：创建旅行日记
router.post('/trip/diaries', async (req, res) => {
  try {
    const Diary = require('../models/Diary');
    const newDiary = new Diary(req.body);
    const savedDiary = await newDiary.save();
    res.status(201).json(savedDiary);
  } catch (error) {
    console.error('创建旅行日记失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});
module.exports = router;