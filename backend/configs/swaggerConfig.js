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
      {
        url: 'https://77b8-223-122-232-228.ngrok-free.app/trip', // <--- 新增的 Ngrok URL
        description: 'Ngrok Deployed Server (Local)'
      },
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
        DiaryResponse: {
          $ref: '#/components/schemas/Diary'
        },
        responses: {
          UnauthorizedError: {
            description: '未认证（无效或未提供 Token）',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          ForbiddenError: {
            description: '无权限访问（角色或权限不足）',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          },
          InternalServerError: {
            description: '服务器内部错误',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        },
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        // 根据 models/Diary.js 定义 Diary 模型
        DiaryListResponse: { // 新增
          type: 'object',
          properties: {
            message: { 
              type: 'string', 
              description: '操作提示信息',
              example: '获取已通过审核的日记列表成功' 
            },
            data: {
              type: 'array',
              items: { 
                $ref: '#/components/schemas/Diary' // 引用已有的 Diary Schema
              },
              description: '日记列表数据'
            },
            // 可选：如果接口支持分页，添加分页字段
            currentPage: { 
              type: 'integer', 
              description: '当前页码',
              example: 1 
            },
            totalPages: { 
              type: 'integer', 
              description: '总页数',
              example: 5 
            },
            totalDiaries: { 
              type: 'integer', 
              description: '总日记数',
              example: 50 
            }
          }
        },
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
