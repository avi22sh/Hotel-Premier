# ==============================================================================
# HOTEL PREMIER - QR MENU DEPLOYMENT PACKAGER
# Packages all menu files, assets, PWA manifest, and CMS into a production zip
# Ready for Netlify Drop, Vercel, GitHub Pages, or offline extraction.
# ==============================================================================

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$sourceDir = $PSScriptRoot
$zipPath = Join-Path (Split-Path -Parent $sourceDir) "hotel-premier-qr-menu-ready-to-deploy.zip"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🏨 Packaging Hotel Premier QR Menu for Live Deployment..." -ForegroundColor Yellow
Write-Host "Source Directory: $sourceDir" -ForegroundColor Gray
Write-Host "Target Zip:       $zipPath" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

$files = Get-ChildItem -Path $sourceDir -Recurse -File | Where-Object {
    $_.FullName -notmatch "build-deployment-zip\.ps1$" -and
    $_.FullName -notmatch "\.git" -and
    $_.FullName -notmatch "test_.*\.html$"
}

$count = 0
foreach ($f in $files) {
    $rel = $f.FullName.Substring($sourceDir.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $f.FullName, $rel, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    $count++
}

$zip.Dispose()

Write-Host "Successfully packaged $count files into:" -ForegroundColor Green
Write-Host "$zipPath" -ForegroundColor Green
$fileInfo = Get-Item $zipPath
Write-Host "Zip Archive Size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host 'Ready to deploy! Drag and drop this zip to: https://app.netlify.com/drop' -ForegroundColor Yellow
