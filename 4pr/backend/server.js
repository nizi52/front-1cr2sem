const express = require('express');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

const ACCESS_SECRET = 'access_secret';
const REFRESH_SECRET = 'refresh_secret';

const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '1d';

const refreshTokens = new Set();
function generateAccessToken(user){
    return jwt.sign(
        {
            sub: user.id,
            username: user.username,
        },
        ACCESS_SECRET,
        {
            expiresIn: ACCESS_EXPIRES_IN
        }
    );
}

function generateRefreshToken(user){
    return jwt.sign(
        {
            sub: user.id,
            email: user.username,
            first_name: user.first_name,
            last_name: user.last_name
        },
        REFRESH_SECRET,
        {
            expiresIn: REFRESH_EXPIRES_IN
        }
    );
}

app.post('/api/auth/refresh', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ error: 'refreshToken if required' });
    } 
    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = users.find(u => u.id === payload.sub);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        refreshTokens.add(newRefreshToken);
        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid of expired refresh token'});
    }
});


let users = [];
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

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
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


const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API с JWT аутентификацией',
            version: '1.0.0',
            description: 'REST API с jwt, входом и управлением товарами',
        },
        servers: [{ url: `http://localhost:${port}` }],
        сomponents: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

function findUserByEmail(email) {
    return users.find(u => u.email === email);
}

function findProductOr404(id, res) {
    const product = products.find(p => p.id === id);
    if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return null;
    }
    return product;
}

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({
            error: 'Missing or invalid Authorization header'
        });
    }
    try {
        const payload = jwt.verify(token, ACCESS_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({
            error: 'Invalid or expired token'
        });
    }
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - first_name
 *               - last_name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь зарегистрирован
 */



/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - first_name
 *         - last_name
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный ID пользователя
 *           example: "abc123"
 *         email:
 *           type: string
 *           format: email
 *           description: Email (используется как логин)
 *           example: "ivan@example.com"
 *         first_name:
 *           type: string
 *           description: Имя
 *           example: "Иван"
 *         last_name:
 *           type: string
 *           description: Фамилия
 *           example: "Иванов"
 *         password:
 *           type: string
 *           format: password
 *           description: Пароль (хранится в виде хеша)
 *           example: "qwerty123"
 * 
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный ID товара
 *           example: "xyz789"
 *         title:
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
 *           example: "Флагманский смартфон от Apple"
 *         price:
 *           type: number
 *           description: Цена товара
 *           example: 89990
 */


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - first_name
 *               - last_name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ivan@example.com"
 *               first_name:
 *                 type: string
 *                 example: "Иван"
 *               last_name:
 *                 type: string
 *                 example: "Иванов"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "qwerty123"
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *       400:
 *         description: Ошибка валидации или пользователь уже существует
 */
app.post('/api/auth/register', async (req, res) => {
    const { email, first_name, last_name, password } = req.body;

    // Валидация
    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Проверка на существующего пользователя
    if (findUserByEmail(email)) {
        return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = {
        id: nanoid(6),
        email: email.trim().toLowerCase(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        hashedPassword: await hashPassword(password)
    };

    users.push(newUser);

    const { hashedPassword, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ivan@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "qwerty123"
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 login:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Неверный пароль
 *       404:
 *         description: Пользователь не найден
 */
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    // Валидация
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Поиск пользователя
    const user = findUserByEmail(email.trim().toLowerCase());
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Проверка пароля
    const isAuthenticated = await verifyPassword(password, user.hashedPassword);
    if (!isAuthenticated) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    const accessToken = jwt.sign(
        {
            sub: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name
        },
        ACCESS_SECRET,
        {
            expiresIn: ACCESS_EXPIRES_IN
        }
    );
    const refreshToken = generateRefreshToken(user);
    refreshTokens.add(refreshToken);
    res.json({ accessToken, refreshToken });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить данные текущего пользователя (защищённый маршрут)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 *       401:
 *         description: Не авторизован
 */

app.get('/api/auth/me', authMiddleware, (req, res) => {
    const userId = req.user.sub;
    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    const { hashedPassword, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

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
 *               - title
 *               - category
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: "iPhone 15 Pro"
 *               category:
 *                 type: string
 *                 example: "Смартфоны"
 *               description:
 *                 type: string
 *                 example: "Флагманский смартфон"
 *               price:
 *                 type: number
 *                 example: 89990
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
    const { title, category, description, price } = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const newProduct = {
        id: nanoid(6),
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        price: Number(price)
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
 *   put:
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
 *             required:
 *               - title
 *               - category
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Товар обновлён
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Товар не найден
 */
app.put('/api/products/:id', (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;

    const { title, category, description, price, image } = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    product.title = title.trim();
    product.category = category.trim();
    product.description = description.trim();
    product.price = Number(price);
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
    console.log(`📚 Swagger UI: http://localhost:${port}/api-docs`);
    console.log(`👤 Пользователей: ${users.length}`);
    console.log(`📦 Товаров: ${products.length}`);
});