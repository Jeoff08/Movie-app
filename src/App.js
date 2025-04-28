"use client";

import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { getUserMovieLists, updateMovieList } from "./components/firebaseFunctions";
import MovieCard from "./components/MovieCard";
import SearchBar from "./components/SearchBar";
import CategorySelector from "./components/CategorySelector";
import Auth from "./components/Auth";
import { FiSettings } from "react-icons/fi";

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [watched, setWatched] = useState([]);
  const [activeList, setActiveList] = useState("search");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const API_KEY = "dc57affc";
  const categories = ["Now Playing", "Popular", "Top Rated"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        getUserMovieLists(currentUser.uid).then((data) => {
          setFavorites(data.favorites);
          setWatchlist(data.watchlist);
          setWatched(data.watched);
        });
      } else {
        setFavorites([]);
        setWatchlist([]);
        setWatched([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchMoviesByCategory = async (category) => {
    setLoading(true);
    setError(null);

    try {
      let url = "";
      if (category === "Now Playing") {
        url = `https://www.omdbapi.com/?s=2024&apikey=${API_KEY}&type=movie`;
      } else if (category === "Popular") {
        url = `https://www.omdbapi.com/?s=Avengers&apikey=${API_KEY}&type=movie`;
      } else if (category === "Top Rated") {
        url = `https://www.omdbapi.com/?s=Inception&apikey=${API_KEY}&type=movie`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.Response === "True") {
        setMovies(data.Search);
        setActiveList("search");
      } else {
        setMovies([]);
        setError(data.Error);
      }
    } catch (err) {
      setError("Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async (term) => {
    if (!term) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://www.omdbapi.com/?s=${term}&apikey=${API_KEY}`);
      const data = await response.json();

      if (data.Response === "True") {
        setMovies(data.Search);
        setActiveList("search");
      } else {
        setMovies([]);
        setError(data.Error);
      }
    } catch (err) {
      setError("Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setSelectedCategory("");
    searchMovies(term);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSearchTerm("");
    fetchMoviesByCategory(category);
  };

  const updateMovieListFirestore = (listName, movie, action) => {
    if (user) {
      updateMovieList(user.uid, listName, movie, action);
    }
  };

  const addToFavorites = (movie) => {
    if (!favorites.some((fav) => fav.imdbID === movie.imdbID)) {
      setFavorites([...favorites, movie]);
      updateMovieListFirestore("favorites", movie, "add");
    }
  };

  const addToWatchlist = (movie) => {
    if (!watchlist.some((item) => item.imdbID === movie.imdbID)) {
      setWatchlist([...watchlist, movie]);
      updateMovieListFirestore("watchlist", movie, "add");
    }
  };

  const addToWatched = (movie) => {
    if (!watched.some((item) => item.imdbID === movie.imdbID)) {
      setWatched([...watched, movie]);
      updateMovieListFirestore("watched", movie, "add");
    }
  };

  const removeFromFavorites = (movie) => {
    setFavorites(favorites.filter((fav) => fav.imdbID !== movie.imdbID));
    updateMovieListFirestore("favorites", movie, "remove");
  };

  const removeFromWatchlist = (movie) => {
    setWatchlist(watchlist.filter((item) => item.imdbID !== movie.imdbID));
    updateMovieListFirestore("watchlist", movie, "remove");
  };

  const removeFromWatched = (movie) => {
    setWatched(watched.filter((item) => item.imdbID !== movie.imdbID));
    updateMovieListFirestore("watched", movie, "remove");
  };

  if (!user) return <Auth />;

  const RemoveButton = ({ onClick }) => (
    <div className="relative group">
      <button
        onClick={onClick}
        className="flex items-center justify-center p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 6h18M19 6l-1 14H6L5 6M10 11v4m4-4v4m-5 0h6"
          />
        </svg>
      </button>
    </div>
  );

  const renderMovies = () => {
    let list = [];
    if (activeList === "favorites") list = favorites;
    else if (activeList === "watchlist") list = watchlist;
    else if (activeList === "watched") list = watched;
    else list = movies;

    if (list.length === 0) {
      return <p className="text-center text-gray-400 mt-6">No movies found.</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {list.map((movie) => (
          <div key={movie.imdbID} className="relative group rounded-lg shadow-xl bg-gray-800 overflow-hidden">
            <MovieCard movie={movie} apiKey={API_KEY} />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent to-transparent p-4 flex justify-between">
              {activeList === "search" ? (
                <>
                  <button
                    onClick={() => addToFavorites(movie)}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md transition"
                  >
                    ⭐
                  </button>
                  <button
                    onClick={() => addToWatchlist(movie)}
                    className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-md transition"
                  >
                    📅
                  </button>
                  <button
                    onClick={() => addToWatched(movie)}
                    className="px-3 py-1 bg-black hover:bg-gray-800 text-white rounded-md transition"
                  >
                    ✔️
                  </button>
                </>
              ) : (
                <RemoveButton
                  onClick={() => {
                    if (activeList === "favorites") removeFromFavorites(movie);
                    if (activeList === "watchlist") removeFromWatchlist(movie);
                    if (activeList === "watched") removeFromWatched(movie);
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-6 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 md:mr-8 flex flex-col gap-6 mb-6 md:mb-0">
        <h1 className="text-3xl font-bold text-purple-400">Watcharoo+</h1>

        {/* Categories moved here */}
        <CategorySelector
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />

        {/* Settings */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition w-full mt-6"
          >
            <FiSettings className="text-2xl" />
            <span className="font-semibold">Settings</span>
          </button>

          {dropdownOpen && (
            <div className="absolute mt-2 w-full bg-gray-800 rounded-md shadow-lg py-2 z-10">
              <button
                onClick={() => { setActiveList("favorites"); setDropdownOpen(false); }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Show Favorites
              </button>
              <button
                onClick={() => { setActiveList("watchlist"); setDropdownOpen(false); }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Show Watchlist
              </button>
              <button
                onClick={() => { setActiveList("watched"); setDropdownOpen(false); }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Show Watched
              </button>
              <button
                onClick={() => { auth.signOut(); setDropdownOpen(false); }}
                className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 hover:text-red-500"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <SearchBar onSearch={handleSearch} />

        {loading && (
          <div className="flex justify-center items-center mt-10">
            <div className="h-12 w-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 font-semibold mt-6">
            {error}
          </div>
        )}

        {renderMovies()}
      </div>
    </div>
  );
}

export default App;
