# 🎥 RTSP Live Stream Studio

A professional web application for streaming RTSP video feeds with customizable overlays. Built with React and Flask, featuring real-time overlay management and automatic RTSP to HLS conversion for browser compatibility.

## ✨ Features

- **RTSP Streaming**: Convert RTSP streams to browser-compatible HLS format
- **Interactive Overlays**: Create, edit, and manage text overlays with drag-and-drop functionality
- **Real-time Updates**: Live overlay editing with immediate visual feedback
- **Professional UI**: Clean, responsive interface optimized for all devices
- **Complete API**: RESTful API for stream and overlay management
- **Database Integration**: MongoDB storage with automatic fallback support

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **FFmpeg** (for RTSP conversion)
- **MongoDB** (optional - has in-memory fallback)

### Installation & Launch

**Option 1: Automated Setup (Recommended)**
```powershell
# Launch the complete application
.\launch-rtsp-webapp.ps1
```

**Option 2: Manual Setup**
```bash
# Backend setup
cd backend
pip install -r requirements.txt
python app.py

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: See API_DOCUMENTATION.md

## 🎮 Usage

### Getting Started
1. Open http://localhost:5173 in your browser
2. **For Testing**: Click "📹 Demo Video" for instant overlay testing
3. **For RTSP Streaming**: Enter your RTSP URL and click "🚀 Start RTSP Stream"

### RTSP URL Examples
```
rtsp://username:password@192.168.1.100:554/stream
rtsp://admin:password@camera.local:554/live/stream1
rtsp://rtspstream:gnJ6gUvRCmrr1_etQJmkd@zephyr.rtsp.stream/people
```

### Managing Overlays
- **Create**: Add text overlays with customizable styling
- **Position**: Drag overlays to desired locations
- **Resize**: Use corner handles to adjust overlay size
- **Edit**: Modify text, colors, and styling in real-time
- **Persist**: All changes are automatically saved to database

## 🔧 Configuration

### Database Setup
The application uses MongoDB for overlay persistence. Configure your database in `backend/.env`:

```env
# For local MongoDB
MONGO_URI=mongodb://localhost:27017/rtsp_overlays

# For MongoDB Atlas (Production)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rtsp_overlays

# For other MongoDB instances
MONGO_URI=mongodb://username:password@your-server:27017/rtsp_overlays
```

**Note**: If MongoDB is unavailable, the application automatically uses in-memory storage.

### Environment Variables
Create `backend/.env` file:
```env
FLASK_APP=app.py
FLASK_ENV=development
MONGO_URI=mongodb://localhost:27017/rtsp_overlays
SECRET_KEY=your-secret-key-change-in-production
```

## 📚 Documentation

- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete REST API reference
- **[USER_DOCUMENTATION.md](USER_DOCUMENTATION.md)** - Detailed user guide and troubleshooting

## 🛠️ Technology Stack

**Backend:**
- Flask (Python web framework)
- PyMongo (MongoDB integration)
- FFmpeg (RTSP to HLS conversion)
- Flask-CORS (Cross-origin support)

**Frontend:**
- React 18 (UI framework)
- Vite (Build tool)
- Interact.js (Drag and drop)
- HLS.js (Video streaming)
- Axios (HTTP client)

**Database:**
- MongoDB (Primary storage)
- In-memory fallback (When MongoDB unavailable)

## 🔌 API Endpoints

### Stream Management
- `POST /api/stream/convert` - Convert RTSP to HLS
- `GET /api/stream/status/{id}` - Get stream status
- `GET /api/stream/list` - List active streams
- `POST /api/stream/stop/{id}` - Stop stream

### Overlay Management
- `GET /api/overlays` - List all overlays
- `POST /api/overlays` - Create new overlay
- `GET /api/overlays/{id}` - Get specific overlay
- `PUT /api/overlays/{id}` - Update overlay
- `DELETE /api/overlays/{id}` - Delete overlay

## 🚀 Deployment

### Production Considerations
1. **Database**: Use MongoDB Atlas or dedicated MongoDB instance
2. **Security**: Implement authentication and HTTPS
3. **Environment**: Set `FLASK_ENV=production`
4. **Secrets**: Use secure, random secret keys
5. **CORS**: Configure appropriate CORS policies

### MongoDB Atlas Setup (Recommended for Production)
1. Create account at https://www.mongodb.com/atlas
2. Create new cluster
3. Get connection string
4. Update `MONGO_URI` in `backend/.env`

## 📞 Support

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Stable internet connection for RTSP streaming
- FFmpeg installed and accessible in system PATH

### Troubleshooting
- **RTSP not loading**: Ensure FFmpeg is installed and RTSP URL is accessible
- **Overlays not saving**: Check MongoDB connection or use in-memory fallback
- **Browser compatibility**: Use modern browsers with HLS support

For detailed troubleshooting, see [USER_DOCUMENTATION.md](USER_DOCUMENTATION.md).

## 📄 License

This project is provided as-is for the specified assignment requirements. All rights reserved.