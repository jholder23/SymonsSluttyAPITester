import { useState, useEffect } from 'react'
import './App.css'

// Define the structure of our API response using TypeScript
// 'any' type means it can hold any kind of data
// '?' means this property is optional
interface ApiResponse {
  data: any;
  error?: string;
}

interface Genre {
  id: number;
  name: string;
}

// This is a "React Component" - think of it like a custom HTML element
// Components are just functions that return what we want to show on the screen
function App() {
  // useState is called a "Hook" - it's how we make React remember things
  // When these values change, React will update the screen automatically
  // Each useState creates a variable and a function to update it
  const [searchQuery, setSearchQuery] = useState('')
  const [genres, setGenres] = useState<Genre[]>([])  // Store the genres filter
  const [selectedGenre, setSelectedGenre] = useState('')
  const [response, setResponse] = useState<ApiResponse | null>(null)  // Store the API response
  const [loading, setLoading] = useState(false)  // Track loading state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/genres');
        const data = await res.json();
        setGenres(data);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };

    fetchGenres();
  }, []);

  // This is called a "function handler" - it runs when the form is submitted
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (selectedGenre) params.append('genreId', selectedGenre);
      if (searchQuery) params.append('title', searchQuery);
      params.append('page', currentPage.toString());

      const res = await fetch(`http://localhost:3001/api/movies?${params.toString()}`);
      const data = await res.json();
      setResponse({ data: data.results });
      setTotalPages(data.total_pages);
    } catch (error) {
      setResponse({ data: null, error: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  // Everything inside return() is "JSX" - it's like HTML but in JavaScript
  // This is what will actually show up on the page
  return (
    // className is like HTML's class - it's for styling
    <div className="container">
      <h1>Movie Search</h1>
      
      {/* This is a form element - it groups inputs together */}
      {/* onSubmit runs our handler function when the form is submitted */}
      <form onSubmit={handleSubmit}>
        <div>
          {/* htmlFor connects the label to the input using the ID */}
          <label htmlFor="title">Title:</label>
          {/* This is an input box for the URL */}
          <input
            type="text"
            id="title"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter movie title"
          />
        </div>
        
        <div>
          {/* Input for specifying genres */}
          <label htmlFor="genres">Genres:</label>
          <select
            id="genres"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">Select a genre</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* The button that submits the form */}
        {/* disabled={loading} makes the button unclickable while loading */}
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>

      {/* This only shows if we have a response (that's what && means) */}
      {response && (
        <div className="movie-cards">
          {response.error ? (
            <div className="error">{response.error}</div>
          ) : (
            response.data && response.data.length > 0 ? (
              response.data.map((movie: any) => {
                const movieGenres = movie.genre_ids?.map((id: number) => {
                  const genre = genres.find((g) => g.id === id);
                  return genre ? genre.name : null;
                }).filter(Boolean).join(', ') || 'N/A';

                return (
                  <div className="card" key={movie.id}>
                    {movie.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="response-poster"
                      />
                    )}
                    <h3>{movie.title}</h3>
                    <p>Type: {movie.media_type || 'Movie'}</p>
                    <p>Rating: {movie.vote_average}</p>
                    <p>Year: {new Date(movie.release_date || movie.first_air_date).getFullYear()}</p>
                    <p>Genres: {movieGenres}</p>
                  </div>
                );
              })
            ) : (
              <div className="error">No movies found</div>
            )
          )}
        </div>
      )}
    </div>
  )
}

export default App
