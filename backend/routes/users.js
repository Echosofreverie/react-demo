const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 用户管理相关接口
 */
// 获取所有用户 (示例：假设只有管理员能获取所有用户列表)
// 先经过 protect 验证 Token，再经过 isAdmin 验证角色
/**
 * @swagger
 * /trip/users:
 *   get:
 *     summary: 获取所有用户 (仅管理员)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 用户列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

router.get('/', protect, isAdmin, userController.getAllUsers);

// 获取当前登录用户信息 (只需要登录即可)
/**
 * @swagger
 * /trip/users/me:
 *   get:
 *     summary: 获取当前登录用户信息
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 当前用户信息
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */ 
router.get('/me', protect, userController.getMe);

// 根据 ID 获取用户 (示例：假设管理员或用户自己可以获取)
/**
 * @swagger
 * /trip/users/{id}:
 *   get:
 *     summary: 根据 ID 获取用户 (仅管理员或用户自己)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 用户 ID
 *     responses:
 *       200:
 *         description: 用户信息
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'     
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'      
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', protect, userController.getUserById);

// 更新用户 (示例：管理员或用户自己可以更新)
// 权限检查在 userController.updateUser 内部完成，这里只需要 protect
/**
 * @swagger
 * /trip/users/{id}:
 *   put:
 *     summary: 更新用户 (仅管理员或用户自己)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 用户 ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               avatar:    
 *                 type: string     
 *                 format: binary    
 *     responses:       
 *       200:
 *         description: 用户信息
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:              
 *         $ref: '#/components/responses/UnauthorizedError'                     
 *       403:           
 *         $ref: '#/components/responses/ForbiddenError'            
 *       404:                           
 *         $ref: '#/components/responses/NotFoundError'             
 *       500:           
 *         $ref: '#/components/responses/InternalServerError'                           
 */ 
router.put('/:id', protect, upload.single('avatar'), userController.updateUser);

// 删除用户 (示例：只有管理员能删除)
/**
 * @swagger
 * /trip/users/{id}:
 *   delete:
 *     summary: 删除用户 (仅管理员)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 用户 ID
 *     responses:
 *       200:
 *         description: 用户删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:           
 *         $ref: '#/components/responses/NotFoundError'         
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */             
router.delete('/:id', protect, isAdmin, userController.deleteUser);
// 创建新用户 (示例：只有管理员能创建)
/**
 * @swagger
 * /trip/users:
 *   post:
 *     summary: 创建新用户 (仅管理员)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: 用户创建成功
 *         content:    
 *           application/json:  
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'          
 *       500:
 *         $ref: '#/components/responses/InternalServerError'         
 */                                    
router.post('/', protect, isAdmin, userController.createUser);


module.exports = router;