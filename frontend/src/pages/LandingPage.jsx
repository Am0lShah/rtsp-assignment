import React, { useState, useEffect } from 'react'
import VideoPlayer from '../components/VideoPlayer'
import OverlayEditor from '../components/OverlayEditor'
import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'
const DEFAULT_RTSP_URL = 'rtsp://rtspstream:gnJ6gUvRCmrr1_etQJmkd@zephyr.rtsp.stream/people'
const DEMO_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
const HLS_DEMO_URL = 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'

function LandingPage() {
  const [overlays, setOverlays] = useState([])
  const [selectedOverlay, setSelectedOverlay] = useState(null)
  const [streamUrl, setStreamUrl] = useState(DEMO_VIDEO_URL)
  const [originalRtspUrl, setOriginalRtspUrl] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [streamStatus, setStreamStatus] = useState('idle')
  const [streamMessage, setStreamMessage] = useState('')
  const [activeStreamId, setActiveStreamId] = useState(null)

  useEffect(() => {
    loadOverlays()
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      await axios.get(`${API_BASE}/overlays`)
      setIsConnected(true)
    } catch (error) {
      setIsConnected(false)
    }
  }

  const loadOverlays = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE}/overlays`)
      setOverlays(response.data)
      setIsConnected(true)
    } catch (error) {
      console.error('Failed to load overlays:', error)
      setIsConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const createOverlay = async (overlayData) => {
    try {
      const response = await axios.post(`${API_BASE}/overlays`, overlayData)
      await loadOverlays()
      return response.data
    } catch (error) {
      console.error('Failed to create overlay:', error)
      throw error
    }
  }

  const updateOverlay = async (id, updates) => {
    try {
      await axios.put(`${API_BASE}/overlays/${id}`, updates)
      await loadOverlays()
    } catch (error) {
      console.error('Failed to update overlay:', error)
    }
  }

  const deleteOverlay = async (id) => {
    try {
      await axios.delete(`${API_BASE}/overlays/${id}`)
      await loadOverlays()
      if (selectedOverlay && selectedOverlay._id === id) {
        setSelectedOverlay(null)
      }
    } catch (error) {
      console.error('Failed to delete overlay:', error)
    }
  }

  const handleOverlaySelect = (overlay) => {
    setSelectedOverlay(overlay)
  }

  const handleOverlayUpdate = (id, updates) => {
    updateOverlay(id, updates)
  }

  const handleStreamUrlChange = (e) => {
    const url = e.target.value
    setOriginalRtspUrl(url)
    
    // If it's an RTSP URL, don't set it directly - we'll convert it
    if (url.startsWith('rtsp://')) {
      setStreamMessage('RTSP URL detected - click "Start RTSP Stream" to convert')
      setStreamStatus('rtsp-detected')
    } else {
      setStreamUrl(url)
      setStreamStatus('ready')
      setStreamMessage('')
    }
  }

  const convertRtspStream = async () => {
    if (!originalRtspUrl.startsWith('rtsp://')) {
      alert('Please enter a valid RTSP URL')
      return
    }

    setLoading(true)
    setStreamStatus('converting')
    setStreamMessage('Converting RTSP stream to browser-compatible format...')

    try {
      const response = await axios.post(`${API_BASE}/stream/convert`, {
        rtsp_url: originalRtspUrl
      })

      if (response.data.success) {
        setActiveStreamId(response.data.stream_id)
        setStreamUrl(response.data.hls_url)
        setStreamStatus('active')
        setStreamMessage('RTSP stream converted successfully! Stream is now playing.')
        
        // Poll for stream status
        pollStreamStatus(response.data.stream_id)
      }
    } catch (error) {
      console.error('RTSP conversion failed:', error)
      setStreamStatus('error')
      setStreamMessage('RTSP conversion failed. Please check the URL and try again.')
    } finally {
      setLoading(false)
    }
  }

  const pollStreamStatus = (streamId) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE}/stream/status/${streamId}`)
        const status = response.data.status
        
        if (status === 'active') {
          setStreamStatus('active')
          setStreamMessage('RTSP stream is live and running')
        } else if (status === 'failed' || status === 'stopped') {
          setStreamStatus('error')
          setStreamMessage('Stream stopped or failed')
          clearInterval(interval)
        }
      } catch (error) {
        console.error('Failed to check stream status:', error)
        clearInterval(interval)
      }
    }, 5000)

    // Clear interval after 2 minutes
    setTimeout(() => clearInterval(interval), 120000)
  }

  const stopActiveStream = async () => {
    if (!activeStreamId) return

    try {
      await axios.post(`${API_BASE}/stream/stop/${activeStreamId}`)
      setActiveStreamId(null)
      setStreamStatus('idle')
      setStreamMessage('')
      setStreamUrl(DEMO_VIDEO_URL)
    } catch (error) {
      console.error('Failed to stop stream:', error)
    }
  }

  const toggleControls = () => {
    setShowControls(!showControls)
  }

  return (
    <div className="rtsp-app">
      {/* Compact Header */}
      <header className="compact-header">
        <div className="header-content">
          <h1 className="app-title">🎥 RTSP Live Stream Studio</h1>
          <div className="header-controls">
            <div className="status-indicator">
              <div className="status-dot"></div>
              {isConnected ? 'API Connected' : 'API Disconnected'}
            </div>
            <button 
              className="btn btn-secondary toggle-controls"
              onClick={toggleControls}
              title={showControls ? 'Hide Controls' : 'Show Controls'}
            >
              {showControls ? '🔽' : '🔼'}
            </button>
          </div>
        </div>
      </header>

      {/* Single Screen Layout */}
      <div className="single-screen-layout">
        {/* Fixed Video Player */}
        <div className="video-section-fixed">
          <VideoPlayer 
            src={streamUrl} 
            overlays={overlays}
            onOverlaySelect={handleOverlaySelect}
            onOverlayUpdate={handleOverlayUpdate}
            selectedOverlay={selectedOverlay}
          />
        </div>

        {/* Collapsible Control Panel */}
        <div className={`control-panel-overlay ${showControls ? 'visible' : 'hidden'}`}>
          <div className="control-panel-content">
            {/* Stream URL Input */}
            <div className="stream-url-section">
              <div className="form-group">
                <label>🔗 Video Stream URL</label>
                <div className="url-input-group">
                  <input
                    type="text"
                    value={originalRtspUrl || streamUrl}
                    onChange={handleStreamUrlChange}
                    placeholder="Enter RTSP URL or video URL (MP4, HLS, etc.)"
                  />
                </div>
                
                <div className="stream-buttons">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setStreamUrl(DEMO_VIDEO_URL)
                      setOriginalRtspUrl('')
                      setStreamStatus('ready')
                      setStreamMessage('')
                    }}
                    title="Use demo MP4 video"
                  >
                    📹 Demo Video
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setStreamUrl(HLS_DEMO_URL)
                      setOriginalRtspUrl('')
                      setStreamStatus('ready')
                      setStreamMessage('')
                    }}
                    title="Use demo HLS stream"
                  >
                    📡 HLS Demo
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setOriginalRtspUrl(DEFAULT_RTSP_URL)
                      setStreamStatus('rtsp-detected')
                      setStreamMessage('RTSP URL loaded - click "Start RTSP Stream" to convert')
                    }}
                    title="Load test RTSP URL"
                  >
                    🔗 Test RTSP
                  </button>
                </div>

                {/* RTSP Conversion Controls */}
                {streamStatus === 'rtsp-detected' && (
                  <div className="rtsp-controls">
                    <button 
                      className="btn btn-primary"
                      onClick={convertRtspStream}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="loading"></div>
                          Converting...
                        </>
                      ) : (
                        '🚀 Start RTSP Stream'
                      )}
                    </button>
                  </div>
                )}

                {/* Active Stream Controls */}
                {activeStreamId && streamStatus === 'active' && (
                  <div className="active-stream-controls">
                    <div className="stream-info">
                      <span className="status-dot active"></span>
                      <span>Stream ID: {activeStreamId}</span>
                    </div>
                    <button 
                      className="btn btn-danger"
                      onClick={stopActiveStream}
                    >
                      🛑 Stop Stream
                    </button>
                  </div>
                )}

                {/* Stream Status Message */}
                {streamMessage && (
                  <div className={`stream-message ${streamStatus}`}>
                    {streamMessage}
                  </div>
                )}
              </div>
            </div>

            {/* Tabs for different sections */}
            <div className="control-tabs">
              <div className="tab-content">
                {/* Overlay Editor */}
                <div className="tab-section">
                  <h3>⚡ Overlay Editor</h3>
                  <OverlayEditor
                    selectedOverlay={selectedOverlay}
                    onCreateOverlay={createOverlay}
                    onUpdateOverlay={updateOverlay}
                    onDeleteOverlay={deleteOverlay}
                    onSelectOverlay={setSelectedOverlay}
                    loading={loading}
                  />
                </div>

                {/* Active Overlays */}
                <div className="tab-section">
                  <h3>📋 Active Overlays ({overlays.length})</h3>
                  <div className="overlay-list-compact">
                    {overlays.length === 0 ? (
                      <p className="empty-state">
                        No overlays yet. Create your first overlay above! 👆
                      </p>
                    ) : (
                      overlays.map(overlay => (
                        <div 
                          key={overlay._id} 
                          className={`overlay-item-compact ${selectedOverlay?._id === overlay._id ? 'selected' : ''}`}
                          onClick={() => handleOverlaySelect(overlay)}
                        >
                          <div className="overlay-info">
                            <span className="overlay-icon">
                              {overlay.type === 'text' ? '📝' : '🖼️'}
                            </span>
                            <span className="overlay-content">
                              {overlay.content.substring(0, 25)}
                              {overlay.content.length > 25 ? '...' : ''}
                            </span>
                          </div>
                          <button
                            className="delete-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteOverlay(overlay._id)
                            }}
                            title="Delete overlay"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Guide */}
                <div className="tab-section">
                  <h3>🚀 Quick Guide</h3>
                  <div className="quick-guide">
                    <div className="guide-item">
                      <span className="guide-number">1</span>
                      <span>Click "Demo Video" for instant testing or enter your video URL</span>
                    </div>
                    <div className="guide-item">
                      <span className="guide-number">2</span>
                      <span>Create text or image overlays using the editor</span>
                    </div>
                    <div className="guide-item">
                      <span className="guide-number">3</span>
                      <span>Drag and resize overlays directly on the video</span>
                    </div>
                    <div className="guide-item">
                      <span className="guide-number">4</span>
                      <span>All changes are automatically saved</span>
                    </div>
                  </div>
                  
                  <div className="rtsp-info">
                    <h4>📡 RTSP Streaming Setup</h4>
                    <p>For RTSP streams, convert to browser-compatible format:</p>
                    <code>
                      ffmpeg -i rtsp://your-stream -c copy -f hls output.m3u8
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage