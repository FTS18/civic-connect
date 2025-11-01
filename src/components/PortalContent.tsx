import { useState, useEffect, useRef } from "react";
import { MapPin, AlertCircle, Settings } from "lucide-react";
import L from "leaflet";
import { useAuth } from "@/contexts/AuthContext";
import ReportModal from "./ReportModal";
import type { IssueCategory } from "@/types/issue";

declare global {
  interface Window {
    mapInstance?: L.Map;
    selectedMapLocation?: { lat: number; lng: number };
  }
}

// Demo issues - always visible
const DEMO_ISSUES = [
  {
    id: "demo-1",
    userId: "demo",
    userName: "John Smith",
    title: "Large Pothole on Main Road",
    category: "pothole",
    description: "A dangerous pothole near the intersection that needs immediate repair.",
    status: "reported",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    upvotes: 12,
    location: { lat: 28.7041, lng: 77.1025 },
  },
  {
    id: "demo-2",
    userId: "demo",
    userName: "Sarah Johnson",
    title: "Traffic Light Not Working",
    category: "traffic",
    description: "Traffic light at the main junction is stuck on red.",
    status: "inProgress",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    upvotes: 8,
    location: { lat: 28.6129, lng: 77.2295 },
  },
  {
    id: "demo-3",
    userId: "demo",
    userName: "Mike Williams",
    title: "Street Light Fixed",
    category: "streetLight",
    description: "Street light that was broken has been successfully repaired.",
    status: "resolved",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    upvotes: 5,
    location: { lat: 28.5355, lng: 77.3910 },
  },
];

const PortalContent = () => {
  const { isAuthenticated, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIssueForEdit, setSelectedIssueForEdit] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>(() => {
    // Load issues from localStorage on initial render
    const saved = localStorage.getItem("civicconnect_issues");
    const userReports = saved ? JSON.parse(saved).filter((issue: any) => !issue.id.startsWith("demo-")) : [];
    // Always include demo issues first
    return [...DEMO_ISSUES, ...userReports];
  });
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const mapRef = useRef(null);
  const isDarkMode = document.documentElement.classList.contains("dark");

  useEffect(() => {
    // Initialize Leaflet map
    if (mapRef.current && !window.mapInstance) {
      const defaultLat = 28.7041;
      const defaultLng = 77.1025;

      // Create map instance with specific container
      window.mapInstance = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([defaultLat, defaultLng], 13);

      // Use dark tile layer in dark mode, light in light mode
      const tileUrl = isDarkMode 
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      
      const attribution = isDarkMode
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

      L.tileLayer(tileUrl, {
        attribution: attribution,
        maxZoom: 19,
      }).addTo(window.mapInstance);
      
      // Add dark mode filter to light tiles if in dark mode (as fallback)
      if (isDarkMode) {
        const tileContainer = document.querySelector('.leaflet-tile-pane');
        if (tileContainer) {
          (tileContainer as HTMLElement).style.filter = "invert(0.8) hue-rotate(180deg)";
        }
      }

      // Map click handler for reporting issues
      window.mapInstance.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        setSelectedLocation({ lat, lng });
        window.selectedMapLocation = { lat, lng };
        setShowReportModal(true);
        
        // Add temporary marker at clicked location
        L.marker([lat, lng], {
          icon: L.divIcon({
            className: "custom-div-icon",
            html: `<div style="background-color: #ef4444; width: 1.5rem; height: 1.5rem; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        })
          .addTo(window.mapInstance)
          .bindPopup("📍 <strong>Report Here</strong><br>Fill in the details below");
      });

      // Try to get user's current location
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // Pan map to user's location
            window.mapInstance?.setView([userLat, userLng], 14);

            // Add a marker for user's location
            L.marker([userLat, userLng], {
              icon: L.divIcon({
                className: "custom-div-icon",
                html: `<div style="background-color: #3b82f6; width: 1.5rem; height: 1.5rem; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.2); animation: pulse 2s infinite;"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              }),
            })
              .addTo(window.mapInstance)
              .bindPopup("📍 <strong>Your Location</strong><br>Click on map to report an issue");
          },
          (error) => {
            console.warn("Geolocation error:", error);
          }
        );
      }

      // Handle window resize to fix map display
      const handleResize = () => {
        window.mapInstance?.invalidateSize();
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }

    // Mark loading as complete
    setLoading(false);
  }, []);

  // Persist issues to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("civicconnect_issues", JSON.stringify(issues));
  }, [issues]);

  // Always show all issues (demo + user reports)
  const allIssues = issues.length === 0 ? DEMO_ISSUES : 
    [...DEMO_ISSUES.filter(d => !issues.some(i => i.id === d.id)), ...issues.filter(i => !i.id.startsWith("demo-"))];

  // Filter issues by status
  const filteredIssues = statusFilter === "all" 
    ? allIssues 
    : allIssues.filter(issue => issue.status === statusFilter);

  // Add markers to map for all issues
  useEffect(() => {
    if (!window.mapInstance) return;

    // Clear existing issue markers
    window.mapInstance.eachLayer((layer: any) => {
      if (layer.options?.issueMarker) {
        window.mapInstance?.removeLayer(layer);
      }
    });

    // Add markers for filtered issues
    filteredIssues.forEach((issue) => {
      if (issue.location) {
        const statusColorMap: any = {
          reported: "#F59E0B",
          inProgress: "#EF4444",
          resolved: "#10B981",
        };

        const marker = L.marker([issue.location.lat, issue.location.lng], {
          icon: L.divIcon({
            className: "custom-div-icon",
            html: `<div style="background-color: ${statusColorMap[issue.status] || "#F59E0B"}; width: 1.5rem; height: 1.5rem; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.2); cursor: pointer;"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        } as any);

        marker.options.issueMarker = true;
        marker.bindPopup(`<strong>${issue.title}</strong><br>${issue.description}<br><small>${issue.userName}</small>`);
        marker.addTo(window.mapInstance);
      }
    });
  }, [filteredIssues]);

  const handleReportSubmit = async (issueData: {
    title: string;
    category: IssueCategory;
    description: string;
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    try {
      // Create new issue object
      const newIssue = {
        id: `issue-${Date.now()}`,
        userId: user?.uid || "anonymous",
        userName: user?.displayName || user?.email || "Anonymous",
        title: issueData.title,
        category: issueData.category,
        description: issueData.description,
        location: {
          lat: issueData.latitude,
          lng: issueData.longitude,
        },
        address: issueData.address,
        status: "reported" as const,
        createdAt: new Date(),
        upvotes: 1,
      };

      // Add to issues list with logging
      console.log("📝 Adding new issue:", newIssue);
      console.log("📊 Current issues count:", issues.length);
      
      setIssues((prevIssues) => {
        const updatedIssues = [newIssue, ...prevIssues];
        console.log("✅ Issue reported. New count:", updatedIssues.length);
        console.log("✅ Updated issues list:", updatedIssues);
        return updatedIssues;
      });

      // TODO: Save to Firestore

      // Close modal
      setShowReportModal(false);
      setSelectedLocation(null);
    } catch (error) {
      console.error("Error submitting report:", error);
      throw error;
    }
  };

  // Update issue status
  const updateIssueStatus = (issueId: string, newStatus: "reported" | "inProgress" | "resolved") => {
    setIssues((prevIssues) =>
      prevIssues.map((issue) =>
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      )
    );
    setSelectedIssueForEdit(null);
  };

  // Zoom to issue location on map
  const zoomToIssueLocation = (issue: any) => {
    if (window.mapInstance && issue.location) {
      window.mapInstance.setView([issue.location.lat, issue.location.lng], 16, {
        animate: true,
        duration: 1,
      });
    }
  };

  const statusColors = {
    reported: "#F59E0B",
    inProgress: "#EF4444",
    resolved: "#10B981",
  };

  return (
    <main className="w-full min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        {/* Status Filter Tabs */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl shadow-lg mb-8 ring-2 ring-indigo-200/50 dark:ring-indigo-900/50">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Filter by Status</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { key: "all", label: "All Reports", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700" },
              { key: "reported", label: "Reported", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700" },
              { key: "inProgress", label: "In Progress", color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700" },
              { key: "resolved", label: "Resolved", color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all border-2 ${
                  statusFilter === tab.key
                    ? `${tab.color} shadow-md scale-105`
                    : `border-transparent opacity-60 hover:opacity-100 ${tab.color}`
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Map Section with filtered issues */}
        <div className="mb-10 bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden ring-2 ring-indigo-200/50 dark:ring-indigo-900/50">
          <div className="relative w-full" style={{ height: "500px", maxHeight: "70vh" }}>
            <div
              ref={mapRef}
              id="map"
              className="w-full h-full"
              style={{ position: "relative" }}
            ></div>
          </div>
        </div>

        {/* Issues List Section */}
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 border-b border-blue-200 dark:border-blue-800 pb-2">
          {statusFilter === "all" ? "All Reports" : `${statusFilter} Reports`}
        </h2>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 col-span-full mb-4 font-medium">
            Loading issues...
          </p>
        ) : (
          <>
            {filteredIssues.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No {statusFilter === "all" ? "issues" : statusFilter + " issues"} reported yet.
              </p>
            ) : (
              <div id="issues-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="issue-card bg-white dark:bg-slate-800 p-5 rounded-lg border-l-4 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    style={{
                      borderLeftColor: statusColors[issue.status] || statusColors.reported,
                    }}
                    onClick={() => {
                      zoomToIssueLocation(issue);
                      if (isAdmin) setSelectedIssueForEdit(issue);
                    }}
                  >
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{issue.title}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                      Reported by: <span className="font-semibold">{issue.userName || "Anonymous"}</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <span className="font-medium">{issue.category}</span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">{issue.description}</p>
                    <div className="flex justify-start items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className={`font-semibold capitalize px-3 py-1 rounded text-xs ${
                        issue.status === "reported" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200" :
                        issue.status === "inProgress" ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200" :
                        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                      }`}>
                        {issue.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Map Click Instructions */}
        {isAuthenticated && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                💡 Tip: Click anywhere on the map to report an issue at that location!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        latitude={selectedLocation?.lat || 28.7041}
        longitude={selectedLocation?.lng || 77.1025}
        onSubmit={handleReportSubmit}
      />

      {/* Admin Toggle Button - Bottom Right */}
      <button
        onClick={() => setIsAdmin(!isAdmin)}
        className={`fixed bottom-8 right-8 p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 z-[100] ${
          isAdmin
            ? "bg-red-600 dark:bg-red-700 text-white"
            : "bg-blue-600 dark:bg-blue-700 text-white"
        }`}
        title={isAdmin ? "Disable Admin Mode" : "Enable Admin Mode"}
      >
        <Settings className="h-6 w-6" />
      </button>

      {/* Admin Panel - Status Editor */}
      {isAdmin && selectedIssueForEdit && (
        <div className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-2xl max-w-md w-full z-[10000]">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Update Issue Status</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedIssueForEdit.title}</p>
            <div className="space-y-2">
              {[
                { status: "reported", label: "Reported", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200" },
                { status: "inProgress", label: "In Progress", color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200" },
                { status: "resolved", label: "Resolved", color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" },
              ].map((option) => (
                <button
                  key={option.status}
                  onClick={() => {
                    updateIssueStatus(selectedIssueForEdit.id, option.status as "reported" | "inProgress" | "resolved");
                  }}
                  className={`w-full py-2 rounded font-semibold transition-all ${
                    selectedIssueForEdit.status === option.status
                      ? `${option.color} ring-2 ring-offset-2`
                      : `${option.color} opacity-60 hover:opacity-100`
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedIssueForEdit(null)}
              className="w-full mt-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded font-semibold hover:bg-gray-400 dark:hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Click Issue Cards to Edit (in admin mode) */}
      {isAdmin && (
        <style>{`
          .issue-card {
            cursor: pointer;
          }
          .issue-card:hover {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
          }
        `}</style>
      )}
    </main>
  );
};

export default PortalContent;
