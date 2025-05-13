

# 旅行日记平台 后端服务

## 项目简介
基于Node.js + Express的旅行日记平台后端服务，提供用户认证、用户管理、旅行日记管理等功能，支持JWT认证、Swagger API文档。

## 技术栈
- 语言：JavaScript (Node.js)
- Web框架：Express
- 数据库：MongoDB（通过Mongoose ODM操作）
- 认证：JSON Web Token (JWT)
- 密码加密：bcrypt
- API文档：Swagger (swagger-jsdoc + swagger-ui-express)

## 开发工具
- 测试框架：Jest
- 测试数据库：MongoDB Memory Server（测试时模拟MongoDB）
- HTTP请求测试：Supertest
- 环境变量管理：dotenv
- 代码规范：ESLint（可能前端有配置，后端未明确，但可提及）

## 目录结构
```
backend/
├── configs/          # 配置文件（如Swagger配置）
│   └── swaggerConfig.js
├── controllers/      # 业务逻辑控制器
│   ├── authController.js  # 认证相关
│   ├── diaryController.js # 日记相关
│   └── userController.js  # 用户相关
├── middleware/       # 中间件
│   ├── authMiddleware.js  # 认证中间件
│   └── upload.js      # 文件上传中间件
├── models/           # 数据库模型
│   ├── Diary.js       # 日记模型
│   └── User.js        # 用户模型
├── routes/           # 路由定义
│   ├── auth.js        # 认证路由
│   ├── diaries.js     # 日记路由
│   └── users.js       # 用户路由
├── uploads/          # 上传文件存储（如头像、日记图片）
├── server.js         # 服务入口文件
└── package.json      # 依赖管理
```

## 安装与运行
### 前置条件
- Node.js (v16+)
- MongoDB (本地或远程实例)

### 步骤
1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
在项目根目录创建`.env`文件，内容示例：
```
JWT_SECRET=your_jwt_secret_key
PORT=5000
MONGODB_URI=mongodb://localhost:27017/travel_diary_db  # 本地MongoDB连接地址
```

3. 启动服务：
```bash
node server.js
```
服务将运行在`http://localhost:5000`，API文档访问路径：`http://localhost:5000/api-docs`

## API文档
通过Swagger生成，启动服务后访问`/api-docs`查看所有接口定义及测试。

## 依赖列表
### 生产依赖
- express: Web框架
- mongoose: MongoDB ODM
- dotenv: 环境变量管理
- jsonwebtoken: JWT认证
- bcrypt: 密码哈希
- mongoose-unique-validator: Mongoose唯一字段验证
- swagger-jsdoc & swagger-ui-express: API文档生成

### 开发依赖
- jest: 测试框架
- mongodb-memory-server: 测试用内存MongoDB
- supertest: HTTP请求测试工具

这样应该覆盖了用户要求的技术栈、工具和必要内容，并且贴合用户的后端项目结构和代码。



          
# 旅行日记平台 后端服务 README

## 一、项目简介
本项目为旅行日记平台的后端服务，基于 Node.js + Express 框架开发，提供用户认证（登录/注册）、用户管理、旅行日记管理（创建/查询/审核）等核心功能，支持 JWT 身份验证、文件上传（头像/日记图片）及 Swagger API 文档。

---

## 二、技术栈
### 核心技术
- **语言/运行时**：JavaScript（Node.js）
- **Web 框架**：Express（v5.1.0）  
- **数据库**：MongoDB（通过 Mongoose ODM 操作，v8.14.1）  
- **认证**：JSON Web Token（JWT，v9.0.2）  
- **密码加密**：bcrypt（v5.1.1）  
- **API 文档**：Swagger（swagger-jsdoc v6.2.8 + swagger-ui-express v5.0.1）  

### 辅助工具
- **环境变量管理**：dotenv（v16.5.0）  
- **文件上传**：multer（v1.4.5-lts.2）  
- **唯一字段验证**：mongoose-unique-validator（v4.0.1）  

---

## 三、开发工具链
- **测试框架**：Jest（v29.7.0）—— 用于单元测试和集成测试  
- **测试数据库**：mongodb-memory-server（v10.1.4）—— 测试时模拟 MongoDB 实例  
- **HTTP 请求测试**：supertest（v7.1.0）—— 测试 API 接口  
- **代码规范**：ESLint（前端配置，后端可扩展）  

---

## 四、目录结构
```
backend/
├── configs/          # 配置文件
│   └── swaggerConfig.js  # Swagger 文档配置
├── controllers/      # 业务逻辑控制器
│   ├── authController.js  # 认证（登录/注册）
│   ├── diaryController.js # 日记管理（创建/查询/审核）
│   └── userController.js  # 用户管理（增删改查）
├── middleware/       # 中间件
│   ├── authMiddleware.js  # JWT 认证中间件（权限校验）
│   └── upload.js      # 文件上传中间件（头像/日记图片）
├── models/           # 数据库模型
│   ├── Diary.js       # 日记模型（标题/内容/图片/审核状态等）
│   └── User.js        # 用户模型（用户名/邮箱/角色/头像等）
├── routes/           # 路由定义
│   ├── auth.js        # 认证接口路由（/trip/auth）
│   ├── diaries.js     # 日记接口路由（/trip/diaries）
│   └── users.js       # 用户接口路由（/trip/users）
├── uploads/          # 上传文件存储目录（头像/日记图片）
├── server.js         # 服务入口文件（启动 Express、连接数据库）
├── package.json      # 依赖管理文件
```

---

## 五、安装与运行

### 前置条件
- Node.js（建议 v16+）  
- MongoDB（本地或远程实例，默认连接 `mongodb://localhost:27017/travel_diary_db`）  

### 步骤
1. **安装依赖**  
   进入 `backend` 目录，执行：  
   ```bash
   npm install
   ```

2. **配置环境变量**  
   在项目根目录（`backend` 同级）创建 `.env` 文件，内容示例：  
   ```env
   JWT_SECRET=your_secure_jwt_secret  # JWT 签名密钥
   PORT=5000                          # 服务端口（默认 5000）
   MONGODB_URI=mongodb://localhost:27017/travel_diary_db  # MongoDB 连接地址
   ```

3. **启动服务**  
   执行以下命令启动后端服务：  
   ```bash
   node server.js
   ```  
   服务启动后，访问 `http://localhost:5000/api-docs` 查看 Swagger API 文档。

---

## 六、API 文档
所有接口均通过 Swagger 自动生成文档，包含以下核心模块：  
- **Auth**：登录（`POST /trip/auth/login`）、注册（`POST /trip/auth/register`）  
- **Users**：用户列表（`GET /trip/users`）、用户详情（`GET /trip/users/:id`）、用户更新（`PUT /trip/users/:id`）等（需管理员或用户自身权限）  
- **Diaries**：日记列表（`GET /trip/diaries`）、日记详情（`GET /trip/diaries/:id`）、创建日记（`POST /trip/diaries`）等（需登录或审核权限）  

---

## 七、依赖列表
### 生产依赖（dependencies）
| 依赖名                  | 版本     | 说明                     |
|-------------------------|----------|--------------------------|
| express                 | v5.1.0   | Web 框架                 |
| mongoose                | v8.14.1  | MongoDB ODM              |
| dotenv                  | v16.5.0  | 环境变量管理             |
| jsonwebtoken            | v9.0.2   | JWT 认证                 |
| bcrypt                  | v5.1.1   | 密码哈希                 |
| mongoose-unique-validator | v4.0.1  | Mongoose 唯一字段验证    |
| swagger-jsdoc           | v6.2.8   | Swagger 文档生成         |
| swagger-ui-express      | v5.0.1   | Swagger UI 集成          |

### 开发依赖（devDependencies）
| 依赖名                  | 版本     | 说明                     |
|-------------------------|----------|--------------------------|
| jest                    | v29.7.0  | 测试框架                 |
| mongodb-memory-server   | v10.1.4  | 测试用内存 MongoDB       |
| supertest               | v7.1.0   | HTTP 请求测试工具        |

        
