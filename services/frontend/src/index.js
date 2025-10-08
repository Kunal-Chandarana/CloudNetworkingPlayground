const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Service URLs (will be resolved by Istio service discovery)
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://api-gateway:8080';

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/products', async (req, res) => {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/products`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/users/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const response = await axios.post(`${API_GATEWAY_URL}/orders`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'frontend' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend service running on port ${PORT}`);
});
