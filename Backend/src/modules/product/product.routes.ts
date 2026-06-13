import express from 'express';
import {
  createProduct,
  deleteProduct,
  getProduct,
  getAllProducts,
  updateProduct,
} from './product.controller';
import { authenticate, authorize, validate } from '../../common/middlewares';
import { Role } from '../../../generated/client/enums';
import {
  createProductSchema,
  updateProductSchema,
  productParamsSchema,
  productsQuerySchema,
} from './product.validation';

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/product:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Products retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: prod123
 *                       name:
 *                         type: string
 *                         example: Laptop
 *                       description:
 *                         type: string
 *                         example: High performance laptop
 *                       costPrice:
 *                         type: number
 *                         example: 800
 *                       sellingPrice:
 *                         type: number
 *                         example: 1200
 *                       lowStockThreshold:
 *                         type: number
 *                         example: 5
 *                       categoryId:
 *                         type: string
 *                         example: cat123
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', validate({ query: productsQuerySchema }), getAllProducts);

/**
 * @swagger
 * /api/v1/product/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Product retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: prod123
 *                     name:
 *                       type: string
 *                       example: Laptop
 *                     description:
 *                       type: string
 *                       example: High performance laptop
 *                     costPrice:
 *                       type: number
 *                       example: 800
 *                     sellingPrice:
 *                       type: number
 *                       example: 1200
 *                     lowStockThreshold:
 *                       type: number
 *                       example: 5
 *                     categoryId:
 *                       type: string
 *                       example: cat123
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', validate({ params: productParamsSchema }), getProduct);

router.use(authorize(Role.ADMIN));

/**
 * @swagger
 * /api/v1/product:
 *   post:
 *     summary: Create a product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - costPrice
 *               - sellingPrice
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 example: New Product
 *               description:
 *                 type: string
 *                 example: A brand new product
 *               costPrice:
 *                 type: number
 *                 example: 50
 *               sellingPrice:
 *                 type: number
 *                 example: 100
 *               lowStockThreshold:
 *                 type: number
 *                 example: 10
 *               categoryId:
 *                 type: string
 *                 example: cat123
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Product created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: prod123
 *                     name:
 *                       type: string
 *                       example: New Product
 *                     description:
 *                       type: string
 *                       example: A brand new product
 *                     costPrice:
 *                       type: number
 *                       example: 50
 *                     sellingPrice:
 *                       type: number
 *                       example: 100
 *                     lowStockThreshold:
 *                       type: number
 *                       example: 10
 *                     categoryId:
 *                       type: string
 *                       example: cat123
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden (Admin only)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validate({ body: createProductSchema }), createProduct);

/**
 * @swagger
 * /api/v1/product/{id}:
 *   patch:
 *     summary: Update a product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Product
 *               description:
 *                 type: string
 *                 example: Updated description
 *               costPrice:
 *                 type: number
 *                 example: 55
 *               sellingPrice:
 *                 type: number
 *                 example: 110
 *               lowStockThreshold:
 *                 type: number
 *                 example: 15
 *               categoryId:
 *                 type: string
 *                 example: cat123
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Product updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: prod123
 *                     name:
 *                       type: string
 *                       example: Updated Product
 *                     description:
 *                       type: string
 *                       example: Updated description
 *                     costPrice:
 *                       type: number
 *                       example: 55
 *                     sellingPrice:
 *                       type: number
 *                       example: 110
 *                     lowStockThreshold:
 *                       type: number
 *                       example: 15
 *                     categoryId:
 *                       type: string
 *                       example: cat123
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden (Admin only)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id', validate({ body: updateProductSchema }), updateProduct);

/**
 * @swagger
 * /api/v1/product/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden (Admin only)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', validate({ params: productParamsSchema }), deleteProduct);

export default router;
