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

// ===== Генерация токенов =====

function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
        },
        ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
        },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES_IN }
    );
}

// ===== Middleware =====

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    try {
        const payload = jwt.verify(token, ACCESS_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// allowedRoles: массив строк, например ['admin'] или ['seller', 'admin']
function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
}

// ===== Хранилища =====

let users = [];
let products = [
    { id: nanoid(6), name: 'iPhone 17 про', category: 'Смартфоны', description: 'Флагманский смартфон от Apple с титановым корпусом', price: 89990, stock: 15, rating: 4.8, image: '/image/apple17.png' },
    { id: nanoid(6), name: 'Samsung Galaxy S24 Ultra', category: 'Смартфоны', description: 'Премиальный Android-смартфон с S Pen и камерой 200 МП', price: 94990, stock: 12, rating: 4.9, image: '/image/samsung.png' },
    { id: nanoid(6), name: 'MacBook Pro 16', category: 'Ноутбуки', description: 'Профессиональный ноутбук с чипом M3 Pro', price: 249990, stock: 5, rating: 4.8, image: '/image/mac.png' },
    { id: nanoid(6), name: 'Dell XPS 15', category: 'Ноутбуки', description: 'Мощный ноутбук с Intel Core i7', price: 159990, stock: 10, rating: 4.6, image: '/image/dell.jpg' },
    { id: nanoid(6), name: 'iPad Air M2', category: 'Планшеты', description: 'Легкий и мощный планшет с чипом M2', price: 64990, stock: 20, rating: 4.8, image: '/image/ipad.jpg' },
    { id: nanoid(6), name: 'Sony WH-1000XM5', category: 'Наушники', description: 'Беспроводные наушники с шумоподавлением', price: 29990, stock: 25, rating: 4.8, image: '/image/sonywh.jpg' },
    { id: nanoid(6), name: 'AirPods Pro 2', category: 'Наушники', description: 'TWS-наушники от Apple', price: 22990, stock: 30, rating: 4.8, image: '/image/pods.png' },
    { id: nanoid(6), name: 'Apple Watch Series 9', category: 'Умные часы', description: 'Смарт-часы с ярким дисплеем', price: 39990, stock: 18, rating: 4.8, image: '/image/watch.jpg' },
    { id: nanoid(6), name: 'Samsung Galaxy Watch 6', category: 'Умные часы', description: 'Умные часы с мониторингом здоровья', price: 27990, stock: 15, rating: 4.8, image: '/image/samwatch.png' },
    { id: nanoid(6), name: 'Sony PlayStation 5', category: 'Игровые консоли', description: 'Игровая консоль нового поколения', price: 54990, stock: 7, rating: 5.0, image: '/image/ps5.png' },
];

// ===== Настройка Express =====

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            console.log('Body:', req.body);
        }
    });
    next();
});

// ===== Swagger =====

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API с JWT и RBAC',
            version: '2.0.0',
            description: 'REST API с jwt, ролевой моделью и управлением товарами/пользователями',
        },
        servers: [{ url: `http://localhost:${port}` }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ===== Вспомогательные функции =====

async function hashPassword(password) {
    return bcrypt.hash(password, 10);
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

// ===== AUTH маршруты (гость) =====

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, first_name, last_name, password]
 *             properties:
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, seller, admin]
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       400:
 *         description: Ошибка валидации
 */
app.post('/api/auth/register', async (req, res) => {
    const { email, first_name, last_name, password, role } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (findUserByEmail(email.trim().toLowerCase())) {
        return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Допустимые роли; по умолчанию — user
    const allowedRoles = ['user', 'seller', 'admin'];
    const assignedRole = allowedRoles.includes(role) ? role : 'user';

    const newUser = {
        id: nanoid(6),
        email: email.trim().toLowerCase(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        hashedPassword: await hashPassword(password),
        role: assignedRole,
        isBlocked: false,
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
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход
 *       401:
 *         description: Неверные учётные данные
 */
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = findUserByEmail(email.trim().toLowerCase());
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (user.isBlocked) {
        return res.status(403).json({ error: 'User is blocked' });
    }

    const isAuthenticated = await verifyPassword(password, user.hashedPassword);
    if (!isAuthenticated) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.add(refreshToken);

    res.json({ accessToken, refreshToken });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление пары токенов
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Новая пара токенов
 *       401:
 *         description: Невалидный refresh-токен
 */
app.post('/api/auth/refresh', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'refreshToken is required' });
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

        refreshTokens.delete(refreshToken);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        refreshTokens.add(newRefreshToken);

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});

// ===== AUTH — текущий пользователь (пользователь+) =====

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить данные текущего пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 *       401:
 *         description: Не авторизован
 */
app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = users.find(u => u.id === req.user.sub);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    const { hashedPassword, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

// ===== USERS маршруты (только администратор) =====

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список пользователей (только admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *       403:
 *         description: Доступ запрещён
 */
app.get('/api/users',
    authMiddleware,
    roleMiddleware(['admin']),
    (req, res) => {
        const safeUsers = users.map(({ hashedPassword, ...u }) => u);
        res.json(safeUsers);
    }
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по id (только admin)
 *     tags: [Users]
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
 *         description: Данные пользователя
 *       404:
 *         description: Пользователь не найден
 */
app.get('/api/users/:id',
    authMiddleware,
    roleMiddleware(['admin']),
    (req, res) => {
        const user = users.find(u => u.id === req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { hashedPassword, ...safeUser } = user;
        res.json(safeUser);
    }
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить информацию пользователя (только admin)
 *     tags: [Users]
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, seller, admin]
 *     responses:
 *       200:
 *         description: Пользователь обновлён
 *       404:
 *         description: Пользователь не найден
 */
app.put('/api/users/:id',
    authMiddleware,
    roleMiddleware(['admin']),
    (req, res) => {
        const user = users.find(u => u.id === req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { first_name, last_name, role } = req.body;
        const allowedRoles = ['user', 'seller', 'admin'];

        if (first_name) user.first_name = first_name.trim();
        if (last_name) user.last_name = last_name.trim();
        if (role && allowedRoles.includes(role)) user.role = role;

        const { hashedPassword, ...safeUser } = user;
        res.json(safeUser);
    }
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Заблокировать пользователя (только admin)
 *     tags: [Users]
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
 *         description: Пользователь заблокирован
 *       404:
 *         description: Пользователь не найден
 */
app.delete('/api/users/:id',
    authMiddleware,
    roleMiddleware(['admin']),
    (req, res) => {
        const user = users.find(u => u.id === req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.isBlocked = true;
        res.json({ message: 'User blocked', id: user.id });
    }
);

// ===== PRODUCTS маршруты =====

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать товар (seller, admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
app.post('/api/products',
    authMiddleware,
    roleMiddleware(['seller', 'admin']),
    (req, res) => {
        const { name, category, description, price, stock, rating, image } = req.body;

        if (!name || !category || !description || price === undefined) {
            return res.status(400).json({ error: 'name, category, description and price are required' });
        }

        const newProduct = {
            id: nanoid(6),
            name: name.trim(),
            category: category.trim(),
            description: description.trim(),
            price: Number(price),
            stock: Number(stock) || 0,
            rating: Number(rating) || 0,
            image: image || '',
        };

        products.push(newProduct);
        res.status(201).json(newProduct);
    }
);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список товаров (user, seller, admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
app.get('/api/products',
    authMiddleware,
    roleMiddleware(['user', 'seller', 'admin']),
    (req, res) => {
        const { category } = req.query;
        const result = category
            ? products.filter(p => p.category === category)
            : products;
        res.json(result);
    }
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по id (user, seller, admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
app.get('/api/products/:id',
    authMiddleware,
    roleMiddleware(['user', 'seller', 'admin']),
    (req, res) => {
        const product = findProductOr404(req.params.id, res);
        if (!product) return;
        res.json(product);
    }
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар (seller, admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
app.put('/api/products/:id',
    authMiddleware,
    roleMiddleware(['seller', 'admin']),
    (req, res) => {
        const product = findProductOr404(req.params.id, res);
        if (!product) return;

        const { name, category, description, price, stock, rating, image } = req.body;

        if (!name || !category || !description || price === undefined) {
            return res.status(400).json({ error: 'name, category, description and price are required' });
        }

        product.name = name.trim();
        product.category = category.trim();
        product.description = description.trim();
        product.price = Number(price);
        if (stock !== undefined) product.stock = Number(stock);
        if (rating !== undefined) product.rating = Number(rating);
        if (image !== undefined) product.image = image;

        res.json(product);
    }
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар (только admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
app.delete('/api/products/:id',
    authMiddleware,
    roleMiddleware(['admin']),
    (req, res) => {
        const exists = products.some(p => p.id === req.params.id);
        if (!exists) {
            return res.status(404).json({ error: 'Product not found' });
        }
        products = products.filter(p => p.id !== req.params.id);
        res.status(204).send();
    }
);

// ===== 404 и error handler =====

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