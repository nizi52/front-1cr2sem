const express = require('express');
const app = express();
const port = 3000;

// Массив товаров
let products = [
  { id: 1, title: 'Ноутбук', price: 800 },
  { id: 2, title: 'Телефон', price: 500 },
  { id: 3, title: 'Наушники', price: 100 },
];

// Middleware для JSON
app.use(express.json());

// Главная страница
app.get('/', (req, res) => {
  res.send('API товаров');
});

// ===== CREATE =====
app.post('/products', (req, res) => {
  const { title, price } = req.body;

  const newProduct = {
    id: Date.now(),
    title,
    price
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// ===== READ ALL =====
app.get('/products', (req, res) => {
  res.json(products);
});

// ===== READ ONE =====
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id == req.params.id);

  if (!product) {
    return res.status(404).send('Товар не найден');
  }

  res.json(product);
});

// ===== UPDATE =====
app.patch('/products/:id', (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (!product) {
    return res.status(404).send('Товар не найден');
  }

  const { title, price } = req.body;
  if (title !== undefined) product.title = title;
  if (price !== undefined) product.price = price;

  res.json(product);
});

// ===== DELETE =====
app.delete('/products/:id', (req, res) => {
  products = products.filter(p => p.id != req.params.id);
  res.send('Удалено');
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
