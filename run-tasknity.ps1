# Tasknity - Run Emulator and Deploy App
# Save this file and run it anytime you want to test your app

Write-Host "================================" -ForegroundColor Cyan
Write-Host "TASKNITY - Emulator & App Launcher" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Step 1: Stop any existing emulator
Write-Host "`n[1/3] Stopping any existing emulator..." -ForegroundColor Yellow
Get-Process emulator -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 2: Start the emulator
Write-Host "[2/3] Starting Android emulator (DeviceAPI24)..." -ForegroundColor Yellow
$env:ANDROID_SDK_ROOT="D:\Android\Sdk"
$env:ANDROID_HOME="D:\Android\Sdk"
Start-Process -FilePath "D:\Android\Sdk\emulator\emulator.exe" -ArgumentList "-avd DeviceAPI24 -no-boot-anim -no-audio -accel on" -NoNewWindow
Write-Host "Emulator launching... waiting 75 seconds for boot..." -ForegroundColor Green
Start-Sleep -Seconds 75

# Step 3: Deploy the app
Write-Host "[3/3] Building and deploying app..." -ForegroundColor Yellow
cd "D:\DOCUMENTS\College\college documents sem 8\Project-Management-System\Project-Management-System\tasknity"
flutter run

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Done! App is running on emulator" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "`nKeybinds in Flutter:" -ForegroundColor Magenta
Write-Host "  r = Hot reload (reload code changes)" -ForegroundColor Gray
Write-Host "  R = Hot restart (full restart)" -ForegroundColor Gray
Write-Host "  q = Quit app" -ForegroundColor Gray
