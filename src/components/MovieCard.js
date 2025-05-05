"use client";

import { useState, useEffect, useRef } from "react";

const MovieCard = ({ movie, apiKey }) => {
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [userVote, setUserVote] = useState(null); // 'up', 'down', or null
  const [voteCount, setVoteCount] = useState({ up: 0, down: 0 });
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const iframeRef = useRef(null);

  const tmdbApiKey = "4e70c274526d10d420c2fd3ffa306f89";
  const youtubeApiKey = "AIzaSyB8oph20rT-4U6n1mhcmPXX4PXH7K2jdaI";

  useEffect(() => {
    // Load user rating from localStorage if exists
    const savedRating = localStorage.getItem(`movie_${movie.imdbID}_rating`);
    if (savedRating) {
      setUserRating(parseInt(savedRating));
    }

    // Load vote data from localStorage
    const savedVote = localStorage.getItem(`movie_${movie.imdbID}_vote`);
    const savedVotes = localStorage.getItem(`movie_${movie.imdbID}_votes`);
    
    if (savedVote) {
      setUserVote(savedVote);
    }
    if (savedVotes) {
      setVoteCount(JSON.parse(savedVotes));
    }

    // Load reviews from localStorage
    const savedReviews = localStorage.getItem(`movie_${movie.imdbID}_reviews`);
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    }

    const fetchMovieDetails = async () => {
      try {
        // Fetch from OMDB
        const omdbRes = await fetch(
          `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`
        );
        const omdbData = await omdbRes.json();

        if (omdbData.Response === "True") {
          setRating(omdbData.imdbRating);
          setDetails(omdbData);
          
          // First try to get trailer from TMDB
          await getTmdbTrailer(omdbData.Title, omdbData.Year);
        }
      } catch (error) {
        console.error("❌ Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    const getTmdbTrailer = async (title, year) => {
      try {
        // Search for movie in TMDB
        const searchRes = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(title)}&year=${year}`
        );
        const searchData = await searchRes.json();

        if (searchData.results && searchData.results.length > 0) {
          const movieId = searchData.results[0].id;
          
          // Get videos for this movie
          const videosRes = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${tmdbApiKey}`
          );
          const videosData = await videosRes.json();

          // Find official trailer or any trailer
          const trailer = videosData.results.find(
            v => v.type === "Trailer" && v.site === "YouTube"
          ) || videosData.results.find(v => v.site === "YouTube");

          if (trailer) {
            setTrailerUrl(`https://www.youtube.com/embed/${trailer.key}?autoplay=1&enablejsapi=1`);
            return;
          }
        }
        
        // Fallback to YouTube search if no TMDB trailer found
        await searchYoutubeTrailer(title);
      } catch (error) {
        console.error("❌ Error with TMDB API:", error);
        // Fallback to YouTube search if TMDB fails
        await searchYoutubeTrailer(title);
      }
    };

    const searchYoutubeTrailer = async (title) => {
      try {
        const query = `${title} official trailer`;
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(
            query
          )}&key=${youtubeApiKey}&type=video`
        );
        const data = await response.json();

        if (data.items && data.items.length > 0 && data.items[0].id.videoId) {
          const videoId = data.items[0].id.videoId;
          setTrailerUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`);
        }
      } catch (error) {
        console.error("❌ Error with YouTube API:", error);
      }
    };

    fetchMovieDetails();
  }, [movie.imdbID, apiKey, currentPage]); // Added currentPage to dependencies

  useEffect(() => {
    // Close modal when pressing Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderStars = (rating) => {
    const fullStars = Math.round(rating / 2);
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < fullStars ? "text-yellow-400" : "text-gray-400"}>
        ★
      </span>
    ));
  };

  const renderUserRatingStars = (rating, isInteractive = false) => {
    return Array.from({ length: 10 }).map((_, i) => (
      <span 
        key={i}
        className={`text-xl cursor-pointer ${isInteractive ? 'hover:scale-125 transition-transform' : ''} ${
          i < (hoverRating || rating) ? "text-yellow-400" : "text-gray-400"
        }`}
        onMouseEnter={isInteractive ? () => setHoverRating(i + 1) : null}
        onMouseLeave={isInteractive ? () => setHoverRating(0) : null}
        onClick={isInteractive ? () => {
          const newRating = i + 1;
          setUserRating(newRating);
          localStorage.setItem(`movie_${movie.imdbID}_rating`, newRating.toString());
        } : null}
      >
        {i < (hoverRating || rating) ? "★" : "☆"}
      </span>
    ));
  };

  const handleVote = (type) => {
    const newVoteCount = { ...voteCount };
    let newUserVote = userVote;

    if (userVote === type) {
      // Remove vote if clicking the same button
      newVoteCount[type] -= 1;
      newUserVote = null;
    } else if (userVote) {
      // Switching vote
      newVoteCount[userVote] -= 1;
      newVoteCount[type] += 1;
      newUserVote = type;
    } else {
      // New vote
      newVoteCount[type] += 1;
      newUserVote = type;
    }

    setVoteCount(newVoteCount);
    setUserVote(newUserVote);
    
    // Save to localStorage
    localStorage.setItem(`movie_${movie.imdbID}_vote`, newUserVote);
    localStorage.setItem(`movie_${movie.imdbID}_votes`, JSON.stringify(newVoteCount));
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (trailerUrl) {
      setIsPlaying(true);
      // Reset iframe to ensure autoplay works
      if (iframeRef.current) {
        iframeRef.current.src = trailerUrl;
      }
    }
  };

  const handleCloseModal = () => {
    setShowDetails(false);
    setIsPlaying(false);
    setShowReviewForm(false);
    // Pause the video when closing
    if (iframeRef.current) {
      iframeRef.current.src = '';
    }
  };

  const handleAddReview = () => {
    if (newReview.trim()) {
      const review = {
        id: Date.now(),
        text: newReview.trim(),
        date: new Date().toLocaleDateString(),
        rating: userRating || null
      };
      
      const updatedReviews = [...reviews, review];
      setReviews(updatedReviews);
      setNewReview("");
      setShowReviewForm(false);
      
      // Save to localStorage
      localStorage.setItem(`movie_${movie.imdbID}_reviews`, JSON.stringify(updatedReviews));
    }
  };

  const handleDeleteReview = (id) => {
    const updatedReviews = reviews.filter(review => review.id !== id);
    setReviews(updatedReviews);
    
    // Save to localStorage
    localStorage.setItem(`movie_${movie.imdbID}_reviews`, JSON.stringify(updatedReviews));
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      {/* Movie Card - Updated to Netflix-style sizing */}
      <div
        className="relative w-[200px] h-[300px] rounded-md overflow-hidden transition-all duration-300 ease-in-out cursor-pointer shadow-lg hover:shadow-xl hover:z-10 hover:scale-105"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowDetails(true)}
      >
        {movie.Poster && movie.Poster !== "N/A" ? (
          <img
            src={movie.Poster}
            alt={movie.Title}
            className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? "scale-110" : ""}`}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-gray-400">No Image Available</span>
          </div>
        )}

        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-3 flex flex-col justify-end">
            <h3 className="text-white font-semibold text-sm truncate">{movie.Title}</h3>
            <div className="flex items-center text-xs text-gray-300">
              <span>{movie.Year}</span>
              {rating && (
                <div className="flex items-center ml-2">
                  {renderStars(rating)}
                  <span className="ml-1">{rating}</span>
                </div>
              )}
            </div>
            {userRating && (
              <div className="flex items-center text-xs mt-1">
                <span className="text-gray-300 mr-1">Your rating:</span>
                <div className="flex">
                  {renderUserRatingStars(userRating)}
                </div>
              </div>
            )}
            {trailerUrl && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <button
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(true);
                    setIsPlaying(true);
                  }}
                >
                  ▶
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded View */}
      {showDetails && details && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl h-[90vh] bg-gray-900 rounded-lg overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 overflow-hidden">
              {details.Poster && details.Poster !== "N/A" && (
                <img
                  src={details.Poster}
                  alt={details.Title}
                  className="w-full h-full object-cover opacity-20 blur-md"
                />
              )}
            </div>

            {/* Close Button */}
            <button
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-70 rounded-full p-2 text-white hover:bg-opacity-100 transition"
              onClick={handleCloseModal}
            >
              ✕
            </button>

            {/* Content */}
            <div className="relative h-full flex flex-col md:flex-row overflow-y-auto">
              {/* Left Poster - Hidden when playing trailer */}
              {!isPlaying && (
                <div className="w-full md:w-1/3 p-6 flex items-center justify-center">
                  {details.Poster && details.Poster !== "N/A" ? (
                    <img
                      src={details.Poster}
                      alt={details.Title}
                      className="w-full h-auto rounded-lg shadow-xl max-h-[60vh] object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">No Image Available</span>
                    </div>
                  )}
                </div>
              )}

              {/* Right Content */}
              <div className={`${isPlaying ? 'w-full' : 'w-full md:w-2/3'} p-6 flex flex-col justify-start text-white`}>
                {isPlaying ? (
                  <div className="w-full h-full flex flex-col">
                    <div className="aspect-w-16 aspect-h-9 w-full h-[70vh]">
                      <iframe
                        ref={iframeRef}
                        width="100%"
                        height="100%"
                        src={trailerUrl}
                        title="YouTube trailer"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg"
                      ></iframe>
                    </div>
                    <div className="mt-4 text-center">
                      <h1 className="text-2xl font-bold">
                        {details.Title} ({details.Year}) - Trailer
                      </h1>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      {details.Title} ({details.Year})
                    </h1>

                    <div className="flex items-center mb-4">
                      {details.imdbRating && (
                        <div className="flex items-center mr-4">
                          <span className="text-yellow-400 mr-1">
                            {renderStars(details.imdbRating)}
                          </span>
                          <span className="text-gray-300">{details.imdbRating}/10</span>
                        </div>
                      )}
                      <span className="text-gray-300 mr-4">{details.Runtime}</span>
                      <span className="text-gray-300">{details.Rated}</span>
                    </div>

                    {/* User Rating Section */}
                    <div className="mb-4">
                      <h3 className="text-gray-400 mb-2">Your Rating</h3>
                      <div className="flex items-center">
                        <div className="flex mr-4" 
                          onMouseLeave={() => setHoverRating(0)}>
                          {renderUserRatingStars(userRating || 0, true)}
                        </div>
                        {userRating && (
                          <span className="text-yellow-400">
                            {userRating}/10
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-lg mb-6">{details.Plot}</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <h3 className="text-gray-400">Director</h3>
                        <p>{details.Director}</p>
                      </div>
                      <div>
                        <h3 className="text-gray-400">Genre</h3>
                        <p>{details.Genre}</p>
                      </div>
                      <div>
                        <h3 className="text-gray-400">Cast</h3>
                        <p className="truncate">{details.Actors}</p>
                      </div>
                      <div>
                        <h3 className="text-gray-400">Language</h3>
                        <p>{details.Language}</p>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-4 items-center mb-6">
                      <button
                        onClick={handlePlayClick}
                        disabled={!trailerUrl}
                        className={`${
                          trailerUrl
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-gray-600 text-gray-300 cursor-not-allowed"
                        } px-6 py-2 rounded-md font-semibold transition flex items-center`}
                      >
                        <span className="mr-2">▶</span>
                        {trailerUrl ? "Play Trailer" : "Trailer Not Available"}
                      </button>

                      {/* Voting buttons */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleVote('up')}
                          className={`flex items-center px-3 py-2 rounded-md transition ${
                            userVote === 'up' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                        >
                          <span className="mr-1 text-lg">👍</span>
                          <span className="text-sm font-medium">{voteCount.up}</span>
                        </button>
                        <button
                          onClick={() => handleVote('down')}
                          className={`flex items-center px-3 py-2 rounded-md transition ${
                            userVote === 'down' 
                              ? 'bg-red-600 text-white' 
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                        >
                          <span className="mr-1 text-lg">👎</span>
                          <span className="text-sm font-medium">{voteCount.down}</span>
                        </button>
                      </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="mt-6 border-t border-gray-700 pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Reviews</h2>
                        <button
                          onClick={() => setShowReviewForm(!showReviewForm)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                        >
                          {showReviewForm ? 'Cancel' : 'Add Review'}
                        </button>
                      </div>

                      {/* Review Form */}
                      {showReviewForm && (
                        <div className="mb-6 bg-gray-800 p-4 rounded-lg">
                          <textarea
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                            placeholder="Write your review here..."
                            className="w-full bg-gray-700 text-white p-3 rounded-md mb-3 h-32"
                          />
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-gray-400 mr-2">Your Rating:</span>
                              <div className="inline-flex" onMouseLeave={() => setHoverRating(0)}>
                                {renderUserRatingStars(userRating || 0, true)}
                              </div>
                            </div>
                            <button
                              onClick={handleAddReview}
                              disabled={!newReview.trim()}
                              className={`${
                                newReview.trim()
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "bg-gray-600 cursor-not-allowed"
                              } text-white px-4 py-2 rounded-md`}
                            >
                              Submit Review
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Reviews List */}
                      {reviews.length > 0 ? (
                        <div className="space-y-4">
                          {reviews.map((review) => (
                            <div key={review.id} className="bg-gray-800 p-4 rounded-lg relative">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  {review.rating && (
                                    <div className="flex items-center mb-1">
                                      <span className="text-gray-400 mr-2">Rating:</span>
                                      <div className="flex">
                                        {renderUserRatingStars(review.rating)}
                                      </div>
                                    </div>
                                  )}
                                  <p className="text-white">{review.text}</p>
                                </div>
                                <button
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="text-gray-400 hover:text-red-500 ml-2"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="text-xs text-gray-400 mt-2">
                                Posted on {review.date}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">No reviews yet. Be the first to review!</p>
                      )}
                    </div>

                    {/* Pagination Controls */}
                    <div className="mt-auto pt-6 border-t border-gray-700">
                      <div className="flex justify-between items-center">
                        <button
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-md ${
                            currentPage === 1
                              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          Previous
                        </button>
                        
                        <div className="flex space-x-2">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-10 h-10 rounded-md ${
                                page === currentPage
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        
                        <button
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className={`px-4 py-2 rounded-md ${
                            currentPage === totalPages
                              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MovieCard;
