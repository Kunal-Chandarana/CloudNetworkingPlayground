const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory product storage (for demo purposes)
let products = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 99.99,
    description: 'High-quality wireless headphones with noise cancellation',
    category: 'Electronics',
    stock: 50,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Smart Watch',
    price: 199.99,
    description: 'Advanced smartwatch with health monitoring features',
    category: 'Electronics',
    stock: 25,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Coffee Maker',
    price: 79.99,
    description: 'Programmable coffee maker with built-in grinder',
    category: 'Home & Kitchen',
    stock: 15,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Running Shoes',
    price: 129.99,
    description: 'Comfortable running shoes with advanced cushioning',
    category: 'Sports',
    stock: 30,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Laptop Stand',
    price: 49.99,
    description: 'Adjustable laptop stand for better ergonomics',
    category: 'Office',
    stock: 40,
    createdAt: new Date().toISOString()
  }
];

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - Product Service: ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'product-service',
    timestamp: new Date().toISOString(),
    version: process.env.SERVICE_VERSION || 'v1'
  });
});

// Get all products
app.get('/products', (req, res) => {
  res.json({
    products,
    count: products.length,
    service: 'product-service'
  });
});

// Get product by ID
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ 
      error: 'Product not found',
      id: req.params.id 
    });
  }
  
  res.json({
    ...product,
    service: 'product-service',
    requestedAt: new Date().toISOString()
  });
});

// Create new product
app.post('/products', (req, res) => {
  const { name, price, description, category, stock } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ 
      error: 'Name and price are required' 
    });
  }
  
  const newProduct = {
    id: uuidv4(),
    name,
    price: parseFloat(price),
    description: description || '',
    category: category || 'General',
    stock: parseInt(stock) || 0,
    createdAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  
  res.status(201).json({
    ...newProduct,
    service: 'product-service'
  });
});

// Update product
app.put('/products/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({ 
      error: 'Product not found',
      id: req.params.id 
    });
  }
  
  const updatedProduct = {
    ...products[productIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  products[productIndex] = updatedProduct;
  
  res.json({
    ...updatedProduct,
    service: 'product-service'
  });
});

// Delete product
app.delete('/products/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({ 
      error: 'Product not found',
      id: req.params.id 
    });
  }
  
  products.splice(productIndex, 1);
  
  res.json({ 
    message: 'Product deleted successfully',
    id: req.params.id,
    service: 'product-service'
  });
});

// Simulate service failure for testing circuit breaker
app.get('/products/fail', (req, res) => {
  res.status(500).json({ 
    error: 'Simulated service failure',
    service: 'product-service',
    timestamp: new Date().toISOString()
  });
});

// Simulate slow response for testing timeouts
app.get('/products/slow', (req, res) => {
  setTimeout(() => {
    res.json({ 
      message: 'Slow response',
      service: 'product-service',
      delay: '5 seconds',
      timestamp: new Date().toISOString()
    });
  }, 5000);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Product Service running on port ${PORT}`);
  console.log(`Service version: ${process.env.SERVICE_VERSION || 'v1'}`);
});
