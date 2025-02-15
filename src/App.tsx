import { useState, useEffect } from 'react' // Importing React hooks for state management and side effects
import './App.css' // Importing CSS for styling the component

// Define the structure of our API response using TypeScript
// 'any' type means it can hold any kind of data
// '?' means this property is optional
interface ApiResponse {
  data: any; // This will hold the data we get from the API
  error?: string; // This will hold an error message if something goes wrong
}

interface Genre {
  id: number; // Unique identifier for each genre
  name: string; // Name of the genre
}

// This is a "React Component" - think of it like a custom HTML element
// Components are just functions that return what we want to show on the screen
function App() {
  // useState is called a "Hook" - it's how we make React remember things
  // When these values change, React will update the screen automatically
  // Each useState creates a variable and a function to update it
  const [searchQuery, setSearchQuery] = useState('') // State to store the user's search input
  const [genres, setGenres] = useState<Genre[]>([])  // State to store the list of genres
  const [selectedGenre, setSelectedGenre] = useState('') // State to store the selected genre
  const [response, setResponse] = useState<ApiResponse | null>(null)  // State to store the API response
  const [loading, setLoading] = useState(false)  // State to track if data is being loaded
  const [currentPage, setCurrentPage] = useState(1); // State to track the current page of results
  const [totalPages, setTotalPages] = useState(1); // State to track the total number of pages available

  // useEffect is another Hook - it lets us perform side effects in function components
  // Here, we're using it to fetch genres from an API when the component first loads
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/genres'); // Fetch genres from the API
        const data = await res.json(); // Convert the response to JSON
        setGenres(data); // Update the genres state with the fetched data
      } catch (error) {
        console.error('Failed to fetch genres:', error); // Log an error if the fetch fails
      }
    };

    fetchGenres(); // Call the function to fetch genres
  }, []); // Empty array means this effect runs once when the component mounts

  // This is called a "function handler" - it runs when the form is submitted
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission behavior
    setLoading(true); // Set loading state to true to indicate data is being fetched

    try {
      const params = new URLSearchParams(); // Create a URLSearchParams object to build query parameters
      if (selectedGenre) params.append('genreId', selectedGenre); // Add genreId to parameters if a genre is selected
      if (searchQuery) params.append('title', searchQuery); // Add title to parameters if a search query is entered
      params.append('page', currentPage.toString()); // Add current page to parameters

      const res = await fetch(`http://localhost:3001/api/movies?${params.toString()}`); // Fetch movies from the API with the built parameters
      const data = await res.json(); // Convert the response to JSON
      setResponse({ data: data.results }); // Update the response state with the fetched data
      setTotalPages(data.total_pages); // Update the total pages state
    } catch (error) {
      setResponse({ data: null, error: 'Failed to fetch data' }); // Update response state with an error message if fetch fails
    } finally {
      setLoading(false); // Set loading state to false after fetch is complete
    }
  };

  // Everything inside return() is "JSX" - it's like HTML but in JavaScript
  // This is what will actually show up on the page
  return (
    // className is like HTML's class - it's for styling
    <div className="container">
      <h1>Movie Search</h1> {/* Heading for the page */}
      
      {/* This is a form element - it groups inputs together */}
      {/* onSubmit runs our handler function when the form is submitted */}
      <form onSubmit={handleSubmit}>
        <div>
          {/* htmlFor connects the label to the input using the ID */}
          <label htmlFor="title">Title:</label>
          {/* This is an input box for the URL */}
          <input
            type="text" // Input type is text
            id="title" // ID for the input
            value={searchQuery} // Value of the input is linked to searchQuery state
            onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery state when input changes
            placeholder="Enter movie title" // Placeholder text for the input
          />
        </div>
        
        <div>
          {/* Input for specifying genres */}
          <label htmlFor="genres">Genres:</label>
          <select
            id="genres" // ID for the select element
            value={selectedGenre} // Value of the select is linked to selectedGenre state
            onChange={(e) => setSelectedGenre(e.target.value)} // Update selectedGenre state when selection changes
          >
            <option value="">Select a genre</option> {/* Default option */}
            {genres.map((genre) => ( // Map over genres to create an option for each
              <option key={genre.id} value={genre.id}>
                {genre.name} {/* Display the name of the genre */}
              </option>
            ))}
          </select>
        </div>
        
        {/* The button that submits the form */}
        {/* disabled={loading} makes the button unclickable while loading */}
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Search'} {/* Show 'Loading...' if loading, otherwise 'Search' */}
        </button>
      </form>

      {/* This only shows if we have a response (that's what && means) */}
      {response && (
        <div className="movie-cards">
          {response.error ? ( // If there's an error, display it
            <div className="error">{response.error}</div>
          ) : (
            response.data && response.data.length > 0 ? ( // If there are movies, display them
              response.data.map((movie: any) => {
                // Map over each movie to display its details
                const movieGenres = movie.genre_ids?.map((id: number) => {
                  // Find the genre names for each movie
                  const genre = genres.find((g) => g.id === id);
                  return genre ? genre.name : null;
                }).filter(Boolean).join(', ') || 'N/A'; // Join genre names with commas, or show 'N/A' if none

                return (
                  <div className="card" key={movie.id}> {/* Card for each movie */}
                    {movie.poster_path && ( // If there's a poster, display it
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} // URL for the poster image
                        alt={movie.title} // Alt text for the image
                        className="response-poster" // Class for styling
                      />
                    )}
                    <h3>{movie.title}</h3> {/* Display the movie title */}
                    <p>Type: {movie.media_type || 'Movie'}</p> {/* Display the media type or 'Movie' */}
                    <p>Rating: {movie.vote_average}</p> {/* Display the movie rating */}
                    <p>Year: {new Date(movie.release_date || movie.first_air_date).getFullYear()}</p> {/* Display the release year */}
                    <p>Genres: {movieGenres}</p> {/* Display the genres */}
                  </div>
                );
              })
            ) : (
              <div className="error">No movies found</div> // If no movies, display a message
            )
          )}
        </div>
      )}
    </div>
  )
}

export default App // Export the App component so it can be used in other parts of the application