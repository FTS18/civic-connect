import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { X, Loader2, CheckCircle2, ArrowLeft, Eye, EyeOff, Mail } from "lucide-react";
import { loginWithEmail, signupWithEmail, loginWithGoogle, forgotPassword, sendVerificationEmail, sendEmailLink } from "@/lib/firebase";

const AuthModal = () => {
  const { showAuthModal, setShowAuthModal } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modalMode, setModalMode] = useState<"auth" | "forgotPassword" | "emailLink">("auth");
  const [resetEmail, setResetEmail] = useState("");
  const [emailLinkSent, setEmailLinkSent] = useState(false);

  if (!showAuthModal) return null;

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Password validation
  const isValidPassword = (password: string) => {
    return password.length >= 6;
  };

  // Form validation
  const validateForm = (requirePassword: boolean = true) => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (requirePassword) {
      if (!password) {
        setError("Password is required");
        return false;
      }
      if (!isValidPassword(password)) {
        setError("Password must be at least 6 characters long");
        return false;
      }
    }
    return true;
  };

  const handleEmailAuth = async (authMode: "login" | "signup") => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      if (authMode === "login") {
        await loginWithEmail(email, password);
        console.log("✅ Login successful!");
        
        // Save remember me preference
        if (rememberMe) {
          localStorage.setItem("civicconnect_rememberMe", "true");
          localStorage.setItem("civicconnect_email", email);
          console.log("💾 Remember Me enabled");
        } else {
          localStorage.removeItem("civicconnect_rememberMe");
          localStorage.removeItem("civicconnect_email");
        }
      } else {
        await signupWithEmail(email, password);
        console.log("✅ Signup successful!");
        
        // Auto-login after signup with remember me
        if (rememberMe) {
          localStorage.setItem("civicconnect_rememberMe", "true");
          localStorage.setItem("civicconnect_email", email);
          console.log("💾 Remember Me enabled after signup");
        }
      }
      
      // Reset form on success
      setEmail("");
      setPassword("");
      setRememberMe(false);
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
      
      // Save remember me preference for Google sign-in
      if (rememberMe) {
        localStorage.setItem("civicconnect_rememberMe", "true");
        localStorage.setItem("civicconnect_authMethod", "google");
        console.log("💾 Remember Me enabled for Google Sign-In");
      } else {
        localStorage.removeItem("civicconnect_rememberMe");
        localStorage.removeItem("civicconnect_authMethod");
      }
      
      // Close modal on success
      setRememberMe(false);
      setShowAuthModal(false);
    } catch (err: any) {
      const errorMessage = err.message || "Google sign-in failed";
      setError(errorMessage);
      console.error("Google sign-in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail || !isValidEmail(resetEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await forgotPassword(resetEmail);
      setSuccess("✅ Password reset link sent! Check your email.");
      setResetEmail("");
      setTimeout(() => {
        setModalMode("auth");
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send reset email";
      setError(errorMessage);
      console.error("Forgot password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLink = async () => {
    if (!validateForm(false)) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await sendEmailLink(email);
      setSuccess("✅ Sign-in link sent! Check your email and click the link to sign in.");
      setEmailLinkSent(true);
      setEmail("");
      setTimeout(() => {
        setModalMode("auth");
        setSuccess("");
        setEmailLinkSent(false);
      }, 4000);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send email link";
      setError(errorMessage);
      console.error("Email link error:", err);
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
          {modalMode !== "auth" && (
            <button
              onClick={() => {
                setModalMode("auth");
                setError("");
                setSuccess("");
                setResetEmail("");
              }}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back</span>
            </button>
          )}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex-1">
            {modalMode === "forgotPassword" ? "Reset Password" : modalMode === "emailLink" ? "Email Link Sign-In" : "Login to CivicConnect"}
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

        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            {success}
          </div>
        )}

        {/* Forgot Password Mode */}
        {modalMode === "forgotPassword" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div>
              <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="resetEmail"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white p-2 disabled:opacity-50"
                placeholder="you@example.com"
              />
            </div>
            <button
              onClick={handleForgotPassword}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send Reset Link
            </button>
          </div>
        )}

        {/* Email Link Mode */}
        {modalMode === "emailLink" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter your email and we'll send you a secure link to sign in without a password.
            </p>
            <div>
              <label htmlFor="emailLinkInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="emailLinkInput"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white p-2 disabled:opacity-50"
                placeholder="you@example.com"
              />
            </div>
            <button
              onClick={handleEmailLink}
              disabled={isLoading || emailLinkSent}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Send Sign-In Link
                </>
              )}
            </button>
          </div>
        )}

        {/* Auth Mode */}
        {modalMode === "auth" && (
          <>
            {/* Email/Password Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email <span className="text-red-500">*</span>
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
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    onClick={() => {
                      setModalMode("forgotPassword");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white p-2 disabled:opacity-50 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {isValidPassword(password) ? "✅ Strong password" : "⚠️ Password must be at least 6 characters"}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  Remember me on this device
                </label>
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

              {/* Email Link Option */}
              <button
                onClick={() => {
                  setModalMode("emailLink");
                  setEmail("");
                  setPassword("");
                  setError("");
                  setSuccess("");
                }}
                disabled={isLoading}
                className="w-full text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-slate-800"
              >
                <Mail className="h-4 w-4" />
                Sign in with Email Link
              </button>
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
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
