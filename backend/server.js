const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./configs/swaggerConfig');

// 连接 MongoDB
mongoose.connect('mongodb://localhost:27017/travel_diary_db');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB 连接错误:'));
db.once('open', () => {
  console.log('成功连接到 MongoDB');
});

// 解析 JSON 数据
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 定义路由
app.get('/', (req, res) => {
  res.send('服务端运行中');
});

// 引入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const diaryRoutes = require('./routes/diaries');

// 挂载路由
app.use('/trip/auth', authRoutes);
app.use('/trip/users', userRoutes);
app.use('/trip/diaries', diaryRoutes);

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});