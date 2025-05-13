const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 用户认证相关接口
 */

/**
 * @swagger
 * /trip/auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:          
 *                 type: string         
 *     responses:                           
 *       200:           
 *         description: 登录成功，返回token         
 *         content:     
 *           application/json:      
 *             schema:
 *               type: object                   
 *               properties:            
 *                 token:
 *                   type: string           
 *       400:                       
 *         description: 登录失败，返回错误信息                  
 *         content:     
 *           application/json:  
 *             schema:
 *               type: object               
 *               properties:                            
 *                 message:
 *                   type: string       
 */ 
router.post('/login', authController.login);

/**
 * @swagger
 * /trip/auth/register:
 *   post:
 *     summary: 用户注册
 *     tags: [Auth]
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
 *     responses:
 *       201:
 *         description: 注册成功，返回token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:       
 *         description: 注册失败，返回错误信息          
 *         content:                     
 *           application/json:      
 *             schema:
 *               type: object       
 *               properties:                    
 *                 message:
 *                   type: string
 */     
router.post('/register', authController.register);

module.exports = router;
