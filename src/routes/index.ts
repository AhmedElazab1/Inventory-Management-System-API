// Node Modules
import express from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import categoryRoutes from '../modules/category/category.routes';
import productRoutes from '../modules/product/product.routes';
import inventoryRoutes from '../modules/inventory/inventory.routes';
import salesRoutes from '../modules/sales/sales.routes';

// Types
import { Request, Response } from 'express';

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome message from API
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Welcome to the Inventory Management System API"
 */

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to the Inventory Management System API' });
});

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/category', categoryRoutes);
router.use('/product', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales', salesRoutes);

export default router;
