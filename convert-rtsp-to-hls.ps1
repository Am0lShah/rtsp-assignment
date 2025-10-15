#!/usr/bin/env pwsh

param(
    [string]$rtspUrl = "rtsp://rtspstream:gnJ6gUvRCmrr1_etQJmkd@zephyr.rtsp.stream/people",
    [string]$outputDir = "hls-output",
    [int]$port = 8000
)

Write-Host "🎥 RTSP to HLS Converter for Browser Streaming" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Check if FFmpeg is installed
try {
    $ffmpegVersion = ffmpeg -version 2>$null
    Write-Host "✅ FFmpeg found" -ForegroundColor Green
} catch {
    Write-Host "❌ FFmpeg not found!" -ForegroundColor Red
    Write-Host "📥 Please install FFmpeg:" -ForegroundColor Yellow
    Write-Host "   Windows: choco install ffmpeg" -ForegroundColor White
    Write-Host "   macOS: brew install ffmpeg" -ForegroundColor White
    Write-Host "   Ubuntu: sudo apt install ffmpeg" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "🔗 RTSP URL: $rtspUrl" -ForegroundColor Yellow
Write-Host "📁 Output Directory: $outputDir" -ForegroundColor Yellow
Write-Host "🌐 Server Port: $port" -ForegroundColor Yellow

# Create output directory
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Write-Host "📁 Created output directory: $outputDir" -ForegroundColor Green
}

# Clean up old files
Get-ChildItem -Path $outputDir -Filter "*.ts" | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path $outputDir -Filter "*.m3u8" | Remove-Item -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🔄 Starting RTSP to HLS conversion..." -ForegroundColor Yellow
Write-Host "⏳ This may take a moment to establish connection..." -ForegroundColor Gray

# FFmpeg arguments for RTSP to HLS conversion
$ffmpegArgs = @(
    "-rtsp_transport", "tcp",
    "-i", $rtspUrl,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-tune", "zerolatency", 
    "-c:a", "aac",
    "-b:a", "128k",
    "-f", "hls",
    "-hls_time", "2",
    "-hls_list_size", "3",
    "-hls_flags", "delete_segments+independent_segments",
    "-hls_segment_type", "mpegts",
    "$outputDir/stream.m3u8"
)

# Start FFmpeg conversion in background
$ffmpegJob = Start-Job -ScriptBlock {
    param($args)
    & ffmpeg @args
} -ArgumentList $ffmpegArgs

Write-Host "🎬 FFmpeg conversion started (Job ID: $($ffmpegJob.Id))" -ForegroundColor Green

# Wait for HLS files to be created
$timeout = 30
$elapsed = 0
do {
    Start-Sleep -Seconds 1
    $elapsed++
    $hlsFile = Join-Path $outputDir "stream.m3u8"
    
    if (Test-Path $hlsFile) {
        Write-Host "✅ HLS stream file created!" -ForegroundColor Green
        break
    }
    
    if ($elapsed -ge $timeout) {
        Write-Host "⏰ Timeout waiting for HLS stream creation" -ForegroundColor Red
        Write-Host "🔍 Check if RTSP URL is accessible" -ForegroundColor Yellow
        Stop-Job $ffmpegJob -ErrorAction SilentlyContinue
        Remove-Job $ffmpegJob -ErrorAction SilentlyContinue
        exit 1
    }
    
    Write-Host "⏳ Waiting for stream... ($elapsed/$timeout seconds)" -ForegroundColor Gray
} while ($true)

# Start HTTP server for HLS files
Write-Host ""
Write-Host "🌐 Starting HLS server on port $port..." -ForegroundColor Yellow

try {
    Set-Location $outputDir
    
    # Check if http-server is available
    $httpServerAvailable = $false
    try {
        npx http-server --version 2>$null | Out-Null
        $httpServerAvailable = $true
    } catch {
        Write-Host "⚠️ http-server not found, trying Python..." -ForegroundColor Yellow
    }
    
    if ($httpServerAvailable) {
        Write-Host "📡 Using Node.js http-server..." -ForegroundColor Green
        $serverJob = Start-Job -ScriptBlock {
            param($port)
            Set-Location $using:outputDir
            npx http-server . -p $port --cors -s
        } -ArgumentList $port
    } else {
        Write-Host "📡 Using Python HTTP server..." -ForegroundColor Green
        $serverJob = Start-Job -ScriptBlock {
            param($port)
            Set-Location $using:outputDir
            python -m http.server $port
        } -ArgumentList $port
    }
    
    # Wait for server to start
    Start-Sleep -Seconds 3
    
    Write-Host ""
    Write-Host "🎉 SUCCESS! RTSP to HLS conversion is running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📺 HLS Stream URL:" -ForegroundColor Cyan
    Write-Host "   http://localhost:$port/stream.m3u8" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 Next Steps:" -ForegroundColor Magenta
    Write-Host "   1. Copy the HLS URL above" -ForegroundColor White
    Write-Host "   2. Open your RTSP webapp (http://localhost:5173)" -ForegroundColor White
    Write-Host "   3. Paste the HLS URL in the stream input" -ForegroundColor White
    Write-Host "   4. Start creating overlays!" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Services Running:" -ForegroundColor Blue
    Write-Host "   • FFmpeg RTSP→HLS conversion (Job: $($ffmpegJob.Id))" -ForegroundColor White
    Write-Host "   • HTTP server for HLS files (Job: $($serverJob.Id))" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️ Keep this window open to maintain the stream!" -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Red
    
    # Keep script running and monitor jobs
    try {
        while ($true) {
            # Check if jobs are still running
            if ($ffmpegJob.State -eq "Failed" -or $ffmpegJob.State -eq "Completed") {
                Write-Host "❌ FFmpeg job stopped unexpectedly" -ForegroundColor Red
                break
            }
            
            if ($serverJob.State -eq "Failed" -or $serverJob.State -eq "Completed") {
                Write-Host "❌ HTTP server stopped unexpectedly" -ForegroundColor Red
                break
            }
            
            Start-Sleep -Seconds 5
        }
    } finally {
        Write-Host ""
        Write-Host "🛑 Stopping services..." -ForegroundColor Red
        Stop-Job $ffmpegJob -ErrorAction SilentlyContinue
        Stop-Job $serverJob -ErrorAction SilentlyContinue
        Remove-Job $ffmpegJob -ErrorAction SilentlyContinue
        Remove-Job $serverJob -ErrorAction SilentlyContinue
        Write-Host "✅ All services stopped" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Error starting HTTP server: $_" -ForegroundColor Red
    Stop-Job $ffmpegJob -ErrorAction SilentlyContinue
    Remove-Job $ffmpegJob -ErrorAction SilentlyContinue
    exit 1
} finally {
    Set-Location ..
}