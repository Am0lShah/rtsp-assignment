import React, { useEffect, useRef, useState } from 'react'
import interact from 'interactjs'

function VideoPlayer({ src, overlays, onOverlaySelect, onOverlayUpdate, selectedOverlay }) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const retryCountRef = useRef(0)
  const hlsRef = useRef(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [streamError, setStreamError] = useState(null)
  const [retryDisplay, setRetryDisplay] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 })
  const maxRetries = 5

  // Load HLS.js dynamically if needed
  useEffect(() => {
    if (!window.Hls && !document.querySelector('script[src*="hls.js"]')) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest'
      script.async = true
      document.head.appendChild(script)
      console.log('📦 Loading HLS.js library...')
    }
  }, [])

  // Enhanced HLS support with hls.js fallback
  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    // Reset state for new source
    setVideoLoaded(false)
    retryCountRef.current = 0
    setRetryDisplay(0)
    setStreamError(null)

    console.log('🎬 Loading video source:', src)

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    // Handle different video formats
    if (src.includes('.m3u8')) {
      // HLS stream handling
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari, iOS)
        console.log('📱 Using native HLS support')
        video.src = src
      } else if (window.Hls && window.Hls.isSupported()) {
        // Use HLS.js for other browsers
        console.log('🌐 Using HLS.js for cross-browser support')
        
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
          startLevel: -1,
          capLevelToPlayerSize: true
        })
        hlsRef.current = hls
        
        hls.loadSource(src)
        hls.attachMedia(video)
        
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ HLS manifest parsed')
          setVideoLoaded(true)
          video.play().catch(e => console.log('Autoplay prevented:', e))
        })
        
        hls.on(window.Hls.Events.ERROR, (event, data) => {
          console.error('HLS.js error:', data)
          if (data.fatal) {
            switch (data.type) {
              case window.Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, trying to recover...')
                hls.startLoad()
                break
              case window.Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...')
                hls.recoverMediaError()
                break
              default:
                setStreamError('HLS playback error: ' + data.details)
                break
            }
          }
        })
      } else {
        // Fallback to direct loading
        console.log('🔄 Fallback to direct HLS loading')
        video.src = src
      }
    } else if (src.startsWith('rtsp://')) {
      // RTSP URLs should be converted by backend first
      console.warn('⚠️ Direct RTSP URL detected - this should be converted first')
      setStreamError('RTSP URLs must be converted to HLS first')
      setVideoLoaded(false)
      return
    } else {
      // Regular video files (MP4, WebM, etc.)
      console.log('📹 Loading regular video file')
      video.src = src
    }

    const handleLoadedMetadata = () => {
      const { videoWidth, videoHeight } = video
      setVideoDimensions({ width: videoWidth, height: videoHeight })
      setVideoLoaded(true)
      setStreamError(null)
      retryCountRef.current = 0
      setRetryDisplay(0)
      console.log(`✅ Video loaded: ${videoWidth}x${videoHeight}`)
    }

    const handleError = (e) => {
      console.error('❌ Video stream error:', e)
      setVideoLoaded(false)

      // Enhanced retry logic for HLS streams
      if (src.includes('.m3u8') && retryCountRef.current < maxRetries) {
        retryCountRef.current += 1
        setRetryDisplay(retryCountRef.current)
        console.log(`🔄 HLS stream error - retry ${retryCountRef.current}/${maxRetries}`)

        setTimeout(() => {
          if (video && retryCountRef.current <= maxRetries) {
            // Try reloading the video
            video.load()
          }
        }, 1000 * retryCountRef.current) // Progressive backoff
      } else if (src.includes('.m3u8')) {
        console.error('❌ HLS stream failed after maximum retries')
        setStreamError('Stream unavailable. Please check if the RTSP conversion is running.')
      } else {
        setStreamError('Video failed to load. Please check the URL.')
      }
    }

    const handleCanPlay = () => {
      console.log('🎯 Video can play - stream is ready')
      setVideoLoaded(true)
      setStreamError(null)
      retryCountRef.current = 0
      setRetryDisplay(0)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    const handleLoadStart = () => {
      console.log('📡 Video load started')
    }

    const handleWaiting = () => {
      console.log('⏳ Video buffering...')
    }

    const handlePlaying = () => {
      console.log('▶️ Video playing')
      setIsPlaying(true)
    }

    // Add comprehensive event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('playing', handlePlaying)

    // Enhanced loading for HLS streams
    if (src.includes('.m3u8')) {
      // Set additional attributes for better HLS handling
      video.setAttribute('crossorigin', 'anonymous')
      video.load()
    }

    return () => {
      // Clean up event listeners
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('playing', handlePlaying)
      
      // Clean up HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [src])

  useEffect(() => {
    if (!videoLoaded) return

    // Setup interact.js for each overlay
    overlays.forEach(overlay => {
      const element = document.querySelector(`[data-overlay-id="${overlay._id}"]`)
      if (!element) return

      interact(element)
        .draggable({
          listeners: {
            move(event) {
              const target = event.target
              const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
              const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

              target.style.transform = `translate(${x}px, ${y}px)`
              target.setAttribute('data-x', x)
              target.setAttribute('data-y', y)
            },
            end(event) {
              const target = event.target
              const x = parseFloat(target.getAttribute('data-x')) || 0
              const y = parseFloat(target.getAttribute('data-y')) || 0

              const rect = containerRef.current.getBoundingClientRect()
              const overlayId = target.getAttribute('data-overlay-id')

              onOverlayUpdate(overlayId, {
                position: {
                  x: overlay.position.x + x,
                  y: overlay.position.y + y
                }
              })

              // Reset transform
              target.style.transform = ''
              target.setAttribute('data-x', 0)
              target.setAttribute('data-y', 0)
            }
          }
        })
        .resizable({
          edges: { left: true, right: true, bottom: true, top: true },
          listeners: {
            move(event) {
              const target = event.target
              let x = parseFloat(target.getAttribute('data-x')) || 0
              let y = parseFloat(target.getAttribute('data-y')) || 0

              target.style.width = event.rect.width + 'px'
              target.style.height = event.rect.height + 'px'

              x += event.deltaRect.left
              y += event.deltaRect.top

              target.style.transform = `translate(${x}px, ${y}px)`
              target.setAttribute('data-x', x)
              target.setAttribute('data-y', y)
            },
            end(event) {
              const target = event.target
              const overlayId = target.getAttribute('data-overlay-id')
              const x = parseFloat(target.getAttribute('data-x')) || 0
              const y = parseFloat(target.getAttribute('data-y')) || 0

              onOverlayUpdate(overlayId, {
                position: {
                  x: overlay.position.x + x,
                  y: overlay.position.y + y
                },
                size: {
                  width: event.rect.width,
                  height: event.rect.height
                }
              })

              // Reset transform
              target.style.transform = ''
              target.setAttribute('data-x', 0)
              target.setAttribute('data-y', 0)
            }
          }
        })
    })

    return () => {
      overlays.forEach(overlay => {
        const element = document.querySelector(`[data-overlay-id="${overlay._id}"]`)
        if (element) {
          interact(element).unset()
        }
      })
    }
  }, [overlays, videoLoaded, onOverlayUpdate])

  const handleOverlayClick = (overlay, event) => {
    event.stopPropagation()
    onOverlaySelect(overlay)
  }

  const handlePlayPause = () => {
    const video = videoRef.current
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
    }
  }

  const handleVolumeChange = (newVolume) => {
    const video = videoRef.current
    if (video) {
      video.volume = newVolume
      setVolume(newVolume)
    }
  }

  const handleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!isFullscreen) {
      // Enter fullscreen
      if (container.requestFullscreen) {
        container.requestFullscreen()
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen()
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen()
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen()
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  return (
    <div className="video-player-wrapper">
      <div className="video-container" ref={containerRef}>
        <video
          ref={videoRef}
          className="main-video"
          onError={(e) => console.error('Video stream error:', e)}
          autoPlay
          muted={volume === 0}
          playsInline
          controls={false}
          preload="metadata"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            background: '#000'
          }}
          poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI3MjAiIHZpZXdCb3g9IjAgMCAxMjgwIDcyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYmciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMGYwZjIzO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxNjIxM2U7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2JnKSIvPgogIDxjaXJjbGUgY3g9IjY0MCIgY3k9IjMwMCIgcj0iNDAiIGZpbGw9IiM2NjdlZWEiIG9wYWNpdHk9IjAuOCI+CiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjAuODswLjM7MC44IiBkdXI9IjJzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPgogIDwvY2lyY2xlPgogIDx0ZXh0IHg9IjY0MCIgeT0iMzgwIiBmb250LWZhbWlseT0iSW50ZXIsIEFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI4IiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjZTJlOGYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Mb2FkaW5nIFZpZGVvLi4uPC90ZXh0PgogIDx0ZXh0IHg9IjY0MCIgeT0iNDIwIiBmb250LWZhbWlseT0iSW50ZXIsIEFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjYTBhMGEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QbGVhc2Ugd2FpdCB3aGlsZSB3ZSBjb25uZWN0IHRvIHlvdXIgc3RyZWFtPC90ZXh0Pgo8L3N2Zz4K"
        />

        {/* Overlay Elements */}
        {videoLoaded && overlays.map(overlay => (
          <div
            key={overlay._id}
            data-overlay-id={overlay._id}
            className={`overlay ${selectedOverlay?._id === overlay._id ? 'selected' : ''}`}
            style={{
              position: 'absolute',
              left: overlay.position.x,
              top: overlay.position.y,
              width: overlay.size.width,
              height: overlay.size.height,
              zIndex: overlay.zIndex || 10,
              cursor: 'move'
            }}
            onClick={(e) => handleOverlayClick(overlay, e)}
            title={`${overlay.type === 'text' ? 'Text' : 'Image'} Overlay: ${overlay.content.substring(0, 30)}${overlay.content.length > 30 ? '...' : ''}`}
          >
            {overlay.type === 'text' ? (
              <div
                className="overlay-text"
                style={{
                  fontSize: overlay.style?.fontSize || 18,
                  color: overlay.style?.color || '#ffffff',
                  backgroundColor: overlay.style?.backgroundColor || 'rgba(0,0,0,0.7)',
                  fontFamily: overlay.style?.fontFamily || 'Arial',
                  fontWeight: overlay.style?.fontWeight || 'normal',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  wordWrap: 'break-word',
                  padding: '4px 8px'
                }}
              >
                {overlay.content}
              </div>
            ) : (
              <img
                src={overlay.content}
                alt="Overlay"
                className="overlay-image"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '4px'
                }}
                onError={(e) => {
                  e.target.style.display = 'none'
                  console.error('Failed to load overlay image:', overlay.content)
                }}
              />
            )}

            {/* Selection Indicator */}
            {selectedOverlay?._id === overlay._id && (
              <div
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '12px',
                  height: '12px',
                  background: '#f59e0b',
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              />
            )}
          </div>
        ))}

        {/* Custom Video Controls */}
        <div className="video-controls">
          <button
            className="control-btn play-pause"
            onClick={handlePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          <div className="volume-control">
            <span>🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="volume-slider"
            />
          </div>

          <div className="stream-status">
            <div className={`status-dot ${videoLoaded ? 'connected' : 'connecting'}`}></div>
            {videoLoaded ? 'LIVE' : 'Connecting...'}
          </div>

          <button
            className="control-btn fullscreen-btn"
            onClick={handleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? '🗗' : '⛶'}
          </button>
        </div>

        {/* Enhanced Loading Overlay */}
        {!videoLoaded && !streamError && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div>
              {src.includes('.m3u8') 
                ? 'Connecting to HLS stream...' 
                : src.includes('rtsp://') 
                ? 'Converting RTSP stream...'
                : 'Loading video...'}
            </div>
            {retryDisplay > 0 && (
              <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '12px' }}>
                Retry attempt {retryDisplay} of {maxRetries}
              </div>
            )}
            {src.includes('.m3u8') && (
              <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '8px' }}>
                This may take a few moments for live streams
              </div>
            )}
          </div>
        )}

        {/* Enhanced Error Overlay */}
        {streamError && (
          <div className="error-overlay">
            <div className="error-icon">⚠️</div>
            <div className="error-message">{streamError}</div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '12px', maxWidth: '400px' }}>
              {src.includes('.m3u8')
                ? 'Make sure the RTSP conversion is running and the stream URL is accessible'
                : src.includes('rtsp://')
                ? 'RTSP streams need to be converted to HLS format first'
                : 'Please verify the video URL is correct and accessible'
              }
            </div>
            {src.includes('.m3u8') && (
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '20px' }}
                onClick={() => {
                  setStreamError(null)
                  setVideoLoaded(false)
                  retryCountRef.current = 0
                  setRetryDisplay(0)
                  if (videoRef.current) {
                    videoRef.current.load()
                  }
                }}
              >
                🔄 Retry Connection
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoPlayer