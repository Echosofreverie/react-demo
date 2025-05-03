// jest.config.js
module.exports = {
  testEnvironment: 'node', // 指定测试环境为 Node.js
  testTimeout: 30000, // (可选) 增加超时时间，以防数据库启动慢
  setupFilesAfterEnv: ['./tests/setup.js'], // 指定测试环境设置文件
};