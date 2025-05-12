// swaggerConfig.js

const swaggerJsDoc = require('swagger-jsdoc');

// Swagger 配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API 文档',
      version: '1.0.0',
      description: 'API 接口文档',
    },
    servers: [
      { url: 'http://localhost:5000' } 
    ],
    components: {
      schemas: {
        // 新增：AuthTokenResponse（替换原有的 Authentication）
        AuthTokenResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: '用户登录/注册后返回的 JWT 令牌',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGI2YjUwYjUwYjUwYjUwYjUwYjUwYjUiLCJpYXQiOjE2OTU4NzYwMDAsImV4cCI6MTY5NTk2MjQwMH0.abc123xyz'
            }
          }
        },
        // 新增：ErrorResponse（通用错误响应）
        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: '错误信息',
              example: '用户名已存在'
            }
          }
        },
        // 根据 models/Diary.js 定义 Diary 模型
        Diary: {
          type: 'object',
          required: ['title', 'content', 'images', 'author'], 
          properties: {
            _id: { 
              type: 'string',
              description: '日记ID (由 MongoDB 自动生成)',
              example: '60d0fe4f5311236168a109ca'
            },
            title: { type: 'string', description: '日记标题' }, 
            content: { type: 'string', description: '日记内容' }, 
            images: { type: 'array', items: { type: 'string' }, description: '图片列表' }, 
            video: { type: 'string', description: '视频路径' },
            author: { type: 'string', description: '作者 ID (关联 User._id)' }, 
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], default: 'pending', description: '审核状态' },
            rejectionReason: { type: 'string', description: '拒绝原因' },
            isDeleted: { type: 'boolean', default: false, description: '是否删除' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
          }
        },
        // 根据 models/User.js 定义 User 模型
        User: {
          type: 'object',
          required: ['username', 'email'], 
          properties: {
            _id: { 
              type: 'string',
              description: '用户ID (由 MongoDB 自动生成)',
              example: '60d0fe4f5311236168a109cb'
            },
            username: { type: 'string', description: '用户名 (应唯一)' }, 
            email: { type: 'string', format:'email', description: '邮箱 (应唯一)' }, 
            avatar: { type: 'string', default: '../uploads/avatars/default-avatar.png', description: '头像路径' }, 
            role: { type: 'string', enum: ['user', 'reviewer', 'admin'], default: 'user', description: '用户角色' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
    
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions); 

module.exports = swaggerDocs;
