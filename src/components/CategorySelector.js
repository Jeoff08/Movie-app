"use client";

function CategorySelector({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-purple-300 mb-2">Categories</h2>
      <div className="flex flex-col gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-300
              ${
                selectedCategory === category
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300"
              }
            `}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategorySelector;
