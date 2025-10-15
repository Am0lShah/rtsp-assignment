# 📖 RTSP Live Stream Studio - User Guide

## 🎯 Overview
RTSP Live Stream Studio is a professional web application that allows you to stream RTSP video feeds in your browser with customizable overlays. Perfect for live streaming, monitoring, and video presentation applications.

**Key Features:**
- Stream RTSP video feeds directly in your browser
- Add and manage text/image overlays in real-time
- Drag, resize, and customize overlays interactively
- Professional video controls with play/pause and volume
- Mobile-responsive design for all devices

---

## 🚀 Quick Start Guide

### Option 1: Instant Demo (Recommended for First-Time Users)
Perfect for testing all features without any setup:

1. **Download and extract** the project files
2. **Open PowerShell** in the project directory
3. **Run the instant demo:**
   ```powershell
   .\instant-demo.ps1
   ```
4. **Open your browser** to http://localhost:5173
5. **Click "📹 Demo Video"** to start testing immediately
6. **Create overlays** and see them in action!

### Option 2: Full RTSP Streaming Setup
For streaming real RTSP feeds:

1. **Launch the complete system:**
   ```powershell
   .\launch-rtsp-webapp.ps1
   ```
2. **Wait for services** to start (about 30 seconds)
3. **Open your browser** to http://localhost:5173
4. **Enter your RTSP URL** and start streaming

---

## 🎮 Using the Application

### 🖥️ Interface Overview

The application features a **single-screen layout** designed for efficiency:

- **🎥 Video Player**: Fixed position, always visible
- **🔽 Control Panel**: Collapsible overlay controls (toggle with header button)
- **📱 Mobile Friendly**: Touch-optimized for tablets and phones

### 🎯 Getting Started

#### Step 1: Access the Application
Open your web browser and navigate to:
```
http://localhost:5173
```

#### Step 2: Choose Your Streaming Method

**For Testing/Demo:**
- Click **"📹 Demo Video"** button
- Instantly start creating and testing overlays
- Perfect for learning the interface

**For Real RTSP Streaming:**
- Enter your RTSP URL in the input field
- Click **"🚀 Start RTSP Stream"**
- Wait 5-10 seconds for conversion to complete

### 📡 RTSP URL Examples

**Format:** `rtsp://[username:password@]server:port/path`

**Common Examples:**
```
rtsp://192.168.1.100:554/live/stream1
rtsp://username:password@camera.local:554/stream
rtsp://rtspstream:password@server.com/people
rtsp://admin:admin123@192.168.0.50:554/cam/realmonitor?channel=1
```

**Public Test Streams:**
```
rtsp://rtspstream:gnJ6gUvRCmrr1_etQJmkd@zephyr.rtsp.stream/people
rtsp://rtspstream:gnJ6gUvRCmrr1_etQJmkd@zephyr.rtsp.stream/pattern
```

---

## 🎨 Managing Overlays

### Creating Overlays

1. **Toggle Controls**: Click the **🔽** button in the header to show overlay controls
2. **Add Text Overlay**:
   - Enter text in the "Overlay Text" field
   - Click **"Add Text Overlay"**
   - The overlay appears on the video

3. **Customize Overlay**:
   - **Drag** to move position
   - **Resize** using corner handles
   - **Edit** properties in the control panel

### Overlay Properties

**Text Content:**
- Change the text content anytime
- Supports emojis and special characters
- Real-time preview as you type

**Position & Size:**
- **X, Y coordinates**: Precise positioning
- **Width, Height**: Exact sizing control
- **Drag & Drop**: Interactive positioning
- **Resize Handles**: Visual resizing

**Styling Options:**
- **Font Size**: 12px to 48px
- **Text Color**: Full color picker
- **Background**: Color with transparency
- **Border Radius**: Rounded corners
- **Padding**: Internal spacing
- **Font Weight**: Normal, bold, lighter

**Visibility:**
- **Show/Hide**: Toggle overlay visibility
- **Z-Index**: Layer ordering (higher numbers appear on top)

### Interactive Controls

**Drag to Move:**
- Click and drag any overlay to reposition
- Smooth movement with visual feedback
- Automatic boundary detection

**Resize Handles:**
- Grab corner handles to resize
- Maintains aspect ratio when needed
- Visual guides for precise sizing

**Real-time Updates:**
- All changes apply immediately
- No need to save or refresh
- Persistent across browser sessions

---

## 🎛️ Video Controls

### Playback Controls
- **▶️ Play/Pause**: Click video or use spacebar
- **🔊 Volume**: Hover over speaker icon for volume slider
- **⏸️ Mute**: Click speaker icon to mute/unmute

### Stream Management
- **🚀 Start Stream**: Begin RTSP conversion and playback
- **⏹️ Stop Stream**: End current stream
- **🔄 Refresh**: Reload stream if connection issues occur

### Quality & Performance
- **Auto-Quality**: Automatic quality adjustment based on connection
- **Buffer Management**: Optimized for low-latency streaming
- **Error Recovery**: Automatic reconnection on stream interruption

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### "Stream Not Loading"
**Symptoms:** Video player shows loading or error message

**Solutions:**
1. **Check RTSP URL**: Ensure the URL is correct and accessible
2. **Wait for Conversion**: RTSP to HLS conversion takes 5-10 seconds
3. **Network Access**: Verify the RTSP source is reachable from your network
4. **Firewall**: Check if firewall is blocking RTSP traffic (port 554)

#### "Browser Compatibility Error"
**Symptoms:** `net::ERR_UNKNOWN_URL_SCHEME` error

**Explanation:** This is normal! Browsers cannot play RTSP URLs directly.

**Solution:** Use the **"🚀 Start RTSP Stream"** button to convert RTSP to browser-compatible HLS format.

#### "Overlays Not Saving"
**Symptoms:** Overlays disappear after page refresh

**Solutions:**
1. **Check Database**: Ensure MongoDB is running (see setup section)
2. **Network Connection**: Verify API connection at http://localhost:5000
3. **Browser Storage**: Clear browser cache and cookies
4. **Fallback Mode**: App uses temporary storage if database unavailable

#### "Video Quality Issues"
**Symptoms:** Pixelated or choppy video

**Solutions:**
1. **Network Bandwidth**: Check internet connection speed
2. **RTSP Source**: Verify source stream quality and stability
3. **Browser Performance**: Close unnecessary tabs and applications
4. **Hardware Acceleration**: Enable hardware acceleration in browser settings

### Performance Optimization

**For Better Streaming:**
- Use wired internet connection when possible
- Close unnecessary browser tabs
- Ensure adequate system resources (RAM, CPU)
- Use modern browsers (Chrome, Firefox, Safari, Edge)

**For Smooth Overlays:**
- Limit number of active overlays (recommended: 5-10)
- Use simple text overlays for better performance
- Avoid very large overlay sizes
- Keep overlay animations minimal

---

## 🛠️ System Requirements

### Minimum Requirements
- **Browser**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **RAM**: 4GB minimum, 8GB recommended
- **CPU**: Dual-core 2.0GHz minimum
- **Network**: Broadband internet connection
- **Resolution**: 1024x768 minimum, 1920x1080 recommended

### Recommended Setup
- **Browser**: Latest version of Chrome or Firefox
- **RAM**: 16GB for multiple concurrent streams
- **CPU**: Quad-core 3.0GHz for optimal performance
- **Network**: Gigabit ethernet for high-quality streams
- **Resolution**: 4K display for detailed overlay editing

### Server Requirements (For Deployment)
- **OS**: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **Python**: 3.8 or higher
- **Node.js**: 16.0 or higher
- **FFmpeg**: Latest version for RTSP conversion
- **MongoDB**: 4.4 or higher (optional, has fallback)

---

## 🔐 Security & Privacy

### Data Handling
- **Overlay Data**: Stored in MongoDB database
- **Video Streams**: Not recorded or stored on server
- **User Privacy**: No personal data collection
- **Network Security**: All communication over HTTP/HTTPS

### Production Deployment
For production use, consider:
- **HTTPS**: Enable SSL/TLS encryption
- **Authentication**: Implement user authentication
- **Access Control**: Restrict API access
- **Database Security**: Secure MongoDB with authentication
- **Network Security**: Use VPN or private networks for RTSP sources

---

## 📞 Support & Help

### Getting Help
1. **Check this documentation** for common solutions
2. **Test system requirements** using the built-in test tools
3. **Verify network connectivity** to RTSP sources
4. **Check browser console** for error messages

### Reporting Issues
When reporting problems, please include:
- **Browser version** and operating system
- **RTSP URL format** (without credentials)
- **Error messages** from browser console
- **Steps to reproduce** the issue

### Best Practices
- **Test with demo video** before using real RTSP streams
- **Use stable network connections** for streaming
- **Keep overlay count reasonable** for performance
- **Regular browser updates** for security and compatibility

---

## 🎓 Advanced Usage

### Custom Styling
Overlays support advanced CSS styling:
```css
/* Example custom styles */
background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
box-shadow: 0 4px 8px rgba(0,0,0,0.3);
border: 2px solid #ffffff;
text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
```

### Multiple Streams
The system supports multiple concurrent RTSP streams:
- Each stream gets a unique ID
- Independent overlay management per stream
- Resource usage scales with stream count

### API Integration
For developers, the application provides a complete REST API:
- **Stream Management**: Start, stop, monitor streams
- **Overlay CRUD**: Create, read, update, delete overlays
- **Real-time Updates**: WebSocket support for live updates

### Database Configuration
**For Client Deployment:**
Update the MongoDB connection in `backend/.env`:
```env
MONGO_URI=mongodb+srv://username:password@your-cluster.mongodb.net/rtsp_overlays
```

Replace with your production MongoDB Atlas or self-hosted MongoDB instance.

---

## 🎉 Conclusion

RTSP Live Stream Studio provides a complete solution for streaming RTSP video with interactive overlays. The intuitive interface makes it easy for users of all technical levels to create professional-looking video streams with custom overlays.

**Key Benefits:**
- ✅ **No Technical Expertise Required**: User-friendly interface
- ✅ **Professional Results**: High-quality streaming and overlays
- ✅ **Real-time Interaction**: Immediate feedback and updates
- ✅ **Cross-Platform**: Works on desktop, tablet, and mobile
- ✅ **Scalable**: Supports multiple streams and overlays

**Perfect For:**
- Live streaming applications
- Security monitoring displays
- Digital signage systems
- Video presentation tools
- Educational streaming platforms

Start with the demo video to explore all features, then connect your RTSP sources for production use!