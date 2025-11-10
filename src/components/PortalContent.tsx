import { useState, useEffect, useRef } from "react";
import { MapPin, AlertCircle, Map, List, Navigation, ThumbsUp, ThumbsDown, Share2, Lightbulb, Search, Filter, BarChart3, LogOut } from "lucide-react";
import L from "leaflet";
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { useAuth } from "@/contexts/AuthContext";
import ReportModal from "./ReportModal";
import AdminDashboard from "./AdminDashboard";
import type { IssueCategory } from "@/types/issue";
import { addIssueToFirestore, deleteIssueFromFirestore, updateIssueStatusInFirestore, getAllIssuesFromFirestore, isAdmin, adminLogout } from "@/lib/firebase";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

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
    userName: "Rajesh Kumar",
    title: "Road Damage - Connaught Place",
    category: "pothole",
    description: "Large crater-sized pothole on CP road causing traffic congestion. Needs immediate attention.",
    status: "reported",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    upvotes: 12,
    location: { lat: 28.7041, lng: 77.1025 },
  },
  {
    id: "demo-2",
    userId: "demo",
    userName: "Priya Singh",
    title: "Signal Malfunction - Kasturba Nagar",
    category: "traffic",
    description: "Traffic signal at Kasturba Nagar junction is malfunctioning. Causing traffic problems.",
    status: "inProgress",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    upvotes: 8,
    location: { lat: 28.6129, lng: 77.2295 },
  },
  {
    id: "demo-3",
    userId: "demo",
    userName: "Amit Patel",
    title: "Street Light Repaired - Greater Kailash",
    category: "streetLight",
    description: "Broken street light at Greater Kailash has been successfully repaired by municipal team.",
    status: "resolved",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    upvotes: 5,
    location: { lat: 28.5355, lng: 77.3910 },
  },
];

const PortalContent = () => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIssueForEdit, setSelectedIssueForEdit] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>(() => {
    // Always start with demo issues
    return [...DEMO_ISSUES];
  });
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [userVotes, setUserVotes] = useState<{ [issueId: string]: "up" | "down" | null }>({});
  const [showSuggestionModal, setShowSuggestionModal] = useState<string | null>(null);
  const [suggestionText, setSuggestionText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "upvotes" | "activity">("date");
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const mapRef = useRef(null);
  const clusterGroupRef = useRef<any>(null);
  const isDarkMode = document.documentElement.classList.contains("dark");

  // Check admin authentication on mount
  useEffect(() => {
    setAdminAuthenticated(isAdmin());
  }, []);

  // Update issues when authentication state changes or auth finishes loading
  useEffect(() => {
    const loadIssues = async () => {
      // Always show demo issues
      let allIssues = [...DEMO_ISSUES];
      
      // Load all Firestore issues for everyone (not just authenticated users)
      try {
        setLoading(true);
        const firestoreIssues = await getAllIssuesFromFirestore();
        
        console.log('🔍 [ZURI] Raw Firestore issues:', firestoreIssues);
        
        // Convert Firestore data format to our format
        const formattedFirestoreIssues = firestoreIssues.map((issue: any) => ({
          id: issue.id,
          userId: issue.userId || "unknown",
          userName: issue.userName || "Anonymous",
          title: issue.title,
          category: issue.category,
          description: issue.description,
          status: issue.status || "reported",
          createdAt: issue.createdAt?.toDate ? issue.createdAt.toDate() : new Date(issue.createdAt),
          upvotes: issue.upvotes || 0,
          downvotes: issue.downvotes || 0,
          location: { lat: issue.latitude, lng: issue.longitude },
          photos: issue.photos || undefined,
        }));
        
        console.log('✅ [ZURI] Formatted issues with photos:', formattedFirestoreIssues.map((i: any) => ({ id: i.id, title: i.title, photos: i.photos })));
        
        // Combine demo issues with all Firestore issues
        allIssues = [...DEMO_ISSUES, ...formattedFirestoreIssues];
      } catch (error) {
        console.error("❌ Error loading issues:", error);
        // Fallback to demo issues if Firestore fails
      } finally {
        setIssues(allIssues);
        setLoading(false);
      }
    };
    
    loadIssues();
  }, [isAuthenticated]);

  // Load user votes from localStorage on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      const userVotesKey = `civic-votes-${user.uid}`;
      const savedVotes = localStorage.getItem(userVotesKey);
      if (savedVotes) {
        try {
          const parsedVotes = JSON.parse(savedVotes);
          setUserVotes(parsedVotes);
        } catch (error) {
          console.error("Error loading votes:", error);
        }
      }
    }

    // Load offline queue from localStorage
    const queueKey = "civic-offline-queue";
    const savedQueue = localStorage.getItem(queueKey);
    if (savedQueue) {
      try {
        const parsedQueue = JSON.parse(savedQueue);
        setOfflineQueue(parsedQueue);
      } catch (error) {
        console.error("Error loading offline queue:", error);
      }
    }
  }, [isAuthenticated, user?.uid]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log("🌐 Back online");
      syncOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("📴 Offline mode");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [offlineQueue]);

  // Sync offline queue with Firestore
  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;

    console.log(`🔄 Syncing ${offlineQueue.length} offline item(s)`);
    const itemsToSync = [...offlineQueue];
    let syncedCount = 0;
    
    for (const item of itemsToSync) {
      try {
        if (item.type === "issue") {
          await addIssueToFirestore(item.data);
          setOfflineQueue((prev) => prev.filter((i) => i.id !== item.id));
          syncedCount++;
          
          // Update localStorage after each successful sync
          const queueKey = "civic-offline-queue";
          const updatedQueue = JSON.parse(localStorage.getItem(queueKey) || "[]").filter((i: any) => i.id !== item.id);
          localStorage.setItem(queueKey, JSON.stringify(updatedQueue));
        }
      } catch (error) {
        console.error("Sync failed for item:", item.id);
      }
    }
    
    if (syncedCount > 0) {
      console.log(`✅ Synced ${syncedCount} item(s)`);
    }
  };

  useEffect(() => {
    // Request geolocation permission early
    if ("geolocation" in navigator) {
      navigator.permissions?.query?.({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          console.log("📍 Geolocation permission granted");
        } else if (result.state === 'prompt') {
          console.log("📍 Geolocation permission pending - will request when map loads");
        }
      }).catch(() => {
        // Permissions API not available, continue anyway
        console.log("📍 Permissions API not available");
      });
    }

    // Initialize Leaflet map
    if (mapRef.current) {
      // Clean up existing map instance if it exists
      if (window.mapInstance) {
        window.mapInstance.remove();
        window.mapInstance = undefined;
      }

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
      
      // Remove the invert filter - use proper dark tiles instead
      // Markers are always colored regardless of theme

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
        // Clean up map on unmount
        if (window.mapInstance) {
          window.mapInstance.remove();
          window.mapInstance = undefined;
        }
      };
    }
  }, []);

  // Handle dark mode toggle for map tiles on Portal
  useEffect(() => {
    const handleDarkModeChange = () => {
      if (!window.mapInstance) return;

      const isDarkMode = document.documentElement.classList.contains('dark');
      
      // Remove existing tile layer
      window.mapInstance.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) {
          window.mapInstance.removeLayer(layer);
        }
      });

      // Add new tile layer based on dark mode
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
    };

    // Watch for dark mode changes
    const observer = new MutationObserver(handleDarkModeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Persist ONLY user-reported issues to localStorage (not demo issues)
  useEffect(() => {
    if (!isAuthenticated) {
      // Don't save anything when logged out
      return;
    }
    
    // Filter out demo issues before saving
    const userIssues = issues.filter((issue: any) => !issue.id.startsWith("demo-"));
    console.log("🔍 All issues in state:", issues.length, issues.map((i: any) => ({ id: i.id, title: i.title })));
    console.log("🔍 Filtered user issues:", userIssues.length, userIssues.map((i: any) => ({ id: i.id, title: i.title })));
    
    if (userIssues.length === 0) {
      // Clear localStorage if no user issues
      localStorage.removeItem("civicconnect_issues");
      console.log("🧹 Cleared localStorage (no user issues)");
    } else {
      // Save user issues
      localStorage.setItem("civicconnect_issues", JSON.stringify(userIssues));
      console.log(`💾 Saved ${userIssues.length} user issues to localStorage`);
    }
  }, [issues, isAuthenticated]);

  // Always show all issues (demo + user reports)
  const allIssues = issues;

  // Advanced filtering: status + search + categories
  let filteredIssues = allIssues
    .filter((issue) => statusFilter === "all" || issue.status === statusFilter)
    .filter((issue) => {
      // Search by title or description
      const query = searchQuery.toLowerCase();
      return (
        issue.title.toLowerCase().includes(query) ||
        issue.description.toLowerCase().includes(query) ||
        issue.userName.toLowerCase().includes(query)
      );
    })
    .filter((issue) => {
      // Filter by categories (if any selected, show only those; if none selected, show all)
      if (selectedCategories.length === 0) return true;
      return selectedCategories.includes(issue.category);
    });

  // Sort filtered issues
  filteredIssues.sort((a, b) => {
    if (sortBy === "date") {
      // Newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "upvotes") {
      // Most upvoted first
      return (b.upvotes || 0) - (a.upvotes || 0);
    } else if (sortBy === "activity") {
      // Most recently active (based on suggestions count)
      return (b.suggestions?.length || 0) - (a.suggestions?.length || 0);
    }
    return 0;
  });

  // Get all unique categories from issues
  const allCategories = Array.from(new Set(allIssues.map((issue) => issue.category)));

  // Zoom to issue location on map
  const zoomToIssueLocation = (issue: any) => {
    if (window.mapInstance && issue.location) {
      window.mapInstance.setView([issue.location.lat, issue.location.lng], 16, {
        animate: true,
        duration: 1,
      });
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (window.mapInstance) {
            window.mapInstance.setView([latitude, longitude], 14, {
              animate: true,
              duration: 1,
            });
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to access your location. Please check permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Add clustered markers to map for all issues
  useEffect(() => {
    if (!window.mapInstance) return;

    // Remove existing cluster group if present
    if (clusterGroupRef.current) {
      window.mapInstance.removeLayer(clusterGroupRef.current);
    }

    // Create marker cluster group
    const markerCluster = (L as any).markerClusterGroup({
      maxClusterRadius: 80,
      disableClusteringAtZoom: 16,
    });

    const statusColorMap: any = {
      reported: "#F59E0B",
      inProgress: "#EF4444",
      resolved: "#10B981",
    };

    // Add markers for filtered issues to cluster group
    filteredIssues.forEach((issue) => {
      if (issue.location) {
        const marker = L.marker([issue.location.lat, issue.location.lng], {
          icon: L.divIcon({
            className: "custom-div-icon",
            html: `<div style="background-color: ${statusColorMap[issue.status] || "#F59E0B"}; width: 1.5rem; height: 1.5rem; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.2); cursor: pointer;"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        } as any);

        // Create popup content with optional photos
        let popupContent = `<strong>${issue.title}</strong><br>${issue.description}<br><small>${issue.userName}</small>`;
        if (issue.photos && issue.photos.length > 0) {
          popupContent += `<br><br><img src="${issue.photos[0]}" style="width: 100%; max-width: 250px; height: auto; max-height: 150px; object-fit: cover; border-radius: 4px; margin-top: 8px; cursor: pointer;" alt="Issue photo" onclick="window.dispatchEvent(new CustomEvent('openImage', { detail: '${issue.photos[0]}' }))"/>`;
          if (issue.photos.length > 1) {
            popupContent += `<br><small style="color: #666;">${issue.photos.length} photos</small>`;
          }
        }
        
        marker.bindPopup(popupContent);
        marker.on('click', () => zoomToIssueLocation(issue));
        markerCluster.addLayer(marker);
      }
    });

    // Add cluster to map
    markerCluster.addTo(window.mapInstance);
    clusterGroupRef.current = markerCluster;
  }, [filteredIssues]);

  // Listen for image open events from map popups
  useEffect(() => {
    const handleOpenImage = (e: any) => {
      setSelectedImage(e.detail);
    };
    window.addEventListener('openImage', handleOpenImage);
    return () => window.removeEventListener('openImage', handleOpenImage);
  }, []);

  const handleReportSubmit = async (issueData: {
    title: string;
    category: IssueCategory;
    description: string;
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    console.log('📝 [ZURI] Starting issue submission:', {
      title: issueData.title,
      category: issueData.category,
      hasImage: !!issueData.image,
      imageSize: issueData.image ? `${(issueData.image.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'
    });

    try {
      // Upload photo to Cloudinary if provided
      const photoUrls: string[] = [];
      if (issueData.image) {
        try {
          console.log("📸 [ZURI] Starting photo upload to Cloudinary...");
          const cloudinaryResponse = await uploadImageToCloudinary(issueData.image, "civic-connect-issues");
          photoUrls.push(cloudinaryResponse.secure_url);
          console.log("✅ [ZURI] Photo uploaded successfully to:", cloudinaryResponse.secure_url);
          
          // Additional verification - try to load the image
          const img = new Image();
          img.onload = () => console.log('✅ [ZURI] Image loads correctly in browser');
          img.onerror = () => console.error('❌ [ZURI] Image failed to load in browser');
          img.src = cloudinaryResponse.secure_url;
        } catch (uploadError) {
          console.error("❌ [ZURI] Photo upload failed, continuing without photo:", uploadError);
        }
      }
      
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
        photos: photoUrls.length > 0 ? photoUrls : undefined,
        status: "reported" as const,
        createdAt: new Date(),
        upvotes: 0,
        downvotes: 0,
      };

      // Add to issues list
      setIssues((prevIssues) => [newIssue, ...prevIssues]);

      console.log('💾 [ZURI] Saving issue to Firestore...');
      
      // Save to Firestore
      try {
        const firestoreData = {
          title: issueData.title,
          category: issueData.category,
          description: issueData.description,
          latitude: issueData.latitude,
          longitude: issueData.longitude,
          address: issueData.address,
          userId: user?.uid || "anonymous",
          userName: user?.displayName || user?.email || "Anonymous",
          ...(photoUrls.length > 0 && { photos: photoUrls }),
        };
        
        console.log('📝 [ZURI] Firestore data to save:', {
          ...firestoreData,
          photos: photoUrls.length > 0 ? `${photoUrls.length} photo(s)` : 'No photos'
        });
        
        if (isOnline) {
          // Save directly to Firestore when online
          const firestoreId = await addIssueToFirestore(firestoreData);
          console.log("✅ [ZURI] Issue saved to Firestore with ID:", firestoreId);
        } else {
          // Queue for later sync when offline
          console.log("📴 [ZURI] Offline - issue queued for sync");
          const queueItem = {
            id: `queue-${Date.now()}`,
            type: "issue",
            data: firestoreData,
            timestamp: new Date(),
          };
          setOfflineQueue((prev) => [...prev, queueItem]);
          
          // Also save to localStorage
          const queueKey = "civic-offline-queue";
          const existingQueue = JSON.parse(localStorage.getItem(queueKey) || "[]");
          localStorage.setItem(queueKey, JSON.stringify([...existingQueue, queueItem]));
        }
      } catch (firestoreError) {
        console.error("❌ [ZURI] Firestore save error:", firestoreError);
      }

      // Close modal
      setShowReportModal(false);
      setSelectedLocation(null);
      
      console.log('✅ [ZURI] Issue submission completed successfully');
    } catch (error) {
      console.error("❌ [ZURI] Error submitting report:", error);
      throw error;
    }
  };

  // Update issue status
  const updateIssueStatus = async (issueId: string, newStatus: "reported" | "inProgress" | "resolved") => {
    setIssues((prevIssues) =>
      prevIssues.map((issue) =>
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      )
    );
    setSelectedIssueForEdit(null);

    // Update in Firestore
    try {
      await updateIssueStatusInFirestore(issueId, newStatus);
      console.log(`💾 Issue ${issueId} status updated in Firestore to ${newStatus}`);
    } catch (error) {
      console.error("⚠️ Warning: Could not update status in Firestore:", error);
      // Status is already updated locally, so continue
    }
  };

  // Delete issue - only allow users to delete their own issues or admins
  const deleteIssue = async (issueId: string, issueUserId: string) => {
    // Don't allow deleting demo issues
    if (issueId.startsWith("demo-")) {
      console.warn("Cannot delete demo issues");
      return;
    }

    // Check if user is the owner or is admin
    if (user?.uid === issueUserId || adminAuthenticated) {
      setIssues((prevIssues) => prevIssues.filter((issue) => issue.id !== issueId));
      console.log(`✅ Issue ${issueId} deleted locally`);

      // Delete from Firestore
      try {
        await deleteIssueFromFirestore(issueId);
        console.log(`💾 Issue ${issueId} deleted from Firestore`);
      } catch (error) {
        console.error("⚠️ Warning: Could not delete from Firestore:", error);
        // Issue is already deleted locally, so continue
      }
    } else {
      console.warn("You can only delete your own issues");
    }
  };

  // Handle upvote
  const handleUpvote = (issueId: string) => {
    if (!isAuthenticated) {
      alert("Please login to upvote");
      return;
    }

    // Update user votes first (for instant UI feedback)
    const currentVote = userVotes[issueId];
    const newVote = currentVote === "up" ? null : "up";
    setUserVotes((prev) => {
      const updated = { ...prev, [issueId]: newVote };
      // Save to localStorage with user ID
      const userVotesKey = `civic-votes-${user?.uid}`;
      localStorage.setItem(userVotesKey, JSON.stringify(updated));
      return updated;
    });

    // Then update issues
    setIssues((prevIssues) =>
      prevIssues.map((issue) => {
        if (issue.id === issueId) {
          let newUpvotes = issue.upvotes;
          let newDownvotes = issue.downvotes || 0;

          if (currentVote === "up") {
            // Remove upvote
            newUpvotes = Math.max(0, newUpvotes - 1);
          } else if (currentVote === "down") {
            // Switch from downvote to upvote
            newUpvotes += 1;
            newDownvotes = Math.max(0, newDownvotes - 1);
          } else {
            // Add upvote
            newUpvotes += 1;
          }

          return { ...issue, upvotes: newUpvotes, downvotes: newDownvotes };
        }
        return issue;
      })
    );
  };

  // Handle downvote
  const handleDownvote = (issueId: string) => {
    if (!isAuthenticated) {
      alert("Please login to downvote");
      return;
    }

    // Update user votes first (for instant UI feedback)
    const currentVote = userVotes[issueId];
    const newVote = currentVote === "down" ? null : "down";
    setUserVotes((prev) => {
      const updated = { ...prev, [issueId]: newVote };
      // Save to localStorage with user ID
      const userVotesKey = `civic-votes-${user?.uid}`;
      localStorage.setItem(userVotesKey, JSON.stringify(updated));
      return updated;
    });

    // Then update issues
    setIssues((prevIssues) =>
      prevIssues.map((issue) => {
        if (issue.id === issueId) {
          let newUpvotes = issue.upvotes;
          let newDownvotes = issue.downvotes || 0;

          if (currentVote === "down") {
            // Remove downvote
            newDownvotes = Math.max(0, newDownvotes - 1);
          } else if (currentVote === "up") {
            // Switch from upvote to downvote
            newUpvotes = Math.max(0, newUpvotes - 1);
            newDownvotes += 1;
          } else {
            // Add downvote
            newDownvotes += 1;
          }

          return { ...issue, upvotes: newUpvotes, downvotes: newDownvotes };
        }
        return issue;
      })
    );
  };

  // Handle share
  const handleShare = (issue: any) => {
    const shareText = `Check out this civic issue: "${issue.title}" - ${issue.description}`;
    
    if (navigator.share) {
      navigator.share({
        title: "CivicConnect - " + issue.title,
        text: shareText,
        url: window.location.href,
      }).catch((error) => console.log("Share error:", error));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText + "\n" + window.location.href);
      alert("Share link copied to clipboard!");
    }
  };

  // Handle suggestion submit
  const handleAddSuggestion = (issueId: string) => {
    if (!isAuthenticated) {
      alert("Please login to add suggestions");
      return;
    }

    if (!suggestionText.trim()) {
      alert("Please enter a suggestion");
      return;
    }

    setIssues((prevIssues) =>
      prevIssues.map((issue) => {
        if (issue.id === issueId) {
          const newSuggestion = {
            id: `suggestion-${Date.now()}`,
            userId: user?.uid || "anonymous",
            userName: user?.displayName || user?.email || "Anonymous",
            text: suggestionText,
            createdAt: new Date(),
          };
          return {
            ...issue,
            suggestions: [...(issue.suggestions || []), newSuggestion],
          };
        }
        return issue;
      })
    );

    setSuggestionText("");
    setShowSuggestionModal(null);
  };
  const statusColors = {
    reported: "#F59E0B",
    inProgress: "#EF4444",
    resolved: "#10B981",
  };

  return (
    <main className="w-full min-h-screen bg-white dark:bg-slate-950">
      {/* Offline Status Indicator */}
      {!isOnline && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border-b-2 border-yellow-400 dark:border-yellow-700 px-4 py-2 sticky top-0 z-[998]">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
              📴 You're offline - changes will be synced when you reconnect
            </span>
            {offlineQueue.length > 0 && (
              <span className="ml-auto text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                {offlineQueue.length} item{offlineQueue.length > 1 ? 's' : ''} queued
              </span>
            )}
          </div>
        </div>
      )}

      {/* If Admin is Authenticated, Show Full Admin Dashboard */}
      {adminAuthenticated ? (
        <div className="w-full">
          {/* Admin Header - Full Width */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-900 dark:to-red-950 border-b-4 border-red-800 sticky top-0 z-[999] shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-white">🛡️ Admin Dashboard</h1>
                <p className="text-red-100 mt-1">Civic Issue Management & Analytics</p>
              </div>
              <button
                onClick={() => {
                  adminLogout();
                  setAdminAuthenticated(false);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                title="Logout from Admin Portal"
              >
                <LogOut size={20} /> Logout
              </button>
            </div>
          </div>

          {/* Admin Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
            {/* Full Admin Dashboard with All Issues */}
            <AdminDashboard
              isOpen={true}
              onClose={() => {}}
              issues={issues.filter((i) => !i.id.startsWith("demo-"))}
              onUpdateStatus={updateIssueStatus}
            />

            {/* Additional Admin Controls - Show ALL Issues in a Table */}
            <div className="mt-10 bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">📋 All Issues Management</h2>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg font-semibold">
                  Total: {issues.filter((i) => !i.id.startsWith("demo-")).length} issues
                </div>
              </div>
              
              {/* Search for Admin */}
              <div className="mb-6">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="🔍 Search by title, description, or reporter..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Issues List with Better Styling */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {issues.filter((i) => !i.id.startsWith("demo-")).length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">✨ No issues reported yet!</p>
                  </div>
                ) : (
                  issues
                    .filter((i) => !i.id.startsWith("demo-"))
                    .filter(
                      (issue) =>
                        searchQuery === "" ||
                        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        issue.description.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((issue) => (
                      <div
                        key={issue.id}
                        className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 transition-all cursor-pointer shadow-md hover:shadow-lg hover:scale-105"
                        onClick={() => setSelectedIssueForEdit(issue)}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white">{issue.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              by {issue.userName} • {new Date(issue.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{issue.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`px-3 py-1 rounded text-xs font-bold ${
                                issue.status === "reported"
                                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                                  : issue.status === "inProgress"
                                  ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                                  : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                              }`}
                            >
                              {issue.status}
                            </span>
                            <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                              👍 {issue.upvotes || 0} 👎 {issue.downvotes || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Regular User Portal
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        {/* Search and Advanced Filters */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg mb-6 border border-gray-200 dark:border-gray-700">
          {/* Search Bar */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search issues by title, description, or reporter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowAdminDashboard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              title="Open Admin Dashboard"
            >
              <BarChart3 size={20} /> Dashboard
            </button>
          </div>

          {/* Category Filter */}
          {allCategories.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Filter size={16} className="inline mr-2" /> Filter by Category
              </label>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategories((prev) =>
                        prev.includes(category)
                          ? prev.filter((c) => c !== category)
                          : [...prev, category]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      selectedCategories.includes(category)
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="flex gap-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              Sort by:
            </label>
            {[
              { value: "date", label: "📅 Newest First" },
              { value: "upvotes", label: "👍 Most Upvoted" },
              { value: "activity", label: "💬 Most Active" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as "date" | "upvotes" | "activity")}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  sortBy === option.value
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

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
          {/* View Toggle Controls */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                viewMode === "map"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
              }`}
            >
              <Map size={16} /> Map
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                viewMode === "list"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
              }`}
            >
              <List size={16} /> List
            </button>
            
            {/* Locate Me Button */}
            {viewMode === "map" && (
              <button
                onClick={handleLocateMe}
                className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm bg-indigo-500 hover:bg-indigo-600 text-white shadow-md transition-all"
                title="Center map on your current location"
              >
                <Navigation size={16} /> Locate Me
              </button>
            )}
          </div>

          {/* Map Display */}
          {viewMode === "map" ? (
            <div className="relative w-full" style={{ height: "500px", maxHeight: "70vh" }}>
              <div
                ref={mapRef}
                id="map"
                className="w-full h-full"
                style={{ position: "relative" }}
              ></div>
            </div>
          ) : null}
        </div>

        {/* Issues List Section */}
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 border-b border-blue-200 dark:border-blue-800 pb-2">
          {statusFilter === "all" ? "All Reports" : `${statusFilter} Reports`}
        </h2>

        {!loading && (
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
                    className="issue-card bg-white dark:bg-slate-800 p-5 rounded-lg border-l-4 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer relative group overflow-hidden"
                    style={{
                      borderLeftColor: statusColors[issue.status] || statusColors.reported,
                    }}
                    onClick={() => {
                      zoomToIssueLocation(issue);
                      if (adminAuthenticated) setSelectedIssueForEdit(issue);
                    }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                      e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                    }}
                  >
                    {/* Direction-aware spotlight effect */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(59, 130, 246, 0.08), transparent 40%)'
                      }}
                    />
                    {/* Share Button - Top Right */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(issue);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Share this issue"
                    >
                      <Share2 size={16} />
                    </button>

                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 pr-10">{issue.title}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                      Reported by: <span className="font-semibold">{issue.userName || "Anonymous"}</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <span className="font-medium">{issue.category}</span>
                    </p>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">{issue.description}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700 mb-3">
                      <span className={`font-semibold capitalize px-3 py-1 rounded text-xs ${
                        issue.status === "reported" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200" :
                        issue.status === "inProgress" ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200" :
                        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                      }`}>
                        {issue.status}
                      </span>
                      
                      {/* Delete Button - Show for issue owner or admin */}
                      {(isAuthenticated && (user?.uid === issue.userId || issue.userId === "anonymous" && user?.email === issue.userName) || adminAuthenticated) && !issue.id.startsWith("demo-") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete "${issue.title}"?`)) {
                              deleteIssue(issue.id, issue.userId);
                            }
                          }}
                          className="ml-2 px-2 py-1 text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded transition-colors"
                          title="Delete this issue"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      {/* Upvote Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpvote(issue.id);
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors ${
                          userVotes[issue.id] === "up"
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-300 dark:hover:bg-green-700"
                        }`}
                        title="Upvote this issue"
                      >
                        <ThumbsUp size={14} /> {issue.upvotes}
                      </button>

                      {/* Downvote Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownvote(issue.id);
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors ${
                          userVotes[issue.id] === "down"
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-300 dark:hover:bg-red-700"
                        }`}
                        title="Downvote this issue"
                      >
                        <ThumbsDown size={14} /> {issue.downvotes || 0}
                      </button>

                      {/* Suggest Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSuggestionModal(issue.id);
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-300 dark:hover:bg-purple-700 transition-colors"
                        title="Suggest a solution"
                      >
                        <Lightbulb size={14} /> Suggest ({issue.suggestions?.length || 0})
                      </button>

                      {/* View Photo Button */}
                      {issue.photos && issue.photos.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(issue.photos[0]);
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-300 dark:hover:bg-indigo-700 transition-colors"
                          title="View photo"
                        >
                          📷 Photo{issue.photos.length > 1 ? `s (${issue.photos.length})` : ''}
                        </button>
                      )}
                    </div>

                    {/* Suggestions Display */}
                    {issue.suggestions && issue.suggestions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">💡 Suggestions:</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {issue.suggestions.map((suggestion: any) => (
                            <div key={suggestion.id} className="text-xs bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                              <p className="font-semibold text-purple-700 dark:text-purple-300">{suggestion.userName}:</p>
                              <p className="text-purple-600 dark:text-purple-400">{suggestion.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
          </>
        )}
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        latitude={selectedLocation?.lat || 28.7041}
        longitude={selectedLocation?.lng || 77.1025}
        onSubmit={handleReportSubmit}
      />

      {/* Suggestion Modal */}
      {showSuggestionModal && (
        <div className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-2xl max-w-md w-full z-[10000]">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <Lightbulb size={24} className="text-purple-500" /> Add Suggestion
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Help solve this issue by sharing your suggestion
            </p>
            <textarea
              value={suggestionText}
              onChange={(e) => setSuggestionText(e.target.value)}
              placeholder="Share your suggestion or solution..."
              className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleAddSuggestion(showSuggestionModal)}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                Submit Suggestion
              </button>
              <button
                onClick={() => {
                  setShowSuggestionModal(null);
                  setSuggestionText("");
                }}
                className="flex-1 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Dashboard Modal - NOT USED ANYMORE (full page dashboard instead) */}
      {/* Removed: AdminDashboard modal is no longer shown when admin is authenticated */}
      {/* Admin Logout Button - Top Right (only show when authenticated) */}
      {adminAuthenticated && (
        <button
          onClick={() => {
            adminLogout();
            setAdminAuthenticated(false);
          }}
          className="fixed top-6 right-6 px-6 py-3 rounded-full font-bold text-sm shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 z-[99999] bg-red-600 dark:bg-red-700 text-white hover:bg-red-700"
          title="Logout from Admin Portal"
        >
          <LogOut className="inline mr-2" size={18} /> Admin Logout
        </button>
      )}

      {adminAuthenticated && selectedIssueForEdit && (
        <div className="fixed bottom-6 left-6 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-2xl max-w-sm w-full z-[10000] border-2 border-blue-500">
          <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Update Status</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 truncate">{selectedIssueForEdit.title}</p>
          <div className="space-y-2">
            {[
              { status: "reported", label: "📋 Reported", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200" },
              { status: "inProgress", label: "🔧 In Progress", color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200" },
              { status: "resolved", label: "✅ Resolved", color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" },
            ].map((option) => (
              <button
                key={option.status}
                onClick={() => {
                  updateIssueStatus(selectedIssueForEdit.id, option.status as "reported" | "inProgress" | "resolved");
                }}
                className={`w-full py-2 rounded font-semibold transition-all text-sm ${
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
            className="w-full mt-3 py-1.5 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded font-semibold hover:bg-gray-400 dark:hover:bg-gray-700 text-sm"
          >
            Close
          </button>
        </div>
      )}

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[99999] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl font-bold z-10"
          >
            ×
          </button>
          <img
            src={selectedImage}
            alt="Issue photo"
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Click Issue Cards to Edit (in admin mode) */}
      {adminAuthenticated && (
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
