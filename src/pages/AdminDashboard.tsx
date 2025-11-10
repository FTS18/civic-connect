import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLogin from '@/components/AdminLogin';
import { isAdmin, adminLogout } from '@/lib/firebase';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { LogOut, Search, X, Map, Clock, TrendingUp, Users, AlertCircle, CheckCircle, Filter, ChevronDown } from 'lucide-react';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

const AdminDashboardPage = () => {
  const [adminAuthenticated, setAdminAuthenticated] = useState(isAdmin());
  const [showLoginModal, setShowLoginModal] = useState(!adminAuthenticated);
  const [issues, setIssues] = useState<any[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<any[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const navigate = useNavigate();

  // Load issues from Firestore
  useEffect(() => {
    const loadIssues = async () => {
      try {
        setIsLoading(true);
        const db = getFirestore();
        const issuesRef = collection(db, 'issues');
        const snapshot = await getDocs(issuesRef);
        const issuesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setIssues(issuesList);
      } catch (error) {
        console.error('Error loading issues:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (adminAuthenticated) {
      loadIssues();
    }
  }, [adminAuthenticated]);

  // Filter and sort issues
  useEffect(() => {
    let filtered = [...issues];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(issue => issue.category === categoryFilter);
    }

    // Priority filter (based on upvotes)
    if (priorityFilter === 'high') {
      filtered = filtered.filter(issue => (issue.upvotes || 0) >= 5);
    } else if (priorityFilter === 'medium') {
      filtered = filtered.filter(issue => (issue.upvotes || 0) >= 2 && (issue.upvotes || 0) < 5);
    } else if (priorityFilter === 'low') {
      filtered = filtered.filter(issue => (issue.upvotes || 0) < 2);
    }

    // Date range filter
    const now = new Date();
    if (dateRangeFilter === 'today') {
      filtered = filtered.filter(issue => {
        const issueDate = new Date(issue.createdAt);
        return issueDate.toDateString() === now.toDateString();
      });
    } else if (dateRangeFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(issue => new Date(issue.createdAt) >= weekAgo);
    } else if (dateRangeFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(issue => new Date(issue.createdAt) >= monthAgo);
    }

    // Sort
    if (sortBy === 'upvotes') {
      filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      // recent (default)
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredIssues(filtered);
  }, [issues, searchTerm, statusFilter, categoryFilter, priorityFilter, dateRangeFilter, sortBy]);

  // Initialize map
  // Handle dark mode toggle for map tiles
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const handleDarkModeChange = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      
      // Remove existing tile layer
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      // Add new tile layer based on dark mode
      const tileUrl = isDarkMode 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const attribution = isDarkMode 
        ? '© CartoDB contributors'
        : '© OpenStreetMap contributors';
      
      L.tileLayer(tileUrl, {
        attribution: attribution,
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    };

    // Watch for dark mode changes
    const observer = new MutationObserver(handleDarkModeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !adminAuthenticated || !filteredIssues.length) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([28.6139, 77.2090], 13);
      
      // Use dark mode tiles if dark mode is enabled
      const isDarkMode = document.documentElement.classList.contains('dark');
      const tileUrl = isDarkMode 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const attribution = isDarkMode 
        ? '© CartoDB contributors'
        : '© OpenStreetMap contributors';
      
      L.tileLayer(tileUrl, {
        attribution: attribution,
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => mapInstanceRef.current.removeLayer(marker));
    markersRef.current = [];

    // Create marker cluster group
    const markerCluster = (L as any).markerClusterGroup({
      maxClusterRadius: 80,
      disableClusteringAtZoom: 16,
    });

    // Add new markers
    filteredIssues.forEach(issue => {
      if (issue.latitude && issue.longitude) {
        const color = issue.status === 'resolved' ? '#10b981' : issue.status === 'inProgress' ? '#ef4444' : '#f59e0b';
        
        // Create popup content with optional photos
        let popupContent = `<strong>${issue.title}</strong><br>${issue.category}`;
        if (issue.photos && issue.photos.length > 0) {
          popupContent += `<br><br><img src="${issue.photos[0]}" style="width: 200px; height: 120px; object-fit: cover; border-radius: 4px; margin-top: 8px;" alt="Issue photo"/>`;
          if (issue.photos.length > 1) {
            popupContent += `<br><small style="color: #666;">${issue.photos.length} photos</small>`;
          }
        }
        
        const marker = L.circleMarker(
          [issue.latitude, issue.longitude],
          { radius: 8, fillColor: color, color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.8 }
        )
          .bindPopup(popupContent);
        
        marker.on('click', () => {
          setSelectedIssue(issue);
          setShowIssueModal(true);
        });

        markerCluster.addLayer(marker);
        markersRef.current.push(marker);
      }
    });

    // Add cluster to map
    mapInstanceRef.current.addLayer(markerCluster);

    // Fit bounds if there are markers
    if (markersRef.current.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [filteredIssues, adminAuthenticated]);

  // Calculate statistics
  useEffect(() => {
    if (issues.length > 0) {
      const reported = issues.filter((i) => i.status === "reported").length;
      const inProgress = issues.filter((i) => i.status === "inProgress").length;
      const resolved = issues.filter((i) => i.status === "resolved").length;

      const categoryBreakdown: any = {};
      issues.forEach((issue) => {
        categoryBreakdown[issue.category] = (categoryBreakdown[issue.category] || 0) + 1;
      });

      const totalUpvotes = issues.reduce((sum, issue) => sum + (issue.upvotes || 0), 0);
      const avgUpvotes = (totalUpvotes / issues.length).toFixed(1);
      const highPriorityCount = issues.filter(i => (i.upvotes || 0) >= 5).length;
      const avgTimeToResolve = Math.floor(
        issues
          .filter(i => i.status === 'resolved')
          .reduce((sum, issue) => {
            const created = new Date(issue.createdAt).getTime();
            const resolved = new Date(issue.updatedAt || new Date()).getTime();
            return sum + (resolved - created);
          }, 0) / Math.max(resolved, 1) / (1000 * 60 * 60 * 24)
      );

      setStats({
        total: issues.length,
        reported,
        inProgress,
        resolved,
        categoryBreakdown,
        totalUpvotes,
        avgUpvotes,
        highPriorityCount,
        avgTimeToResolve: isNaN(avgTimeToResolve) ? 0 : avgTimeToResolve,
        categories: Object.keys(categoryBreakdown),
        resolutionRate: ((resolved / issues.length) * 100).toFixed(1),
      });
    }
  }, [issues]);

  const handleLoginSuccess = () => {
    setAdminAuthenticated(true);
    setShowLoginModal(false);
    // Navigation happens automatically via useEffect checking adminAuthenticated
  };

  const handleLogout = () => {
    adminLogout();
    setAdminAuthenticated(false);
    setShowLoginModal(true);
  };

  const handleLoginClose = () => {
    if (!adminAuthenticated) {
      navigate('/');
    }
  };

  const handleUpdateStatus = (issueId: string, status: string) => {
    setIssues(issues.map(issue =>
      issue.id === issueId ? { ...issue, status } : issue
    ));
    setSelectedIssue(null);
    setShowIssueModal(false);
  };

  const handleDeleteIssue = async (issueId: string) => {
    try {
      const db = getFirestore();
      const issueRef = doc(db, 'issues', issueId);
      await deleteDoc(issueRef);
      setIssues(issues.filter(issue => issue.id !== issueId));
      setSelectedIssue(null);
      setShowIssueModal(false);
      console.log('✅ Issue deleted:', issueId);
    } catch (error) {
      console.error('❌ Error deleting issue:', error);
      alert('Failed to delete issue');
    }
  };

  // Get unique categories
  const categories = stats?.categories || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Login Modal */}
      <AdminLogin 
        isOpen={showLoginModal} 
        onClose={handleLoginClose}
        onSuccess={handleLoginSuccess}
      />

      {/* Issue Detail Modal */}
      {showIssueModal && selectedIssue && (
        <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Issue Details</h2>
              <button
                onClick={() => setShowIssueModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedIssue.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedIssue.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-500 font-semibold">Reporter</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedIssue.userName || 'Anonymous'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-500 font-semibold">Category</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{selectedIssue.category}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-500 font-semibold">Upvotes</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">👍 {selectedIssue.upvotes || 0}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-500 font-semibold">Downvotes</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">👎 {selectedIssue.downvotes || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Location</p>
                  <p className="text-gray-900 dark:text-white">{selectedIssue.latitude?.toFixed(4)}, {selectedIssue.longitude?.toFixed(4)}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Created</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedIssue.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Photos Section */}
              {selectedIssue.photos && selectedIssue.photos.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    📸 Photos ({selectedIssue.photos.length})
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedIssue.photos.map((photoUrl: string, index: number) => (
                      <div key={index} className="relative group cursor-pointer">
                        <img 
                          src={photoUrl} 
                          alt={`Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg hover:opacity-75 transition-opacity"
                          onClick={() => setSelectedPhoto(photoUrl)}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                          <span className="text-white text-sm font-semibold">View</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Update Status:</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { status: "reported", label: "📋 Reported", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200" },
                    { status: "inProgress", label: "🔧 In Progress", color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-200" },
                    { status: "resolved", label: "✅ Resolved", color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200" },
                  ].map((option) => (
                    <button
                      key={option.status}
                      onClick={() => handleUpdateStatus(selectedIssue.id, option.status)}
                      className={`py-3 rounded-lg font-semibold transition-all ${
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

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${selectedIssue.title}"?`)) {
                      handleDeleteIssue(selectedIssue.id);
                    }
                  }}
                  className="w-full py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded-lg font-semibold transition-all"
                >
                  🗑️ Delete Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 z-[10001] flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedPhoto} 
              alt="Full size photo"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-white dark:bg-slate-900 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={24} className="text-gray-900 dark:text-white" />
            </button>
          </div>
        </div>
      )}

      {/* If admin is authenticated, show dashboard */}
      {adminAuthenticated ? (
        <div className="w-full">
          {/* Red gradient header - STICKY */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-900 dark:to-red-950 border-b-4 border-red-800 sticky top-0 z-[999] shadow-2xl">
            <div className="px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white">🛡️ Admin Dashboard</h1>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 bg-red-600 dark:bg-red-700 text-white hover:bg-red-700"
              >
                <LogOut className="inline" size={18} /> Admin Logout
              </button>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-10">
            {/* Enhanced Statistics Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📊 Key Metrics</h2>
              {stats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Issues</p>
                      <AlertCircle size={18} className="text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reported</p>
                      <AlertCircle size={18} className="text-yellow-600" />
                    </div>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.reported}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                      <Clock size={18} className="text-red-600" />
                    </div>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.inProgress}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
                      <CheckCircle size={18} className="text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Resolution Rate</p>
                      <TrendingUp size={18} className="text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.resolutionRate}%</p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Upvotes</p>
                      <TrendingUp size={18} className="text-indigo-600" />
                    </div>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.avgUpvotes}</p>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-900/30 p-4 rounded-lg border border-pink-200 dark:border-pink-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
                      <AlertCircle size={18} className="text-pink-600" />
                    </div>
                    <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">{stats.highPriorityCount}</p>
                  </div>
                  <div className="bg-cyan-50 dark:bg-cyan-900/30 p-4 rounded-lg border border-cyan-200 dark:border-cyan-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Time to Resolve</p>
                      <Clock size={18} className="text-cyan-600" />
                    </div>
                    <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{stats.avgTimeToResolve}d</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Upvotes</p>
                      <TrendingUp size={18} className="text-orange-600" />
                    </div>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.totalUpvotes}</p>
                  </div>
                </div>
              ) : null}
            </div>
            {/* Two-Column Layout: List on Left, Map on Right */}
            {!isLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Issues List - Left Side */}
                <div className="lg:col-span-1 h-[800px] flex flex-col bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden">
                {/* Search and Filters */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="mb-4">
                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search issues..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 font-semibold mb-3"
                  >
                    <span className="flex items-center gap-2">
                      <Filter size={16} /> Filters
                    </span>
                    <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>

                  {showFilters && (
                    <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      {/* Status Filter */}
                      <div>
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Status</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white"
                        >
                          <option value="all">All Statuses</option>
                          <option value="reported">📋 Reported</option>
                          <option value="inProgress">🔧 In Progress</option>
                          <option value="resolved">✅ Resolved</option>
                        </select>
                      </div>

                      {/* Category Filter */}
                      <div>
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Category</label>
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white"
                        >
                          <option value="all">All Categories</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Priority Filter */}
                      <div>
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Priority</label>
                        <select
                          value={priorityFilter}
                          onChange={(e) => setPriorityFilter(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white"
                        >
                          <option value="all">All Priorities</option>
                          <option value="high">🔴 High (5+ upvotes)</option>
                          <option value="medium">🟡 Medium (2-4 upvotes)</option>
                          <option value="low">🟢 Low (0-1 upvotes)</option>
                        </select>
                      </div>

                      {/* Date Range Filter */}
                      <div>
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Date Range</label>
                        <select
                          value={dateRangeFilter}
                          onChange={(e) => setDateRangeFilter(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white"
                        >
                          <option value="all">All Time</option>
                          <option value="today">Today</option>
                          <option value="week">Last 7 Days</option>
                          <option value="month">Last 30 Days</option>
                        </select>
                      </div>

                      {/* Sort Filter */}
                      <div>
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Sort By</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white"
                        >
                          <option value="recent">Most Recent</option>
                          <option value="upvotes">Most Upvotes</option>
                          <option value="oldest">Oldest First</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Issues List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredIssues.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      <p>No issues found</p>
                    </div>
                  ) : (
                    <div className="space-y-2 p-4">
                      {filteredIssues.map((issue) => (
                        <div
                          key={issue.id}
                          onClick={() => {
                            setSelectedIssue(issue);
                            setShowIssueModal(true);
                          }}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedIssue?.id === issue.id
                              ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500"
                              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{issue.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{issue.userName || 'Anonymous'}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                👍 {issue.upvotes || 0} | {issue.category}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                              issue.status === "reported"
                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                                : issue.status === "inProgress"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                                : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                            }`}>
                              {issue.status === 'reported' ? '📋' : issue.status === 'inProgress' ? '🔧' : '✅'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Issue count */}
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredIssues.length} of {issues.length} issues
                </div>
              </div>

              {/* Map - Right Side */}
              <div className="lg:col-span-2 h-[800px] bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden">
                <div ref={mapRef} className="w-full h-full" />
              </div>
            </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminDashboardPage;
