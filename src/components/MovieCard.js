"use client";

import { useState, useEffect } from "react";

const MovieCard = ({ movie, apiKey }) => {
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(
          `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`
        );
        const data = await response.json();

        if (data.Response === "True") {
          setRating(data.imdbRating);
          setDetails(data);
          // Search for the trailer URL (hardcoded for now)
          searchForTrailer(data.Title);
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    const searchForTrailer = (movieTitle) => {
      // Using a hardcoded trailer URL for simplicity (replace with YouTube Data API integration)
      const trailerSearchUrl = `https://www.youtube.com/results?search_query=${movieTitle}+trailer`;
      setTrailerUrl(trailerSearchUrl); // Link to search for trailers on YouTube
    };

    fetchMovieDetails();
  }, [movie.imdbID, apiKey]);

  const renderStars = (rating) => {
    const starImages = [];
    const fullStars = Math.round(rating / 2);
    for (let i = 0; i < 5; i++) {
      starImages.push(
        <span key={i} className={i < fullStars ? "text-yellow-400" : "text-gray-400"}> 
          ★
        </span>
      );
    }
    return starImages;
  };

  return (
    <>
      {/* Movie Card */}
      <div 
        className="relative w-64 h-36 rounded-md overflow-hidden transition-all duration-300 ease-in-out cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowDetails(true)}
      >
        {/* Poster Image */}
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

        {/* Hover Overlay */}
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
          </div>
        )}
      </div>

      {/* Netflix-style Expanded View */}
      {showDetails && details && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl h-[80vh] bg-gray-900 rounded-lg overflow-hidden">
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
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Content */}
            <div className="relative h-full flex flex-col md:flex-row">
              {/* Left Column - Poster */}
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

              {/* Right Column - Details */}
              <div className="w-full md:w-2/3 p-6 flex flex-col justify-center text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {details.Title} ({details.Year})
                </h1>

                {/* Rating and Metadata */}
                <div className="flex items-center mb-4">
                  {details.imdbRating && (
                    <div className="flex items-center mr-4">
                      <span className="text-yellow-400 mr-1">
                        {renderStars(details.imdbRating)}
                      </span>
                      <span className="text-gray-300">
                        {details.imdbRating}/10
                      </span>
                    </div>
                  )}
                  <span className="text-gray-300 mr-4">{details.Runtime}</span>
                  <span className="text-gray-300">{details.Rated}</span>
                </div>

                {/* Plot */}
                <p className="text-lg mb-6">{details.Plot}</p>

                {/* Trailer Link */}
                {trailerUrl && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-300">Trailer</h3>
                    <a
                      href={trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:underline"
                    >
                      Watch Trailer
                    </a>
                  </div>
                )}

                {/* Metadata Grid */}
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

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button className="bg-white text-black px-6 py-2 rounded-md font-semibold hover:bg-opacity-80 transition">
                    Play
                  </button>
                  <button className="bg-gray-600 bg-opacity-70 text-white px-6 py-2 rounded-md font-semibold hover:bg-opacity-100 transition">
                    + My List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MovieCard;
