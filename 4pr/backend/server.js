const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');
const { deprecations } = require('sass');
const app = express();
const port = 3000;

let products = [
    {
        id: nanoid(6),
        name: 'iPhone 17 про',
        category: 'Смартфон',
        description: 'Флагманский смартфон от Apple с титановым корпусом',
        price: 89990,
        stock: 15,
        rating: 4.8,
        img: '/image/apple17.png'
    },
    {
        id: nanoid(6),
        name: 'Samsung Galaxy S24 Ultra',
        category: 'Смартфон',
        description: 'Премиальный Android-смартфон с S Pen и камерой 200 МП',
        price: 94990,
        stock: 12,
        rating: 4.9,
        img: '/image/samsung.png'
    },
        {
        id: nanoid(6),
        name: 'MacBook Pro 16',
        category: 'Ноутбуки',
        description: 'Профессиональный ноутбук с чипом M3 Pro, 18 ГБ ОЗУ и дисплеем Liquid Retina XDR',
        price: 249990,
        stock: 5,
        rating: 4.8,
        img: '/image/mac.png'
    },
        {
        id: nanoid(6),
        name: 'Dell XPS 15',
        category: 'Ноутбуки',
        description: 'Мощный ноутбук с Intel Core i7, 16 ГБ ОЗУ и GeForce RTX 4050',
        price: 159990,
        stock: 10,
        rating: 4.6,
        img: '/image/dell.jpg'
    },    {
        id: nanoid(6),
        name: 'iPad Air M2',
        category: 'Планшеты',
        description: 'Легкий и мощный планшет с чипом M2 и дисплеем 11 дюймов',
        price: 64990,
        stock: 20,
        rating: 4.8,
        img: '/image/ipad.jpg'
    },    {
        id: nanoid(6),
        name: 'Sony WH-1000XM5',
        category: 'Наушники',
        description: 'Беспроводные наушники с активным шумоподавлением и временем работы до 30 часов',
        price: 29990,
        stock: 25,
        rating: 4.8,
        img: '/image/sonywh.jpg'
    },    {
        id: nanoid(6),
        name: 'AirPods Pro 2',
        category: 'Наушники',
        description: 'TWS-наушники от Apple с активным шумоподавлением и пространственным звуком',
        price: 22990,
        stock: 30,
        rating: 4.8,
        img: '/image/pods.png'
    },    {
        id: nanoid(6),
        name: 'Apple Watch Series 9',
        category: 'Умные часы',
        description: 'Смарт-часы с ярким дисплеем, двойным нажатием и чипом S9',
        price: 39990,
        stock: 18,
        rating: 4.8 ,
        img: '/image/watch.jpg'
    },    {
        id: nanoid(6),
        name: 'Samsung Galaxy Watch 6',
        category: 'Смартфон',
        description: 'Умные часы с мониторингом здоровья и длительным временем работы',
        price: 27990,
        stock: 15,
        rating: 4.8 ,
        img: '/image/samwatch.png'
    },    {
        id: nanoid(6),
        name: 'Sony PlayStation 5',
        category: 'Игровые консоли',
        description: 'Игровая консоль нового поколения с SSD и поддержкой 4K 120fps',
        price: 54990,
        stock: 7,
        rating: 5.0 ,
        img: '/image/ps5.png'
    },
];

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content_Type', 'Authorization'],
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

function findProductOr404(id, res) {
    const product = products.find(p => p.id === id);
    if (!product) {
        res.status(404).json({ error: 'Not found' });
        return null;
    }
    return product;
}

app.post('/api/products', (req, res) => {
    const { name, category, description, price, stock, rating, image } = req.body;
    if (!name || !category || !description || price === undefined || stock === undefined) {
        return res.status(400).json({ error: 'Missing required fields'});
    }
    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        category:category.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        rating: rating !== undefined ? Number(rating) : 0,
        image: image || '/image/add.png'
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.get('/api/products', (req, res) => {
    const { category} = req.query;
    if (category) {
        const filtered = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
        return res.json(filtered);
    }
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;
    res.json(product);
});

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

app.delete('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const exists = products.some(p => p.id === id);

    if (!exists) {
        return res.status(404).json({error: 'Product not found'});
    }
    products = products.filter(p => p.id !== id);
    res.status(204).send();
});

app.use((req, res) => {
    res.status(404).json({error: 'Not found'});
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({error: 'Internal server error'})
});

app.listen(port, () => {
    console.log(`✅ Сервер запущен на http://localhost:${port}`);
    console.log(`📦 Товаров в базе: ${products.length}`);
})