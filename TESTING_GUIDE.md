# CivicConnect - Testing & Usage Guide

## 🔐 Logout Functionality

### Where to Find:
- **Desktop**: Click on user profile dropdown in top-right corner of header
- **Mobile**: Open mobile menu (hamburger icon), scroll down to see user info and logout button

### User Profile Indicator:
- Shows user's avatar (if Google sign-in) or user icon
- Displays truncated username or email
- Dropdown shows full email and name

### Logout Flow:
1. Click on user profile dropdown
2. Select "Logout" (red button with logout icon)
3. Session ends immediately
4. Header changes back to "Login" button
5. User is no longer authenticated

---

## 📍 Issue Reporting System

### Prerequisites:
- Must be logged in with Google or email account
- Must have location permission enabled (for user location marker)

### How to Report:

#### Step 1: Navigate to Portal
- Click "Login" or "Portal" in header
- You'll see the interactive map

#### Step 2: Understand the Map
- **Blue Pulsing Marker**: Your current location (if location permission granted)
- **Red Markers**: Issues reported by users
- Map is centered on Delhi, India by default

#### Step 3: Select Location
- Click anywhere on the map to select an issue location
- A temporary RED marker appears at click location
- Report modal opens automatically with coordinates pre-filled

#### Step 4: Fill Out Issue Form

**Required Fields:**
- **Title**: Brief, descriptive title for the issue
  - Example: "Large pothole on main intersection"
  - Keep it concise (2-5 words)

- **Category**: Select from dropdown
  - 🚗 Pothole - Road damage
  - 🚦 Traffic Issue - Traffic lights, congestion
  - 💡 Street Light - Broken/non-functioning lights
  - 💧 Water Supply - Water-related issues
  - 🗑️ Garbage - Waste management
  - 💨 Pollution - Air/noise pollution
  - 📝 Other - Miscellaneous

- **Description**: Detailed information
  - Describe what's wrong
  - Note any danger/inconvenience
  - Estimate severity if applicable
  - Keep it informative but concise

**Optional Fields:**
- **Location Address**: Street address or location name
  - Helps others identify the exact spot
  - Example: "Near Delhi Gate, Main Road"

**Display Fields:**
- **Coordinates**: Automatically filled (read-only)
  - Precise GPS coordinates from map click
  - Format: [latitude, longitude]
- **Reporting as**: Your username/email
  - Shows who is reporting the issue

#### Step 5: Submit
- Click blue "Report Issue" button
- Loading spinner indicates processing
- Success message appears on screen
- Form automatically closes after 2 seconds
- New issue appears at top of issues list

#### Step 6: See Your Report
- Scroll down past map to "All Reports" section
- Your newly submitted issue is at the top
- Shows:
  - Title
  - Category (with emoji)
  - Description
  - Status (initially "Reported")
  - Upvote count (starts at 1)

---

## 🔐 Authentication Check

### What Happens If Not Logged In:
1. Try to click on map without logging in
2. Report modal opens with special message
3. See: "Please log in to report an issue"
4. Shows explanation and "Go to Login" button
5. Cannot submit form without authentication

### Why This Matters:
- Prevents anonymous reports
- Ensures accountability
- Lets city officials contact reporters
- Tracks who reported what
- Prevents spam/duplicate reports

---

## 📊 Issue List Features

### Issue Card Display:
Each issue shows:
- **Colored Left Border**: 
  - 🟨 Amber = Reported (new issue)
  - 🔴 Red = In Progress (being worked on)
  - 🟢 Green = Resolved (fixed)
- **Title**: Issue heading
- **Description**: Full details
- **Status Badge**: Current state
- **Upvotes**: Number of people affected/supporting

### Demo Issues Included:
1. **Large Pothole on Main Road**
   - Status: Reported (⏳ 2 days old)
   - Upvotes: 12
   - Category: Pothole

2. **Traffic Light Not Working**
   - Status: In Progress (🔧 1 day old)
   - Upvotes: 8
   - Category: Traffic Issue

3. **Street Light Fixed**
   - Status: Resolved (✅ 3 hours old)
   - Upvotes: 5
   - Category: Street Light

---

## 🎮 Interactive Map Tips

### Map Controls:
- **Zoom In/Out**: Use mouse wheel or +/- buttons
- **Pan**: Click and drag map
- **Click to Report**: Click any location to report issue there

### Markers:
- **Blue Pulsing Circle**: Your location (if enabled)
- **Red Circle**: Temporary marker for new report
- Blue background fades, red is highlighted
- Markers show popups with location info on click

### Getting User Location:
- Browser will ask for location permission
- Accept to see your location on map
- Helps you see issues near you
- Enables more accurate reporting

---

## ✨ User Experience Features

### Dark Mode Support:
- All features work in light and dark modes
- Toggle theme with sun/moon icon in header
- Theme preference saved to localStorage

### Responsive Design:
- **Desktop**: Full feature set with dropdown menus
- **Tablet**: Optimized layout with touch-friendly controls
- **Mobile**: Hamburger menu, stacked layout
- All functionality available on all devices

### Loading States:
- Spinner shows during authentication
- Spinner shows during form submission
- Input fields disabled while processing
- Prevents double-submission

### Error Handling:
- Clear error messages for failed operations
- Error displayed in red box on modal
- User can retry without losing form data
- Helpful guidance for fixes

---

## 🔍 Testing Checklist

### Logout Testing:
- [ ] Login successfully
- [ ] See user profile in header
- [ ] Click profile dropdown
- [ ] See user email/name in dropdown
- [ ] Click logout button
- [ ] Header returns to "Login" button
- [ ] On mobile: Same flow in mobile menu

### Issue Reporting Testing:
- [ ] Login to account
- [ ] Navigate to portal page
- [ ] See map with geolocation marker
- [ ] See tip message about clicking map
- [ ] Click map at different locations
- [ ] Report modal opens each time
- [ ] Coordinates update with each click
- [ ] Fill in all required fields
- [ ] Submit report successfully
- [ ] See success message
- [ ] Modal closes automatically
- [ ] New issue appears in list

### Authentication Check Testing:
- [ ] Logout from account
- [ ] Try to click on map
- [ ] See "please login" message
- [ ] See "Go to Login" button
- [ ] Login again
- [ ] Map is now interactive

### Form Validation Testing:
- [ ] Try submit with empty title
- [ ] See error message
- [ ] Try submit with empty description
- [ ] See error message
- [ ] Fill all required fields
- [ ] Submit successfully

### Dark Mode Testing:
- [ ] Toggle theme in header
- [ ] All components update color scheme
- [ ] Modal visible on dark background
- [ ] Text readable in both modes
- [ ] Refresh page - theme persists

---

## 📝 Example Report

**Scenario**: You find a pothole on your street

**Steps**:
1. Go to `/portal`
2. Click on map near your location
3. Red marker appears
4. Fill form:
   - **Title**: "Large pothole near Sector 5"
   - **Category**: "🚗 Pothole"
   - **Description**: "Crater-sized pothole on main road, dangerous for bikes"
   - **Address**: "Sector 5, Main Road"
5. Click "Report Issue"
6. Success! Issue now visible to city officials and other users
7. Others can upvote to show support
8. City can assign someone to fix it

---

## 🐛 Troubleshooting

### Report Modal Not Opening:
- [ ] Are you logged in?
- [ ] Try logout and login again
- [ ] Check browser console for errors

### Can't See User Location:
- [ ] Check browser geolocation permission
- [ ] Settings > Privacy > Location
- [ ] Allow permission for localhost:8080
- [ ] Refresh page after allowing

### Form Not Submitting:
- [ ] Fill all required fields (title, category, description)
- [ ] Check for error messages
- [ ] Try with shorter description
- [ ] Check browser console for errors

### Modal Behind Map:
- [ ] This is fixed! Modal has z-index: 10000
- [ ] If still issue, refresh page
- [ ] Try different browser

---

## 🎯 Next Features Coming

- 📸 Photo upload for issues
- 💬 Comments on issues
- 👍 Upvote system
- 🔔 Notifications for issue updates
- 🗺️ Issue markers on map
- 🔍 Search and filter issues
- 👤 User profile with my reports
- ⭐ Community reputation system
