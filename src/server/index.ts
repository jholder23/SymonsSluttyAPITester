import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3001;

const TMDB_API_KEY = '2af03cea783dab21c0f5594423ebccad';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Endpoint to fetch movies by genre
app.get('/api/movies', async (req, res) => {
  const genreId = req.query.genreId as string;
  const title = req.query.title as string;
  const page = req.query.page || '1';

  try {
    const params: any = {
      api_key: TMDB_API_KEY,
      include_adult: false,
      language: 'en-US',
      page: page
    };

    if (genreId) params.with_genres = genreId;
    if (title) params.query = title;

    const endpoint = title ? `${TMDB_BASE_URL}/search/movie` : `${TMDB_BASE_URL}/discover/movie`;
    const response = await axios.get(endpoint, { params });

    // Send both results and pagination info
    res.json({
      results: response.data.results,
      total_pages: response.data.total_pages
    });
  } catch (error: any) {
    console.error('Error fetching movies:', error.response?.data || error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

app.get('/api/genres', async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });

    res.json(response.data.genres);
  } catch (error: any) {
    console.error('Error fetching genres:', error.response?.data || error);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 