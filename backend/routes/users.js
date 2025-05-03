const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// 获取所有用户 (示例：假设只有管理员能获取所有用户列表)
// 先经过 protect 验证 Token，再经过 isAdmin 验证角色
router.get('/', protect, isAdmin, userController.getAllUsers);

// 获取当前登录用户信息 (只需要登录即可)
router.get('/me', protect, userController.getMe);

// 根据 ID 获取用户 (示例：假设管理员或用户自己可以获取)
// 权限检查在 userController.getUserById 内部完成，这里只需要 protect
router.get('/:id', protect, userController.getUserById);

// 更新用户 (示例：管理员或用户自己可以更新)
// 权限检查在 userController.updateUser 内部完成，这里只需要 protect
router.put('/:id', protect, upload.single('avatar'), userController.updateUser);

// 删除用户 (示例：只有管理员能删除)
router.delete('/:id', protect, isAdmin, userController.deleteUser);
router.post('/', protect, isAdmin, userController.createUser);


module.exports = router;