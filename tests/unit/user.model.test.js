const mongoose = require('mongoose');
const User = require('../../backend/models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// 在所有测试开始前
beforeAll(async () => {
  // 1. 检查并断开任何已存在的连接
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // 2. 启动内存服务器并连接
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {
    // 添加一些推荐的连接选项，避免潜在的警告
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// 在所有测试结束后
afterAll(async () => {
  // 3. 断开测试数据库连接
  await mongoose.disconnect();
  // 4. 停止内存服务器 (确保 mongoServer 存在)
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// 在每个测试用例开始前
beforeEach(async () => {
  // 清理 User 集合,确保每个测试独立
  // 确保 User.deleteMany 存在且可用
  if (User && typeof User.deleteMany === 'function') {
     const collections = await mongoose.connection.db.collections();
     for (let collection of collections) {
       await collection.deleteMany({});
     }
     // 或者如果只想清空 User: await User.deleteMany({});
  }
});

 describe('User Model Unit Tests', () => {
  it('应该正确创建并保存一个新用户', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      nickname: 'tester',
    };
    const validUser = new User(userData);
    const savedUser = await validUser.save();

    // 断言保存成功且字段存在
    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.nickname).toBe(userData.nickname);
    expect(savedUser.role).toBe('user'); // 测试默认角色
    expect(savedUser.avatar).toBe('default_avatar_url'); // 测试默认头像
    expect(savedUser.password).not.toBe(userData.password); // 密码应该被哈希
    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
  });

  it('应该在缺少必填字段时抛出验证错误', async () => {
    const invalidUserData = { username: 'incomplete' }; // 缺少 email, password, nickname
    const invalidUser = new User(invalidUserData);
    let err;
    try {
      await invalidUser.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
    expect(err.errors.nickname).toBeDefined();
  });

  it('应该因为唯一字段冲突而保存失败', async () => {
    // 先创建一个用户
    const userData1 = { username: 'uniqueUser', email: 'unique@example.com', password: 'password123', nickname: 'uniqueNick' };
    await new User(userData1).save();

    // 尝试创建另一个 email 相同的用户
    const userData2 = { username: 'anotherUser', email: 'unique@example.com', password: 'password456', nickname: 'anotherNick' };
    const duplicateUser = new User(userData2);

    let err;
    try {
      await duplicateUser.save();
    } catch (error) {
      err = error;
    }
    // Mongoose unique 错误通常是 MongoServerError code 11000
    expect(err).toBeDefined();
    expect(err.code).toBe(11000); // 或者检查 err.message 包含 "duplicate key"
  });

  it('应该能正确比较密码', async () => {
    const rawPassword = 'password123';
    const userData = { username: 'pwdcheck', email: 'pwd@example.com', password: rawPassword, nickname: 'pwdchecker' };
    const user = await new User(userData).save();

    const isMatch = await user.comparePassword(rawPassword);
    const isNotMatch = await user.comparePassword('wrongpassword');

    expect(isMatch).toBe(true);
    expect(isNotMatch).toBe(false);
  });

  it('toJSON 方法应该移除密码字段', async () => {
    const userData = { username: 'tojson', email: 'json@example.com', password: 'password123', nickname: 'jsoner' };
    const user = await new User(userData).save();
    const userObject = user.toJSON();

    expect(userObject.password).toBeUndefined();
    expect(userObject.username).toBe(userData.username); // 其他字段应存在
  });
});