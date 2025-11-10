import { useState } from "react";
import { X, Lock, Mail, AlertCircle, Users, ShieldAlert } from "lucide-react";
import { adminLogin } from "@/lib/firebase";

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminLogin = ({ isOpen, onClose, onSuccess }: AdminLoginProps) => {
  const [activeTab, setActiveTab] = useState<"user" | "admin">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (activeTab === "admin") {
      // Admin login
      if (!email || !password) {
        setError("Please enter email and password");
        setIsLoading(false);
        return;
      }

      try {
        const success = adminLogin(email, password);
        if (success) {
          setEmail("");
          setPassword("");
          setError("");
          onSuccess();
        } else {
          setError("Invalid admin credentials. Use admin@gmail.com / admin123");
        }
      } catch (err: any) {
        setError(err.message || "Login failed");
      }
    } else {
      // User login - just close and proceed to main portal
      setEmail("");
      setPassword("");
      setError("");
      onClose();
    }
    
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CivicConnect Portal</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setActiveTab("user");
              setError("");
            }}
            className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === "user"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-slate-800/50"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            <Users size={18} /> User Portal
          </button>
          <button
            onClick={() => {
              setActiveTab("admin");
              setError("");
            }}
            className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === "admin"
                ? "border-b-2 border-red-600 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-slate-800/50"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            <ShieldAlert size={18} /> Admin Portal
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {activeTab === "user" ? (
            // User Portal Tab
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Access Public Portal</h3>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  Browse and report civic issues in your area. View issues, upvote, comment, and track resolutions.
                </p>
              </div>
              <button
                onClick={() => onClose()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Enter User Portal
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                No login required to browse and report issues
              </p>
            </div>
          ) : (
            // Admin Portal Tab
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">⚠️ Restricted Access</h3>
                <p className="text-sm text-red-800 dark:text-red-400">
                  Admin portal provides full control over all civic issues, analytics, and management tools. Only authorized administrators have access.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Mail size={16} className="inline mr-2" /> Admin Email
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter admin email"
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Lock size={16} className="inline mr-2" /> Password
                  </label>
                  <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  />
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors"
                >
                  {isLoading ? "Authenticating..." : "Access Admin Dashboard"}
                </button>
              </form>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                This is a demo admin panel. Use the credentials above to test all features.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
