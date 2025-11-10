# CivicConnect 🏙️

A modern civic engagement platform that empowers citizens to report and track local infrastructure issues in real-time.

## 🚀 Features

- **Interactive Map**: Click anywhere to report issues with precise location tracking
- **Real-time Updates**: Track issue status from reported → in progress → resolved
- **Photo Upload**: Attach images to issue reports via Cloudinary integration
- **Voting System**: Upvote/downvote issues to prioritize community concerns
- **Admin Dashboard**: Comprehensive analytics and issue management panel
- **Offline Support**: Queue reports when offline, auto-sync when back online
- **Dark Mode**: Full dark/light theme support
- **Authentication**: Email/password and Google OAuth login

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn-ui
- **Maps**: Leaflet with marker clustering
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Image Upload**: Cloudinary
- **Animations**: Framer Motion
- **Deployment**: Vercel

## 📦 Installation

```bash
# Clone repository
git clone <your-repo-url>
cd civicconnect-hero

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Add your Firebase and Cloudinary credentials

# Run development server
npm run dev
```

## 🔑 Environment Variables

Create a `.env` file with:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_UPLOAD_PRESET=civic_connect
```

## 🔐 Admin Access

- **Email**: admin@gmail.com
- **Password**: admin123

## 🗄️ Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /issues/{document=**} {
      allow read: if true;
      allow create: if request.auth.uid != null;
      allow update: if request.auth.uid != null;
      allow delete: if request.auth.uid != null;
    }
    
    match /userVotes/{voteId} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid != null;
    }
  }
}
```

## 📱 Usage

1. **Report Issue**: Click on map → Fill form → Upload photo (optional) → Submit
2. **Vote**: Login → Click thumbs up/down on any issue
3. **Track Status**: Filter by reported/in progress/resolved
4. **Admin Panel**: Login as admin → Access full dashboard with analytics

## 👥 Developers

- **Ananay Dubey** - [ananay.netlify.app](https://ananay.netlify.app)
- **Shikhar Yadav** - [LinkedIn](https://linkedin.com/in/shikhar-yadav-16733330a)

## 📄 License

MIT License - feel free to use for your projects!
