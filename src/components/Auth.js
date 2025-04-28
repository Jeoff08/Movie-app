// src/components/Auth.jsx
import { useState } from "react";
import { auth } from "../config/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Watcharoo header */}
      <header className="px-12 py-5">
        <div className="w-40">
          <span className="text-3xl font-bold text-purple-500">Watcharoo</span>
          <span className="text-purple-300">+</span>
        </div>
      </header>

      {/* Auth container */}
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-gray-800 bg-opacity-90 rounded-lg p-12 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">
            {isRegistering ? "Create Account" : "Sign In to Watcharoo"}
          </h2>

          {error && (
            <div className="bg-red-600 text-white text-sm rounded-md p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 bg-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 bg-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md font-medium mt-4 transition disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isRegistering ? "Creating Account..." : "Signing In..."}
                </span>
              ) : (
                isRegistering ? "Continue" : "Sign In"
              )}
            </button>
          </form>

          <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="mr-2 accent-purple-500" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <a href="#" className="hover:text-purple-300 hover:underline">Need help?</a>
          </div>

          <div className="mt-8 text-gray-400">
            <p className="mb-2">
              {isRegistering ? "Already have an account?" : "New to Watcharoo?"}{" "}
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-white hover:text-purple-300 hover:underline font-medium"
              >
                {isRegistering ? "Sign in now" : "Sign up now"}
              </button>
            </p>
            <p className="text-xs mt-4">
              This page is protected by Google reCAPTCHA to ensure you're not a bot.{" "}
              <a href="#" className="text-purple-300 hover:underline">Learn more.</a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-sm p-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <p className="mb-6">Questions? 09816196637 WATCHAROO</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <a href="#" className="hover:text-purple-300 hover:underline">FAQ</a>
            <a href="#" className="hover:text-purple-300 hover:underline">Help Center</a>
            <a href="#" className="hover:text-purple-300 hover:underline">Terms of Use</a>
            <a href="#" className="hover:text-purple-300 hover:underline">Privacy</a>
            <a href="#" className="hover:text-purple-300 hover:underline">Cookie Preferences</a>
            <a href="#" className="hover:text-purple-300 hover:underline">Corporate Information</a>
          </div>
          <div className="mb-4">
            <select className="bg-gray-800 border border-gray-700 text-white p-2 rounded hover:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500">
              <option>English</option>
              <option>Español</option>
              <option>Français</option>
              <option>Deutsch</option>
            </select>
          </div>
          <p className="text-xs text-gray-500 mt-8">© 2023 Watcharoo Streaming Services</p>
        </div>
      </footer>
    </div>
  );
}

export default Auth;