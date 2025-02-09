import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Proxy endpoint for making external API requests
app.post('/api/proxy', async (req, res) => {
  try {
    const { url, method, headers, body } = req.body;
    const response = await fetch(url, {
      method: method || 'GET',
      headers: headers || {},
      body: method !== 'GET' ? JSON.stringify(body) : undefined
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 