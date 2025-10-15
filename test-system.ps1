#!/usr/bin/env pwsh

Write-Host "🧪 RTSP Live Stream Studio - System Test" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Test 1: Check if backend is running
Write-Host "🔍 Testing backend API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/test" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend API: Working" -ForegroundColor Green
    Write-Host "   FFmpeg Available: $($response.ffmpeg_available)" -ForegroundColor White
    Write-Host "   Active Streams: $($response.active_streams)" -ForegroundColor White
} catch {
    Write-Host "❌ Backend API: Not responding" -ForegroundColor Red
    Write-Host "   Make sure backend is running: python backend/app.py" -ForegroundColor Yellow
}

# Test 2: Check if frontend is accessible
Write-Host "🔍 Testing frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Frontend: Accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend: Not accessible" -ForegroundColor Red
    Write-Host "   Make sure frontend is running: cd frontend && npm run dev" -ForegroundColor Yellow
}

# Test 3: Test overlay CRUD operations
Write-Host "🔍 Testing overlay CRUD..." -ForegroundColor Yellow
try {
    # Create test overlay
    $testOverlay = @{
        type = "text"
        content = "TEST OVERLAY"
        position = @{ x = 10; y = 10 }
        size = @{ width = 100; height = 30 }
        style = @{
            fontSize = 16
            color = "#ffffff"
            backgroundColor = "rgba(255, 0, 0, 0.8)"
        }
    } | ConvertTo-Json -Depth 3

    $createResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/overlays" -Method POST -Body $testOverlay -ContentType "application/json" -TimeoutSec 5
    
    if ($createResponse.success) {
        Write-Host "✅ Overlay CRUD: Working" -ForegroundColor Green
        
        # Clean up test overlay
        try {
            Invoke-RestMethod -Uri "http://localhost:5000/api/overlays/$($createResponse._id)" -Method DELETE -TimeoutSec 5
            Write-Host "   Test overlay cleaned up" -ForegroundColor Gray
        } catch {
            Write-Host "   Warning: Could not clean up test overlay" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Overlay CRUD: Failed to create overlay" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Overlay CRUD: API error" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 4: Check demo video accessibility
Write-Host "🔍 Testing demo video..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" -Method HEAD -TimeoutSec 10
    Write-Host "✅ Demo Video: Accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Demo Video: Not accessible" -ForegroundColor Red
    Write-Host "   Check internet connection" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Test Summary:" -ForegroundColor Magenta
Write-Host "   If all tests pass, the system is ready for use" -ForegroundColor White
Write-Host "   If any tests fail, check the error messages above" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Blue
Write-Host "   1. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "   2. Click '📹 Demo Video' to test overlay functionality" -ForegroundColor White
Write-Host "   3. Try RTSP conversion with a test stream" -ForegroundColor White
Write-Host ""