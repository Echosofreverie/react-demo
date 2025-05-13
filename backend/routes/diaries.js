const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');
const { protect, isReviewer, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
/**
 * @swagger
 * tags:
 *   name: Diaries
 *   description: 旅行日记相关接口
 */


/**
 * @swagger
 * /trip/diaries:
 *   get:
 *     summary: 获取公开的、已批准的旅行日记列表 (分页、可搜索)
 *     tags: [Diaries]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词 (匹配日记标题或作者用户名)
 *     responses:
 *       '200':
 *         description: 成功获取已批准的日记列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiaryListResponse' # 确保这个 Schema 在 swaggerConfig.js 中定义
 *       '500':
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' # 确保这个 Schema 在 swaggerConfig.js 中定义
 */
router.get('/', diaryController.getApprovedDiariesPublic);
// 管理后台获取日记列表

/**
 * @swagger
 * /trip/diaries/admin:
 *   get:
 *     summary: (管理后台) 获取所有日记列表 (分页、可按状态筛选)
 *     tags: [Diaries]
 *     security:
 *       - bearerAuth: [] # 表示此接口需要 JWT Bearer Token 认证
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, ''] # '' 或不提供表示获取所有（未逻辑删除的）
 *         description: 按审核状态筛选 (不填则获取所有未逻辑删除的日记)
 *     responses:
 *       '200':
 *         description: 成功获取管理后台日记列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminDiaryListResponse' # 确保这个 Schema 在 swaggerConfig.js 中定义
 *       '401':
 *         description: 未认证 (Token 无效或未提供)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: 无权限访问 (需要审核员或管理员角色)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/admin', protect, isReviewer, diaryController.getDiariesForAdmin);

/**
 * @swagger
 * components:
 *   parameters:
 *     diaryId: # 定义一个可复用的路径参数 diaryId
 *       name: id
 *       in: path
 *       required: true
 *       description: 日记的ID
 *       schema:
 *         type: string
 *         format: ObjectId # 自定义格式，表示这是一个 MongoDB ObjectId
 *         example: "60d21b4667d0d8992e610c85"
 */

/**
 * @swagger
 * /trip/diaries/{id}:
 *   get:
 *     summary: 获取指定ID的日记详情
 *     tags: [Diaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/diaryId' # 引用上面定义的 diaryId 参数
 *     responses:
 *       '200':
 *         description: 成功获取日记详情
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiaryResponse' # 使用 swaggerConfig.js 中定义的 DiaryResponse
 *       '401':
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: 无权限查看 (例如，日记是 pending 状态且当前用户非作者、管理员或审核员)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: 日记未找到或ID格式无效
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', protect, diaryController.getDiaryById);

/**
 * @swagger
 * /trip/diaries:
 *   post:
 *     summary: 创建新的旅行日记
 *     tags: [Diaries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: 日记标题
 *                 example: "难忘的登山经历"
 *               content:
 *                 type: string
 *                 description: 日记内容
 *                 example: "今天我们去爬了黄山，风景非常壮丽..."
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary # 表示文件上传
 *                 description: 日记图片 (最多5张)
 *                 maxItems: 10
 *               video:
 *                 type: string # 单个文件上传
 *                 format: binary # 表示文件上传
 *                 description: 日记视频 (可选, 最多1个)
 *           encoding: # 详细说明多部分表单中每个部分的编码，尤其是文件
 *             images:
 *               contentType: image/png, image/jpeg, image/gif # 根据你的 upload middleware 接受的类型调整
 *             video:
 *               contentType: video/mp4, video/quicktime # 根据你的 upload middleware 接受的类型调整
 *     responses:
 *       '201':
 *         description: 日记创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiaryResponse' # 返回创建的日记信息
 *       '400':
 *         description: 请求参数错误 (例如，标题或内容为空，文件类型不支持等)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 服务器错误 (例如，文件保存失败)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  protect,
  upload.fields([ // 使用 .fields() 处理混合字段
    { name: 'images', maxCount: 5 }, // 处理名为 'images' 的字段，最多允许 5 个文件
    { name: 'video', maxCount: 1 }   // 处理名为 'video' 的字段，最多允许 1 个文件
  ]),
  diaryController.createDiary // Controller 现在可以访问 req.files
);

/**
 * @swagger
 * /trip/diaries/{id}:
 *   put:
 *     summary: 更新指定ID的旅行日记的文本信息 (仅作者可操作)
 *     tags: [Diaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/diaryId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json: # <--- 改为 application/json
 *           schema:
 *             type: object
 *             properties: # 在更新操作中，所有字段通常都是可选的
 *               title:
 *                 type: string
 *                 description: 日记标题 (可选)
 *                 example: "难忘的登山经历 (修订版)"
 *               content:
 *                 type: string
 *                 description: 日记内容 (可选)
 *                 example: "今天我们去爬了黄山，风景非常壮丽...补充一些细节。"
 *               # 注意：这里不包含 images 或 video 字段，因为此路由定义不处理 multipart/form-data
 *               # 如果需要更新图片/视频，通常会通过专门的接口或允许在此处传递新的 URL 列表（但这取决于您的后端逻辑）
 *     responses:
 *       '200':
 *         description: 日记文本信息更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiaryResponse' # 返回更新后的日记信息
 *       '400':
 *         description: 请求参数错误 (例如，无效的JSON格式)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: 无权限操作 (例如，非日记作者)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: 日记未找到或ID格式无效
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.put('/:id', protect, diaryController.updateDiary);


/**
 * @swagger
 * /trip/diaries/{id}:
 *   delete:
 *     summary: 删除指定ID的旅行日记 (作者或管理员可操作)
 *     tags: [Diaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/diaryId' # 引用之前定义的 diaryId 路径参数
 *     responses:
 *       '200':
 *         description: 日记删除成功 (通常是逻辑删除)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessageResponse' # 使用通用的成功消息响应
 *             example:
 *               message: "日记删除成功"
 *       '401':
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: 无权限操作 (例如，非日记作者或非管理员)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: 日记未找到或ID格式无效
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', protect, diaryController.deleteDiary);

/**
 * @swagger
 * /trip/diaries/{id}/review:
 *   put:
 *     summary: (审核员/管理员) 审核指定ID的旅行日记
 *     tags: [Diaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/diaryId' # 引用已定义的日记ID路径参数
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status # 审核状态是必需的
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected] # 根据您的 Diary schema 定义的状态
 *                 description: 审核结果 (approved 或 rejected)
 *                 example: "approved"
 *               reviewComments:
 *                 type: string
 *                 description: 审核意见或备注 (可选)
 *                 example: "内容很棒，已批准！"
 *     responses:
 *       '200':
 *         description: 日记审核操作成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiaryResponse' # 返回更新后的日记信息 (包含新的状态和审核评论)
 *       '400':
 *         description: 请求参数错误 (例如，status 无效或缺失)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: 未认证 (Token 无效或未提供)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: 无权限操作 (例如，用户不是审核员或管理员)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: 日记未找到或ID格式无效
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id/review', protect, isReviewer, diaryController.reviewDiary);




module.exports = router;