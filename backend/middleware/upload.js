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

// --- 文件大小限制 (可选，但推荐) ---
const limits = {
  fileSize: 1024 * 1024 * 100 // 限制文件大小为 100MB (根据需要调整)
  // 你可以为不同类型的上传设置不同的限制，例如头像限制小一点
};

// --- 创建 Multer 实例 ---
// 使用上面定义的 storage, fileFilter, limits 来创建 Multer 实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits
});

// --- 导出配置好的 Multer 中间件 ---
// 我们将导出 upload 实例，然后在路由中使用它的方法 (.single, .array, .fields)
module.exports = upload;

// 如果你想为不同类型的上传（如头像和日记文件）使用不同的配置（例如不同的大小限制），
// 你可以创建多个 Multer 实例：
/*
const uploadAvatar = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 1024 * 1024 * 5 } }); // 5MB for avatars
const uploadDiaryFiles = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 1024 * 1024 * 100 } }); // 100MB for diary files
module.exports = { uploadAvatar, uploadDiaryFiles };
*/
// 如果你采用上面注释掉的方式导出多个实例，请确保在路由中导入和使用正确的实例。
// 在后续步骤中，我将假设你导出了一个通用的 `upload` 实例。如果你选择导出多个，请相应调整路由中的代码。