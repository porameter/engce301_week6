// ============================================
// Product Routes
// ============================================

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '../data/products.json');

// ===== HELPER FUNCTIONS =====

async function readProducts() {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading products:', error);
        return [];
    }
}

async function writeProducts(products) {
    try {
        await fs.writeFile(
            dataPath,
            JSON.stringify(products, null, 2),
            'utf8'
        );
        return true;
    } catch (error) {
        console.error('Error writing products:', error);
        return false;
    }
}

// ===== GET ALL PRODUCTS =====
router.get('/', async (req, res) => {
    try {
        const products = await readProducts();

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===== GET PRODUCT BY ID =====
router.get('/:id', async (req, res) => {
    try {
        const products = await readProducts();
        const id = parseInt(req.params.id);

        // ค้นหา product ที่มี id ตรงกัน
        const product = products.find(p => p.id === id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===== POST (CREATE) PRODUCT =====
router.post('/', async (req, res) => {
    try {
        const products = await readProducts();
        const { name, category, price, stock, description } = req.body;

        // 1. Validate ข้อมูล
        if (!name || !category || price == null || stock == null) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // 2. สร้าง id ใหม่
        const newId =
            products.length > 0
                ? Math.max(...products.map(p => p.id)) + 1
                : 1;

        // 3. สร้าง product object ใหม่
        const newProduct = {
            id: newId,
            name,
            category,
            price,
            stock,
            description: description || ''
        };

        // 4. เพิ่มเข้า array
        products.push(newProduct);

        // 5. บันทึกลงไฟล์
        await writeProducts(products);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: newProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===== PUT (UPDATE) PRODUCT =====
router.put('/:id', async (req, res) => {
    try {
        const products = await readProducts();
        const id = parseInt(req.params.id);
        const { name, category, price, stock, description } = req.body;

        // 1. หา index
        const productIndex = products.findIndex(p => p.id === id);

        // 2. ตรวจสอบว่าเจอหรือไม่
        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // 3. อัปเดตข้อมูล
        products[productIndex] = {
            ...products[productIndex],
            name: name ?? products[productIndex].name,
            category: category ?? products[productIndex].category,
            price: price ?? products[productIndex].price,
            stock: stock ?? products[productIndex].stock,
            description: description ?? products[productIndex].description
        };

        // 4. บันทึกลงไฟล์
        await writeProducts(products);

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: products[productIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===== DELETE PRODUCT =====
router.delete('/:id', async (req, res) => {
    try {
        const products = await readProducts();
        const id = parseInt(req.params.id);

        const productIndex = products.findIndex(p => p.id === id);

        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        products.splice(productIndex, 1);
        await writeProducts(products);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
