# 🔌 RTSP Live Stream Studio - API Documentation

## Overview
The RTSP Live Stream Studio API provides comprehensive endpoints for RTSP stream management and overlay CRUD operations. Built with Flask and designed for real-time video streaming applications.

**Base URL**: `http://localhost:5000`  
**API Version**: 1.0.0  
**Content-Type**: `application/json`

---

## 🎯 Core Features
- **RTSP to HLS Conversion**: Automatic browser-compatible streaming
- **Overlay Management**: Complete CRUD operations for video overlays
- **Stream Monitoring**: Real-time status tracking and management
- **MongoDB Integration**: Persistent data storage with fallback support

---

## 🔐 Authentication
Currently, no authentication is required. For production deployment, implement proper authentication mechanisms.

---

## 📡 Stream Management Endpoints

### 1. Health Check
**GET** `/`

Check if the API is running and get basic information.

**Response:**
```json
{
  "status": "RTSP Live Stream Studio API is running",
  "version": "1.0.0"
}
```

### 2. API Test
**GET** `/api/test`

Verify API functionality and system requirements.

**Response:**
```json
{
  "api_status": "working",
  "ffmpeg_available": true,
  "active_streams": 2,
  "timestamp": 1697123456.789
}
```

### 3. Convert RTSP Stream
**POST** `/api/stream/convert`

Convert an RTSP stream to HLS format for browser compatibility.

**Request Body:**
```json
{
  "rtsp_url": "rtsp://username:password@server:port/stream"
}
```

**Response:**
```json
{
  "success": true,
  "stream_id": "stream_1",
  "hls_url": "http://localhost:5000/api/stream/hls/stream_1/stream.m3u8",
  "rtsp_url": "rtsp://example.com/stream",
  "status": "starting",
  "message": "RTSP stream conversion started. HLS stream will be available shortly."
}
```

**Error Response:**
```json
{
  "error": "RTSP URL is required"
}
```

### 4. Get Stream Status
**GET** `/api/stream/status/{stream_id}`

Get the current status of a specific stream.

**Response:**
```json
{
  "stream_id": "stream_1",
  "status": "active",
  "rtsp_url": "rtsp://example.com/stream",
  "hls_url": "http://localhost:5000/api/stream/hls/stream_1/stream.m3u8"
}
```

**Status Values:**
- `starting` - Stream conversion is initializing
- `active` - Stream is running and available
- `stopped` - Stream has been stopped
- `failed` - Stream conversion failed

### 5. List Active Streams
**GET** `/api/stream/list`

Get all currently active streams.

**Response:**
```json
{
  "streams": [
    {
      "stream_id": "stream_1",
      "status": "active",
      "rtsp_url": "rtsp://example.com/stream1",
      "hls_url": "http://localhost:5000/api/stream/hls/stream_1/stream.m3u8"
    },
    {
      "stream_id": "stream_2",
      "status": "starting",
      "rtsp_url": "rtsp://example.com/stream2",
      "hls_url": "http://localhost:5000/api/stream/hls/stream_2/stream.m3u8"
    }
  ]
}
```

### 6. Stop Stream
**POST** `/api/stream/stop/{stream_id}`

Stop a specific stream and clean up resources.

**Response:**
```json
{
  "success": true,
  "message": "Stream stream_1 stopped successfully"
}
```

### 7. Serve HLS Files
**GET** `/api/stream/hls/{stream_id}/{filename}`

Serve HLS playlist and segment files for video playback.

**Headers:**
- `Content-Type`: `application/vnd.apple.mpegurl` (for .m3u8 files)
- `Content-Type`: `video/mp2t` (for .ts files)
- `Access-Control-Allow-Origin`: `*`
- `Cache-Control`: `no-cache` (for playlists), `public, max-age=3600` (for segments)

---

## 🎨 Overlay Management Endpoints

### 1. Create Overlay
**POST** `/api/overlays`

Create a new overlay for the video stream.

**Request Body:**
```json
{
  "type": "text",
  "content": "Live Stream",
  "position": {
    "x": 50,
    "y": 100
  },
  "size": {
    "width": 200,
    "height": 40
  },
  "style": {
    "color": "#ffffff",
    "fontSize": "16px",
    "fontWeight": "bold",
    "backgroundColor": "rgba(0, 0, 0, 0.7)",
    "padding": "8px",
    "borderRadius": "4px"
  },
  "zIndex": 10,
  "visible": true
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "success": true
}
```

**Overlay Types:**
- `text` - Text overlay with customizable styling
- `image` - Image overlay with positioning and sizing

### 2. Get All Overlays
**GET** `/api/overlays`

Retrieve all overlays for the current stream.

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "type": "text",
    "content": "Live Stream",
    "position": {
      "x": 50,
      "y": 100
    },
    "size": {
      "width": 200,
      "height": 40
    },
    "style": {
      "color": "#ffffff",
      "fontSize": "16px",
      "fontWeight": "bold",
      "backgroundColor": "rgba(0, 0, 0, 0.7)",
      "padding": "8px",
      "borderRadius": "4px"
    },
    "zIndex": 10,
    "visible": true,
    "createdAt": "2023-10-15T10:30:00.000Z",
    "updatedAt": "2023-10-15T10:30:00.000Z"
  }
]
```

### 3. Get Specific Overlay
**GET** `/api/overlays/{overlay_id}`

Retrieve a specific overlay by ID.

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "type": "text",
  "content": "Live Stream",
  "position": {
    "x": 50,
    "y": 100
  },
  "size": {
    "width": 200,
    "height": 40
  },
  "style": {
    "color": "#ffffff",
    "fontSize": "16px"
  },
  "zIndex": 10,
  "visible": true,
  "createdAt": "2023-10-15T10:30:00.000Z",
  "updatedAt": "2023-10-15T10:30:00.000Z"
}
```

### 4. Update Overlay
**PUT** `/api/overlays/{overlay_id}`

Update an existing overlay. Only provided fields will be updated.

**Request Body:**
```json
{
  "content": "Updated Live Stream",
  "position": {
    "x": 100,
    "y": 150
  },
  "style": {
    "color": "#ff0000",
    "fontSize": "18px"
  }
}
```

**Response:**
```json
{
  "updated": true,
  "success": true
}
```

### 5. Delete Overlay
**DELETE** `/api/overlays/{overlay_id}`

Delete a specific overlay.

**Response:**
```json
{
  "deleted": true,
  "success": true
}
```

---

## 🗄️ Database Configuration

### MongoDB Setup
The API uses MongoDB for persistent overlay storage. Configure your database connection in the `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/rtsp_overlays
```

**For Production/Client Deployment:**
Replace the MongoDB URI with your production database:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rtsp_overlays
```

### Fallback Storage
If MongoDB is unavailable, the API automatically falls back to in-memory storage. Data will not persist between server restarts in this mode.

---

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
FLASK_APP=app.py
FLASK_ENV=development
MONGO_URI=mongodb://localhost:27017/rtsp_overlays
SECRET_KEY=your-secret-key-change-in-production
```

### FFmpeg Requirements
The RTSP conversion feature requires FFmpeg to be installed and available in the system PATH.

**Installation:**
- **Windows**: Download from https://ffmpeg.org/download.html
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt-get install ffmpeg`

---

## 📊 Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "error": "RTSP URL is required"
}
```

**404 Not Found:**
```json
{
  "error": "Stream not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Stream conversion failed: FFmpeg not available"
}
```

### Error Codes
- `400` - Invalid request parameters
- `404` - Resource not found
- `500` - Server error or system dependency issue

---

## 🚀 Deployment Notes

### Production Considerations
1. **Security**: Implement authentication and authorization
2. **CORS**: Configure appropriate CORS policies for your domain
3. **Database**: Use a production MongoDB instance
4. **Environment**: Set `FLASK_ENV=production`
5. **Secrets**: Use secure, randomly generated secret keys
6. **Monitoring**: Implement logging and monitoring for stream health

### Performance Optimization
- **Stream Limits**: Monitor active stream count and system resources
- **Cleanup**: Implement automatic cleanup of stopped streams
- **Caching**: Configure appropriate caching headers for HLS files
- **Load Balancing**: Consider load balancing for multiple concurrent streams

---

## 📞 Support

For technical support or questions about the API:
- Check system requirements (FFmpeg, MongoDB)
- Verify network connectivity for RTSP sources
- Monitor server logs for detailed error information
- Ensure proper CORS configuration for cross-origin requests

**API Status Endpoint**: `GET /api/test` - Use this to verify system health and dependencies.