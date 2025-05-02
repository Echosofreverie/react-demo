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
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;