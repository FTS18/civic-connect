import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ISSUE_CATEGORIES, type IssueCategory } from "@/types/issue";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude?: number;
  longitude?: number;
  onSubmit: (issueData: {
    title: string;
    category: IssueCategory;
    description: string;
    latitude: number;
    longitude: number;
    address?: string;
    image?: File | null;
  }) => Promise<void>;
}

const ReportModal = ({ isOpen, onClose, latitude = 28.7041, longitude = 77.1025, onSubmit }: ReportModalProps) => {
  const { user, isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<IssueCategory>("other");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <div
        className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-slate-900 p-8 rounded-xl w-full max-w-md shadow-2xl relative z-[10000]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Report an Issue
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <p className="text-blue-900 dark:text-blue-200 font-medium mb-3">
              Please log in to report an issue
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
              You need to be authenticated to report issues and help improve your community.
            </p>
            <button
              onClick={() => {
                onClose();
                // TODO: Open login modal
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onSubmit({
        title,
        category,
        description,
        latitude,
        longitude,
        address,
        image,
      });
      
      setSuccess(true);
      setTitle("");
      setCategory("other");
      setDescription("");
      setAddress("");
      setImage(null);
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to report issue");
      console.error("Report error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 p-8 rounded-xl w-full max-w-2xl shadow-2xl relative z-[10000] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Report an Issue
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {success && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
            ✅ Issue reported successfully! Thank you for helping improve your community.
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Info */}
          <div className="bg-muted dark:bg-slate-800 p-3 rounded-lg mb-6">
            <p className="text-sm font-medium text-foreground">
              Reporting as: <span className="font-semibold">{user?.displayName || user?.email}</span>
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              placeholder="Brief title of the issue"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white p-2 disabled:opacity-50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IssueCategory)}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white p-2 disabled:opacity-50"
            >
              {Object.entries(ISSUE_CATEGORIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              placeholder="Describe the issue in detail"
              rows={4}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white p-2 disabled:opacity-50 resize-none"
            />
          </div>
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              📸 Add Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : null;
                setImage(file);
              }}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white p-2 disabled:opacity-50 cursor-pointer"
            />
            {image && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">✅ Photo selected:</p>
                <p className="text-sm text-blue-700 dark:text-blue-400">{image.name}</p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">Size: {(image.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isLoading}
              placeholder="Street address or location name"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white p-2 disabled:opacity-50"
            />
          </div>

          {/* Coordinates Display */}
          <div className="text-xs text-muted-foreground bg-muted dark:bg-slate-800 p-2 rounded">
            📍 Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Submitting..." : "Report Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
