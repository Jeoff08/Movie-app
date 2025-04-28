"use client";

import { useState, useEffect, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const searchRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
      // Blur the input to collapse on mobile if needed
      searchRef.current.blur();
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
    searchRef.current.focus();
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      {/* Mobile search toggle button (hidden on desktop) */}
      <button
        onClick={() => setIsExpanded(true)}
        className="md:hidden p-2 text-gray-300 hover:text-white"
        aria-label="Open search"
      >
        <FiSearch size={24} />
      </button>

      {/* Search form */}
      <form
        onSubmit={handleSubmit}
        ref={searchRef}
        className={`absolute md:static right-0 top-0 z-50 bg-gray-900 md:bg-transparent transition-all duration-300 ${
          isExpanded ? "w-screen md:w-auto" : "w-0 md:w-auto overflow-hidden"
        }`}
      >
        <div
          className={`flex items-center ${
            isExpanded ? "border-b border-gray-700 md:border-none" : ""
          }`}
        >
          {/* Search input */}
          <div className="relative flex-1">
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Titles, people, genres"
              className="w-full bg-gray-800 md:bg-gray-900 text-white px-12 py-3 focus:outline-none focus:bg-gray-700 transition"
              onFocus={() => setIsExpanded(true)}
            />
            <FiSearch
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                aria-label="Clear search"
              >
                <FiX size={20} />
              </button>
            )}
          </div>

          {/* Search button (visible when expanded) */}
          {isExpanded && (
            <button
              type="submit"
              className="bg-gradient-to-b from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 font-medium transition-all"
            >
              Search
            </button>
          )}
        </div>
      </form>

      {/* Overlay for mobile (visible when search is expanded) */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-40 md:hidden" />
      )}
    </div>
  );
};

export default SearchBar;