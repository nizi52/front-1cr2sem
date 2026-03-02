const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');

// Подключаем Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// Начальные товары (10+ товаров)
let products = [
    {
        id: nanoid(6),
        name: 'iPhone 17 про',
        category: 'Смартфон',
        description: 'Флагманский смартфон от Apple с титановым корпусом',
        price: 89990,
        stock: 15,
        rating: 4.8,
        image: '/image/apple17.png'
    },
    {
        id: nanoid(6),
        name: 'Samsung Galaxy S24 Ultra',
        category: 'Смартфон',
        description: 'Премиальный Android-смартфон с S Pen и камерой 200 МП',
        price: 94990,
        stock: 12,
        rating: 4.9,
        image: '/image/samsung.png'
    },
    {
        id: nanoid(6),
        name: 'MacBook Pro 16',
        category: 'Ноутбуки',
        description: 'Профессиональный ноутбук с чипом M3 Pro',
        price: 249990,
        stock: 5,
        rating: 4.8,
        image: '/image/mac.png'
    },
    {
        id: nanoid(6),
        name: 'Dell XPS 15',
        category: 'Ноутбуки',
        description: 'Мощный ноутбук с Intel Core i7',
        price: 159990,
        stock: 10,
        rating: 4.6,
        image: '/image/dell.jpg'
    },
    {
        id: nanoid(6),
        name: 'iPad Air M2',
        category: 'Планшеты',
        description: 'Легкий и мощный планшет с чипом M2',
        price: 64990,
        stock: 20,
        rating: 4.8,
        image: '/image/ipad.jpg'
    },
    {
        id: nanoid(6),
        name: 'Sony WH-1000XM5',
        category: 'Наушники',
        description: 'Беспроводные наушники с шумоподавлением',
        price: 29990,
        stock: 25,
        rating: 4.8,
        image: '/image/sonywh.jpg'
    },
    {
        id: nanoid(6),
        name: 'AirPods Pro 2',
        category: 'Наушники',
        description: 'TWS-наушники от Apple',
        price: 22990,
        stock: 30,
        rating: 4.8,
        image: '/image/pods.png'
    },
    {
        id: nanoid(6),
        name: 'Apple Watch Series 9',
        category: 'Умные часы',
        description: 'Смарт-часы с ярким дисплеем',
        price: 39990,
        stock: 18,
        rating: 4.8,
        image: '/image/watch.jpg'
    },
    {
        id: nanoid(6),
        name: 'Samsung Galaxy Watch 6',
        category: 'Умные часы',
        description: 'Умные часы с мониторингом здоровья',
        price: 27990,
        stock: 15,
        rating: 4.8,
        image: '/image/samwatch.png'
    },
    {
        id: nanoid(6),
        name: 'Sony PlayStation 5',
        category: 'Игровые консоли',
        description: 'Игровая консоль нового поколения',
        price: 54990,
        stock: 7,
        rating: 5.0,
        image: '/image/ps5.png'
    },
];

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

// ============ SWAGGER CONFIGURATION ============

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API интернет-магазина электроники',
            version: '1.0.0',
            description: 'REST API для управления товарами в интернет-магазине',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер',
            },
        ],
    },
    apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============ SWAGGER SCHEMAS ============

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный ID товара
 *           example: "abc123"
 *         name:
 *           type: string
 *           description: Название товара
 *           example: "iPhone 15 Pro"
 *         category:
 *           type: string
 *           description: Категория товара
 *           example: "Смартфоны"
 *         description:
 *           type: string
 *           description: Описание товара
 *           example: "Флагманский смартфон"
 *         price:
 *           type: number
 *           description: Цена в рублях
 *           example: 89990
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *           example: 15
 *         rating:
 *           type: number
 *           description: Рейтинг (0-5)
 *           example: 4.8
 *         image:
 *           type: string
 *           description: URL изображения
 *           example: "/images/iphone.png"
 */

function findProductOr404(id, res) {
    const product = products.find(p => p.id === id);
    if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return null;
    }
    return product;
}

// ============ API ENDPOINTS ============

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - description
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Товар создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка валидации
 */
app.post('/api/products', (req, res) => {
    const { name, category, description, price, stock, rating, image } = req.body;
    
    if (!name || !category || !description || price === undefined || stock === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        rating: rating !== undefined ? Number(rating) : 0,
        image: image || '/images/add.png'
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить все товары
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Фильтр по категории
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/api/products', (req, res) => {
    const { category } = req.query;
    
    if (category) {
        const filtered = products.filter(p => 
            p.category.toLowerCase() === category.toLowerCase()
        );
        return res.json(filtered);
    }
    
    res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;
    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Товар обновлён
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Товар не найден
 */
app.patch('/api/products/:id', (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;

    const { name, category, description, price, stock, rating, image } = req.body;
    
    if (name === undefined && category === undefined && description === undefined &&
        price === undefined && stock === undefined && rating === undefined && image === undefined) {
        return res.status(400).json({ error: 'Nothing to update' });
    }

    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (rating !== undefined) product.rating = Number(rating);
    if (image !== undefined) product.image = image;

    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар удалён
 *       404:
 *         description: Товар не найден
 */
app.delete('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const exists = products.some(p => p.id === id);
    
    if (!exists) {
        return res.status(404).json({ error: 'Product not found' });
    }

    products = products.filter(p => p.id !== id);
    res.status(204).send();
});

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`✅ Сервер запущен на http://localhost:${port}`);
    console.log(`📦 Товаров в базе: ${products.length}`);
    console.log(`📚 Swagger UI: http://localhost:${port}/api-docs`);
});