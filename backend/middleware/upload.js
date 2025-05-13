const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- 辅助函数：确保目录存在 ---
const ensureUploadsDir = (dirPath) => {
  // 使用 path.join 确保跨平台兼容性
  const fullPath = path.join(__dirname, '..', dirPath); // 回到项目根目录再进入目标目录
  if (!fs.existsSync(fullPath)) {
    // recursive: true 会自动创建父目录（如果需要）
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`创建目录: ${fullPath}`);
  }
  return fullPath; // 返回绝对路径
};

// --- 存储配置 ---
// 定义文件应该存储在哪里以及如何命名
const storage = multer.diskStorage({
  // destination: 指定文件存储的目录
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/'; // 默认上传目录

    // 根据上传文件的字段名 (fieldname) 决定存储子目录
    if (file.fieldname === 'avatar') {
      uploadPath = ensureUploadsDir('uploads/avatars'); // 存储到 uploads/avatars/
    } else if (file.fieldname === 'images') {
      uploadPath = ensureUploadsDir('uploads/images'); // 存储到 uploads/images/
    } else if (file.fieldname === 'video') {
      uploadPath = ensureUploadsDir('uploads/videos'); // 存储到 uploads/videos/
    } else {
      uploadPath = ensureUploadsDir('uploads/others'); // 其他文件 (可选)
    }
    cb(null, uploadPath); // 第一个参数是错误，null 表示没有错误
  },
  // filename: 指定存储的文件名
  filename: (req, file, cb) => {
    // 生成一个唯一的文件名，保留原始文件的扩展名
    // 格式：字段名-时间戳-随机数.扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname); // 获取原始文件扩展名，如 '.jpg'
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// --- 文件类型过滤器 (可选，但强烈推荐) ---
// 限制只接受特定类型的文件
const fileFilter = (req, file, cb) => {
  // 允许的图片类型
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  // 允许的视频类型
  const allowedVideoTypes = /mp4|mov|avi|wmv|mkv/;

  // 检查文件扩展名和 MIME 类型
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (file.fieldname === 'avatar' || file.fieldname === 'images') {
    if (allowedImageTypes.test(extname) && mimetype.startsWith('image/')) {
      cb(null, true); // 接受文件
    } else {
      cb(new Error('无效的文件类型：只允许上传图片 (JPEG, PNG, GIF, WEBP)'), false); // 拒绝文件
    }
  } else if (file.fieldname === 'video') {
    if (allowedVideoTypes.test(extname) && mimetype.startsWith('video/')) {
      cb(null, true); // 接受文件
    } else {
      cb(new Error('无效的文件类型：只允许上传视频 (MP4, MOV, AVI, WMV, MKV)'), false); // 拒绝文件
    }
  } else {
    cb(null, false); // 默认拒绝其他未知字段的文件
  }
};

const limits = {
  fileSize: 1024 * 1024 * 100 
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits
});

module.exports = upload;
