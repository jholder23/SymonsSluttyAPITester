import { useState } from 'react'
import './App.css'

// Define the structure of our API response using TypeScript
// 'any' type means it can hold any kind of data
// '?' means this property is optional
interface ApiResponse {
  data: any;
  error?: string;
}

// This is a "React Component" - think of it like a custom HTML element
// Components are just functions that return what we want to show on the screen
function App() {
  // useState is called a "Hook" - it's how we make React remember things
  // When these values change, React will update the screen automatically
  // Each useState creates a variable and a function to update it
  const [url, setUrl] = useState('')  // Store the API URL
  const [method, setMethod] = useState('GET')  // Store the HTTP method
  const [response, setResponse] = useState<ApiResponse | null>(null)  // Store the API response
  const [loading, setLoading] = useState(false)  // Track loading state

  // This is called a "function handler" - it runs when the form is submitted
  // 'async' means this function can wait for things (like API responses)
  const handleSubmit = async (e: React.FormEvent) => {
    // This prevents the form from refreshing the page (default browser behavior)
    e.preventDefault()
    // Show that we're loading
    setLoading(true)
    
    try {
      // 'fetch' is how we make HTTP requests (talk to APIs)
      // We're sending our request to our own server first
      const res = await fetch('http://localhost:3001/api/proxy', {
        method: 'POST',
        headers: {
          // Tell the server we're sending JSON data
          'Content-Type': 'application/json',
        },
        // Convert our data to a JSON string
        body: JSON.stringify({
          url,      // The URL the user typed
          method,   // The method they selected
        }),
      })
      
      // Convert the response to JSON format and save it
      const data = await res.json()
      setResponse({ data })
    } catch (error) {
      // If anything goes wrong, store the error
      setResponse({ data: null, error: 'Failed to fetch data' })
    } finally {
      // Whether it worked or failed, we're not loading anymore
      setLoading(false)
    }
  }

  // Everything inside return() is "JSX" - it's like HTML but in JavaScript
  // This is what will actually show up on the page
  return (
    // className is like HTML's class - it's for styling
    <div className="container">
      <h1>Symons Slutty API Tester</h1>
      
      {/* This is a form element - it groups inputs together */}
      {/* onSubmit runs our handler function when the form is submitted */}
      <form onSubmit={handleSubmit}>
        <div>
          {/* htmlFor connects the label to the input using the ID */}
          <label htmlFor="url">API URL:</label>
          {/* This is an input box for the URL */}
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="https://api.example.com/endpoint"
          />
        </div>
        
        <div>
          {/* Dropdown menu for selecting HTTP method */}
          <label htmlFor="method">Method:</label>
          <select
            id="method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        
        {/* The button that submits the form */}
        {/* disabled={loading} makes the button unclickable while loading */}
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Send Request'}
        </button>
      </form>

      {/* This only shows if we have a response (that's what && means) */}
      {response && (
        <div className="response">
          <h2>Response:</h2>
          {/* If there's an error, show that, otherwise show the data */}
          {response.error ? (
            <div className="error">{response.error}</div>
          ) : (
            <div>
              {/* Only show image if response has a Poster property */}
              {response.data.Poster && (
                <img 
                  src={response.data.Poster} 
                  alt={response.data.Title || 'API Response Poster'} 
                  className="response-poster"
                />
              )}
              {/* Show the full response data, formatted nicely */}
              <pre>{JSON.stringify(response.data, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
