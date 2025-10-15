from flask import Flask, request, jsonify
from flask_cors import CORS
from routes.overlays import overlays_bp
import os
import subprocess
import threading
import time
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
print(f"🔧 Environment loaded - MONGO_URI: {os.environ.get('MONGO_URI')}")

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'rtsp-streaming-secret-key')

# Global variables for stream management
active_streams = {}
stream_counter = 0

# Register blueprints
app.register_blueprint(overlays_bp, url_prefix='/api/overlays')

@app.route('/')
def health_check():
    return {'status': 'RTSP Live Stream Studio API is running', 'version': '1.0.0'}

@app.route('/api/test')
def api_test():
    """Test endpoint to verify API is working"""
    import subprocess
    
    # Check FFmpeg availability
    ffmpeg_available = False
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True, timeout=5)
        ffmpeg_available = result.returncode == 0
    except:
        ffmpeg_available = False
    
    return jsonify({
        'api_status': 'working',
        'ffmpeg_available': ffmpeg_available,
        'active_streams': len(active_streams),
        'timestamp': time.time()
    })

@app.route('/api/stream/convert', methods=['POST'])
def convert_rtsp_stream():
    """Convert RTSP stream to HLS for browser compatibility"""
    global stream_counter
    
    try:
        data = request.get_json()
        rtsp_url = data.get('rtsp_url')
        
        if not rtsp_url:
            return jsonify({'error': 'RTSP URL is required'}), 400
            
        if not rtsp_url.startswith('rtsp://'):
            return jsonify({'error': 'Invalid RTSP URL format'}), 400
        
        # Generate unique stream ID
        stream_counter += 1
        stream_id = f"stream_{stream_counter}"
        
        # Create output directory
        output_dir = f"hls_streams/{stream_id}"
        os.makedirs(output_dir, exist_ok=True)
        
        # Enhanced FFmpeg command for better RTSP to HLS conversion
        ffmpeg_cmd = [
            'ffmpeg',
            '-rtsp_transport', 'tcp',
            '-i', rtsp_url,
            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-tune', 'zerolatency',
            '-profile:v', 'baseline',
            '-level', '3.0',
            '-pix_fmt', 'yuv420p',
            '-g', '30',
            '-keyint_min', '30',
            '-sc_threshold', '0',
            '-b:v', '2500k',
            '-maxrate', '2500k',
            '-bufsize', '5000k',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-ar', '44100',
            '-f', 'hls',
            '-hls_time', '2',
            '-hls_list_size', '5',
            '-hls_wrap', '10',
            '-hls_flags', 'delete_segments+independent_segments+program_date_time',
            '-hls_segment_type', 'mpegts',
            '-hls_allow_cache', '0',
            '-start_number', '0',
            '-y',  # Overwrite output files
            f'{output_dir}/stream.m3u8'
        ]
        
        # Start FFmpeg process
        def run_ffmpeg():
            try:
                print(f"🚀 Starting FFmpeg conversion for stream {stream_id}")
                print(f"📡 RTSP URL: {rtsp_url}")
                print(f"📁 Output: {output_dir}/stream.m3u8")
                
                process = subprocess.Popen(
                    ffmpeg_cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    universal_newlines=True
                )
                active_streams[stream_id] = {
                    'process': process,
                    'rtsp_url': rtsp_url,
                    'hls_url': f'/api/stream/hls/{stream_id}/stream.m3u8',
                    'status': 'starting',
                    'output_dir': output_dir,
                    'start_time': time.time()
                }
                
                # Monitor FFmpeg output
                def monitor_ffmpeg():
                    try:
                        stdout, stderr = process.communicate(timeout=30)
                        if process.returncode == 0:
                            active_streams[stream_id]['status'] = 'active'
                            print(f"✅ Stream {stream_id} conversion completed")
                        else:
                            active_streams[stream_id]['status'] = 'failed'
                            print(f"❌ Stream {stream_id} failed: {stderr}")
                    except subprocess.TimeoutExpired:
                        # FFmpeg is still running (normal for live streams)
                        if stream_id in active_streams:
                            active_streams[stream_id]['status'] = 'active'
                            print(f"✅ Stream {stream_id} is running")
                    except Exception as e:
                        print(f"❌ Monitor error for stream {stream_id}: {e}")
                        if stream_id in active_streams:
                            active_streams[stream_id]['status'] = 'failed'
                
                # Start monitoring in background
                import threading
                monitor_thread = threading.Thread(target=monitor_ffmpeg)
                monitor_thread.daemon = True
                monitor_thread.start()
                
                # Wait a bit for initial setup
                time.sleep(5)
                
                # Check if HLS files are being created
                hls_file = f"{output_dir}/stream.m3u8"
                if os.path.exists(hls_file):
                    active_streams[stream_id]['status'] = 'active'
                    print(f"✅ Stream {stream_id} HLS files created")
                else:
                    print(f"⏳ Stream {stream_id} still initializing...")
                    
            except Exception as e:
                print(f"❌ FFmpeg error for stream {stream_id}: {e}")
                if stream_id in active_streams:
                    active_streams[stream_id]['status'] = 'failed'
                    active_streams[stream_id]['error'] = str(e)
        
        # Start conversion in background thread
        thread = threading.Thread(target=run_ffmpeg)
        thread.daemon = True
        thread.start()
        
        # Return stream info immediately
        hls_url = f"http://localhost:5000/api/stream/hls/{stream_id}/stream.m3u8"
        
        return jsonify({
            'success': True,
            'stream_id': stream_id,
            'hls_url': hls_url,
            'rtsp_url': rtsp_url,
            'status': 'starting',
            'message': 'RTSP stream conversion started. HLS stream will be available shortly.'
        })
        
    except Exception as e:
        return jsonify({'error': f'Stream conversion failed: {str(e)}'}), 500

@app.route('/api/stream/hls/<stream_id>/<path:filename>')
def serve_hls_file(stream_id, filename):
    """Serve HLS files for streaming with enhanced headers"""
    try:
        file_path = f"hls_streams/{stream_id}/{filename}"
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'Stream file not found'}), 404
            
        # Enhanced headers for better HLS streaming
        if filename.endswith('.m3u8'):
            mimetype = 'application/vnd.apple.mpegurl'
        elif filename.endswith('.ts'):
            mimetype = 'video/mp2t'
        else:
            mimetype = 'application/octet-stream'
        
        from flask import Response, send_file
        
        # Use send_file for better performance
        response = send_file(
            file_path,
            mimetype=mimetype,
            as_attachment=False,
            conditional=True
        )
        
        # Enhanced CORS and caching headers
        response.headers.update({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Range, Content-Type',
            'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
            'Cache-Control': 'no-cache, no-store, must-revalidate' if filename.endswith('.m3u8') else 'public, max-age=3600',
            'Pragma': 'no-cache' if filename.endswith('.m3u8') else 'cache',
            'Expires': '0' if filename.endswith('.m3u8') else '',
            'Accept-Ranges': 'bytes'
        })
        
        return response
        
    except Exception as e:
        print(f"❌ Error serving HLS file {filename}: {e}")
        return jsonify({'error': f'Failed to serve HLS file: {str(e)}'}), 500

@app.route('/api/stream/status/<stream_id>')
def get_stream_status(stream_id):
    """Get status of a specific stream"""
    if stream_id not in active_streams:
        return jsonify({'error': 'Stream not found'}), 404
        
    stream_info = active_streams[stream_id]
    
    # Check if process is still running
    if stream_info['process'].poll() is not None:
        stream_info['status'] = 'stopped'
    
    return jsonify({
        'stream_id': stream_id,
        'status': stream_info['status'],
        'rtsp_url': stream_info['rtsp_url'],
        'hls_url': f"http://localhost:5000{stream_info['hls_url']}"
    })

@app.route('/api/stream/list')
def list_active_streams():
    """List all active streams"""
    streams = []
    for stream_id, info in active_streams.items():
        # Check if process is still running
        if info['process'].poll() is not None:
            info['status'] = 'stopped'
            
        streams.append({
            'stream_id': stream_id,
            'status': info['status'],
            'rtsp_url': info['rtsp_url'],
            'hls_url': f"http://localhost:5000{info['hls_url']}"
        })
    
    return jsonify({'streams': streams})

@app.route('/api/stream/stop/<stream_id>', methods=['POST'])
def stop_stream(stream_id):
    """Stop a specific stream"""
    if stream_id not in active_streams:
        return jsonify({'error': 'Stream not found'}), 404
    
    try:
        stream_info = active_streams[stream_id]
        process = stream_info['process']
        
        # Terminate FFmpeg process
        process.terminate()
        process.wait(timeout=5)
        
        # Clean up files
        import shutil
        if os.path.exists(stream_info['output_dir']):
            shutil.rmtree(stream_info['output_dir'])
        
        # Remove from active streams
        del active_streams[stream_id]
        
        return jsonify({
            'success': True,
            'message': f'Stream {stream_id} stopped successfully'
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to stop stream: {str(e)}'}), 500

if __name__ == '__main__':
    # Create HLS streams directory
    os.makedirs('hls_streams', exist_ok=True)
    
    print("🎥 RTSP Live Stream Studio API Starting...")
    print("📡 RTSP to HLS conversion endpoint: /api/stream/convert")
    print("🌐 HLS streaming endpoint: /api/stream/hls/<stream_id>/")
    print("📊 Stream management endpoints available")
    
    app.run(host='0.0.0.0', port=5000, debug=True)