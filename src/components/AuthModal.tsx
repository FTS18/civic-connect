import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { X, Loader2 } from "lucide-react";
import { loginWithEmail, signupWithEmail, loginWithGoogle } from "@/lib/firebase";

const AuthModal = () => {
  const { showAuthModal, setShowAuthModal } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleEmailAuth = async (authMode: "login" | "signup") => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      if (authMode === "login") {
        await loginWithEmail(email, password);
        console.log("✅ Login successful!");
      } else {
        await signupWithEmail(email, password);
        console.log("✅ Signup successful!");
      }
      
      // Reset form on success
      setEmail("");
      setPassword("");
      setShowAuthModal(false);
    } catch (err: any) {
      const errorMessage = err.message || "Authentication failed";
      setError(errorMessage);
      console.error(`${authMode} error:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      console.log("🔐 Starting Google sign-in...");
      await loginWithGoogle();
      console.log("✅ Google sign-in successful!");
      
      // Close modal on success
      setShowAuthModal(false);
    } catch (err: any) {
      const errorMessage = err.message || "Google sign-in failed";
      setError(errorMessage);
      console.error("Google sign-in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
      onClick={() => setShowAuthModal(false)}
    >
      <div
        className="bg-white dark:bg-slate-900 p-8 rounded-xl w-full max-w-md shadow-2xl relative z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Login to CivicConnect
          </h2>
          <button
            onClick={() => setShowAuthModal(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Email/Password Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white p-2 disabled:opacity-50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white p-2 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleEmailAuth("login")}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Login
            </button>
            <button
              onClick={() => handleEmailAuth("signup")}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign Up
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                className="w-5 h-5"
                alt="Google logo"
              />
              Sign in with Google
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
