#!/usr/bin/env pwsh

Write-Host "🎥 RTSP Live Stream Studio - Professional Launch" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Check system requirements
Write-Host "🔍 Checking system requirements..." -ForegroundColor Yellow

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js 16+" -ForegroundColor Red
    exit 1
}

# Check FFmpeg
try {
    $ffmpegVersion = ffmpeg -version 2>&1 | Select-Object -First 1
    Write-Host "✅ FFmpeg: Available" -ForegroundColor Green
} catch {
    Write-Host "⚠️  FFmpeg not found - RTSP conversion will not work" -ForegroundColor Yellow
    Write-Host "   Install: choco install ffmpeg (Windows)" -ForegroundColor Gray
}

# Check if MongoDB is running
Write-Host "🔍 Checking MongoDB connection..." -ForegroundColor Yellow
try {
    $mongoTest = python test-mongo-connection.py 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MongoDB is connected and ready" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB connection failed, using in-memory storage" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  MongoDB test failed, using in-memory storage" -ForegroundColor Yellow
}

# Install backend dependencies if needed
Write-Host "📦 Checking backend dependencies..." -ForegroundColor Yellow
if (!(Test-Path "backend/.venv")) {
    Write-Host "🔧 Setting up Python virtual environment..." -ForegroundColor Yellow
    Set-Location backend
    python -m venv .venv
    .\.venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    Set-Location ..
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Backend environment ready" -ForegroundColor Green
}

# Install frontend dependencies if needed
Write-Host "📦 Checking frontend dependencies..." -ForegroundColor Yellow
if (!(Test-Path "frontend/node_modules")) {
    Write-Host "🔧 Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend dependencies ready" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting RTSP Live Stream Studio..." -ForegroundColor Green

# Start backend
Write-Host "🔧 Starting Flask backend with RTSP conversion..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location backend
    if (Test-Path ".venv") {
        .\.venv\Scripts\Activate.ps1
    }
    python app.py
}

# Wait for backend to start
Start-Sleep -Seconds 4

# Start frontend
Write-Host "🌐 Starting React frontend..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location frontend
    npm run dev
}

# Wait for services to initialize
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🎉 RTSP Live Stream Studio is now running!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "   API Docs: See API-DOCUMENTATION.md" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Quick Start:" -ForegroundColor Magenta
Write-Host "   1. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "   2. Click '📹 Demo Video' for instant testing" -ForegroundColor White
Write-Host "   3. Or enter RTSP URL and click '🚀 Start RTSP Stream'" -ForegroundColor White
Write-Host "   4. Create overlays and drag them on the video" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Test RTSP Stream:" -ForegroundColor Yellow
Write-Host "   rtsp://rtspstream:gnJ6gUvRCmrr1_etQJmkd@zephyr.rtsp.stream/people" -ForegroundColor White
Write-Host ""
Write-Host "✨ Professional Features:" -ForegroundColor Magenta
Write-Host "   • Automatic RTSP to HLS conversion" -ForegroundColor White
Write-Host "   • Real-time overlay management" -ForegroundColor White
Write-Host "   • Single-screen optimized interface" -ForegroundColor White
Write-Host "   • MongoDB persistence with fallback" -ForegroundColor White
Write-Host "   • Professional video controls" -ForegroundColor White
Write-Host "   • Mobile responsive design" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Blue
Write-Host "   • User Guide: USER-DOCUMENTATION.md" -ForegroundColor White
Write-Host "   • API Reference: API-DOCUMENTATION.md" -ForegroundColor White
Write-Host "   • RTSP Setup: RTSP-SETUP-GUIDE.md" -ForegroundColor White
Write-Host ""
Write-Host "🎮 Interface Controls:" -ForegroundColor Magenta
Write-Host "   • Toggle controls with 🔽/🔼 button" -ForegroundColor White
Write-Host "   • Drag overlays directly on video" -ForegroundColor White
Write-Host "   • Use quick templates for common overlays" -ForegroundColor White
Write-Host "   • All changes auto-save to database" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Keep this window open to maintain services!" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Red

# Monitor services and keep script running
try {
    while ($true) {
        # Check if jobs are still running
        if ($backendJob.State -eq "Failed" -or $backendJob.State -eq "Completed") {
            Write-Host "❌ Backend service stopped unexpectedly" -ForegroundColor Red
            break
        }
        
        if ($frontendJob.State -eq "Failed" -or $frontendJob.State -eq "Completed") {
            Write-Host "❌ Frontend service stopped unexpectedly" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Seconds 5
    }
} finally {
    Write-Host ""
    Write-Host "🛑 Shutting down RTSP Live Stream Studio..." -ForegroundColor Red
    
    # Stop jobs gracefully
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    
    # Kill any remaining processes
    Get-Process | Where-Object {$_.ProcessName -eq "python" -or $_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ All services stopped successfully" -ForegroundColor Green
    Write-Host "Thank you for using RTSP Live Stream Studio! 🎥✨" -ForegroundColor Cyan
}