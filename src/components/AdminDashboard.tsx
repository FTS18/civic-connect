import { useState, useEffect } from "react";
import { X, BarChart3, Users, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  issues: any[];
  onUpdateStatus: (issueId: string, status: string) => void;
}

const AdminDashboard = ({ isOpen, onClose, issues, onUpdateStatus }: AdminDashboardProps) => {
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (issues.length > 0) {
      // Calculate statistics
      const reported = issues.filter((i) => i.status === "reported").length;
      const inProgress = issues.filter((i) => i.status === "inProgress").length;
      const resolved = issues.filter((i) => i.status === "resolved").length;

      // Category breakdown
      const categoryBreakdown: any = {};
      issues.forEach((issue) => {
        categoryBreakdown[issue.category] = (categoryBreakdown[issue.category] || 0) + 1;
      });

      // Response time calculation (simplified - time from created to first status change)
      const avgResponseTime = Math.floor(
        issues.reduce((sum, issue) => {
          const createdTime = new Date(issue.createdAt).getTime();
          const now = new Date().getTime();
          return sum + (now - createdTime);
        }, 0) / issues.length / (1000 * 60 * 60) // Convert to hours
      );

      // Total upvotes
      const totalUpvotes = issues.reduce((sum, issue) => sum + (issue.upvotes || 0), 0);

      // Unique users who reported
      const uniqueUsers = new Set(issues.map((i) => i.userId)).size;

      setStats({
        total: issues.length,
        reported,
        inProgress,
        resolved,
        categoryBreakdown,
        avgResponseTime,
        totalUpvotes,
        uniqueUsers,
      });
    }
  }, [issues]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9997] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={32} className="text-blue-600" /> Admin Dashboard
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Statistics Grid */}
          {stats && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Issues</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reported</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.reported}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.inProgress}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.avgResponseTime}h</p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Upvotes</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalUpvotes}</p>
                </div>
                <div className="bg-pink-50 dark:bg-pink-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unique Users</p>
                  <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.uniqueUsers}</p>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Resolution Rate</p>
                  <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    {Math.round((stats.resolved / stats.total) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Category Breakdown */}
          {stats && Object.keys(stats.categoryBreakdown).length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🏷️ Issues by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(stats.categoryBreakdown).map(([category, count]: [string, any]) => (
                  <div key={category} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">{category}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Issue Management */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📋 Manage Issues</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedIssue?.id === issue.id
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500"
                      : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{issue.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reporter: {issue.userName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Upvotes: {issue.upvotes} | Category: {issue.category}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold capitalize ${
                        issue.status === "reported"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                          : issue.status === "inProgress"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                          : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                      }`}
                    >
                      {issue.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issue Detail & Status Update */}
          {selectedIssue && (
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-700">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{selectedIssue.title}</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedIssue.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Reporter</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedIssue.userName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Category</p>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">{selectedIssue.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Upvotes</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedIssue.upvotes}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Downvotes</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedIssue.downvotes || 0}</p>
                </div>
              </div>

              <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Update Status:</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { status: "reported", label: "Reported", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200" },
                    { status: "inProgress", label: "In Progress", color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-200" },
                    { status: "resolved", label: "Resolved", color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200" },
                  ].map((option) => (
                    <button
                      key={option.status}
                      onClick={() => {
                        onUpdateStatus(selectedIssue.id, option.status);
                        setSelectedIssue(null);
                      }}
                      className={`py-2 rounded font-semibold text-sm transition-all ${
                        selectedIssue.status === option.status
                          ? `${option.color} ring-2 ring-offset-2`
                          : option.color
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
