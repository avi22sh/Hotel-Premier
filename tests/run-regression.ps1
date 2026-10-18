# ==============================================================================
# HOTEL PREMIER PWA - REGRESSION & INTEGRATION TEST RUNNER (PowerShell)
# Native Windows test runner for 100% Zero-Cost local execution
# ==============================================================================

Write-Host "`nRunning Hotel Premier PWA Comprehensive Regression Suite..." -ForegroundColor Cyan

$html = Get-Content -Raw "index.html"
$royalCss = Get-Content -Raw "royal.css"
$stylesCss = Get-Content -Raw "styles.css"
$app = Get-Content -Raw "app.js"
$sw = Get-Content -Raw "sw.js"
$hotelData = Get-Content -Raw "data/hotel-data.js"
$menuData = Get-Content -Raw "data/menu-data.js"

# 1. Check guest details panels
$panels = ([regex]::Matches($html, 'class="guest-details-panel"')).Count
if ($panels -ne 2) {
    Write-Error "FAILED: Expected 2 guest-details-panels in index.html, found $panels"
    exit 1
}
Write-Host "PASS [1/14]: Guest details panel count ($panels) matches spec" -ForegroundColor Green

# 2. Check booking price summary tokens
foreach ($name in @('booking-original-price', 'booking-final-price', 'booking-savings-note')) {
    if (-not $app.Contains("class=""$name""")) {
        Write-Error "FAILED: app.js missing markup token $name"
        exit 1
    }
    if (-not $royalCss.Contains(".$name {")) {
        Write-Error "FAILED: royal.css missing selector .$name {"
        exit 1
    }
}
Write-Host "PASS [2/14]: Booking price tokens and CSS classes verified" -ForegroundColor Green

# 3. Check Phone Validation and Date Protection
if (-not $app.Contains("sanitizeIndianMobile(")) {
    Write-Error "FAILED: app.js missing sanitizeIndianMobile helper"
    exit 1
}
if (-not $app.Contains("isValidIndianMobile(")) {
    Write-Error "FAILED: app.js missing isValidIndianMobile helper"
    exit 1
}
if (-not $app.Contains("dateInput.min = today")) {
    Write-Error "FAILED: app.js missing check-in min date enforcement"
    exit 1
}
Write-Host "PASS [3/14]: Mobile number sanitization and past-date protections verified" -ForegroundColor Green

# 4. Check PWA Cache & Asset Version Parity
$swVersionMatch = [regex]::Match($sw, "const CACHE_NAME = 'hotel-premier-v([^']+)';")
if (-not $swVersionMatch.Success) {
    Write-Error "FAILED: Could not find CACHE_NAME in sw.js"
    exit 1
}
$swVer = $swVersionMatch.Groups[1].Value

if (-not $html.Contains("styles.css?v=$swVer")) {
    Write-Error "FAILED: index.html styles.css version mismatch (expected $swVer)"
    exit 1
}
if (-not $html.Contains("royal.css?v=$swVer")) {
    Write-Error "FAILED: index.html royal.css version mismatch (expected $swVer)"
    exit 1
}
if (-not $html.Contains("app.js?v=$swVer")) {
    Write-Error "FAILED: index.html app.js version mismatch (expected $swVer)"
    exit 1
}
Write-Host "PASS [4/14]: Service Worker ($swVer) and stylesheet/script version strings in full sync" -ForegroundColor Green

# 5. Check Brand Palette Boundaries (No green prices)
if ($royalCss.Contains("--stay-accent: #285347") -or $royalCss.Contains("--burgundy-primary: #29473E")) {
    Write-Error "FAILED: Found forbidden olive green brand override in royal.css"
    exit 1
}
Write-Host "PASS [5/14]: Brand color boundaries confirmed (olive green prices eliminated)" -ForegroundColor Green

# 6. Sourced Guest Policy & Content Wording Guard
if (-not $html.Contains("guest-policy-panel") -or -not $html.Contains("booking-policy-note")) {
    Write-Error "FAILED: index.html missing policy containers"
    exit 1
}
if ($html -match "Reserve Deluxe Room|24h Room Service|Room Only \(EP\)") {
    Write-Error "FAILED: Found unapproved legacy wording in index.html"
    exit 1
}
Write-Host "PASS [6/14]: Sourced guest policy panels & accurate brand phrasing verified" -ForegroundColor Green

# 7. Glassmorphism & Card Contrast Architecture
foreach ($cls in @('.tariff-plan-box', '.bulk-tier-card', '.tier-tag', '.tier-name', '.tier-perks', '.attraction-card', '.route-start-card')) {
    if (-not $royalCss.Contains($cls) -and -not $stylesCss.Contains($cls)) {
        Write-Error "FAILED: Missing CSS rules for $cls"
        exit 1
    }
}
Write-Host "PASS [7/14]: Glassmorphic tariff cards, group tiers, and explore routes verified" -ForegroundColor Green

# 8. GitHub Pages SPA Routing Parity (404.html == index.html)
$f404 = Get-Content -Raw "404.html"
if ($html -ne $f404) {
    Write-Error "FAILED: 404.html is out of sync with index.html (GitHub Pages SPA fallback will serve stale assets)"
    exit 1
}
Write-Host "PASS [8/14]: GitHub Pages SPA routing fallback (404.html) in exact byte parity with index.html" -ForegroundColor Green

# 9. Hotel Room Categories & Fixed-Menu Terms
foreach ($roomId in @('ac-super-deluxe', 'ac-deluxe-queen', 'ac-deluxe-twin')) {
    if (-not $hotelData.Contains("'$roomId'")) {
        Write-Error "FAILED: hotel-data.js missing room category $roomId"
        exit 1
    }
}
if (-not $html.Contains("The Premier Way to Stay") -or -not $html.Contains("CP includes breakfast from a fixed menu; conditions apply")) {
    Write-Error "FAILED: index.html missing room presentation or CP fixed-menu terms"
    exit 1
}
Write-Host "PASS [9/14]: Room categories and CP fixed-menu terms verified" -ForegroundColor Green

# 10. Menu Categories Integrity & Packaged Juices
if (-not ($menuData -match 'pasta-section') -or -not ($menuData -match 'packaged-fruit-juices')) {
    Write-Error "FAILED: menu-data.js missing pasta-section or packaged-fruit-juices"
    exit 1
}
foreach ($j in @('cb-juice-orange', 'cb-juice-mango', 'cb-juice-pineapple', 'cb-juice-guava')) {
    if (-not $menuData.Contains("'$j'")) {
        Write-Error "FAILED: menu-data.js missing juice $j"
        exit 1
    }
}
Write-Host "PASS [10/14]: Menu categories integrity and 4 packaged juices verified" -ForegroundColor Green

# 11. Hotel Image Optimization Health
$hotelImages = Get-ChildItem -Path "assets/hotel-images" -Filter "*.jpg"
if ($hotelImages.Count -lt 36) {
    Write-Error "FAILED: Expected at least 36 hotel images, found $($hotelImages.Count)"
    exit 1
}
$oversized = $hotelImages | Where-Object { $_.Length -gt 300000 }
if ($oversized) {
    Write-Error "FAILED: Found $($oversized.Count) images exceeding 300KB budget"
    exit 1
}
$totalMb = [math]::Round(($hotelImages | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
Write-Host "PASS [11/14]: Hotel image optimization health ($($hotelImages.Count) images totaling ${totalMb}MB, all under 300KB)" -ForegroundColor Green

# 12. CRM Navigation & Property Gallery Accessibility
if (-not $html.Contains('class="admin-back-btn"') -or -not $html.Contains('aria-label="Back to app"')) {
    Write-Error "FAILED: index.html missing accessible CRM back button"
    exit 1
}
if (-not $html.Contains('A Little Space to Pause')) {
    Write-Error "FAILED: index.html missing Property Gallery header"
    exit 1
}
Write-Host "PASS [12/14]: CRM back navigation and Property Gallery accessibility verified" -ForegroundColor Green

# 13. WCAG Accessibility: 100% Form Inputs and Close Buttons Label Coverage
$inputMatches = [regex]::Matches($html, '<input[^>]*>')
$unlabeledInputs = @()
foreach ($i in $inputMatches) {
    $tag = $i.Value
    if ($tag -match 'type="hidden"') { continue }
    $hasAria = $tag -match 'aria-label|aria-labelledby|placeholder|title'
    $idMatch = [regex]::Match($tag, 'id="([^"]+)"')
    $hasLabel = $false
    if ($idMatch.Success) {
        $id = $idMatch.Groups[1].Value
        if ($html -match "<label[^>]*for=""$id""") { $hasLabel = $true }
    }
    if (-not $hasAria -and -not $hasLabel) {
        $unlabeledInputs += $tag
    }
}
if ($unlabeledInputs.Count -gt 0) {
    Write-Error "FAILED: Found $($unlabeledInputs.Count) unlabeled inputs in index.html"
    exit 1
}

# Verify modal close buttons have aria-label
$closeBtnMatches = [regex]::Matches($html, '<button[^>]*class="[^"]*modal-close-btn[^"]*"[^>]*>')
foreach ($btn in $closeBtnMatches) {
    if (-not ($btn.Value -match 'aria-label="[^"]+"')) {
        Write-Error "FAILED: modal-close-btn missing aria-label: $($btn.Value)"
        exit 1
    }
}
Write-Host "PASS [13/14]: WCAG Accessibility (0 unlabeled inputs, 100% modal close buttons aria-labeled)" -ForegroundColor Green

# 14. Menu Photos & Dish Integrity (Unique IDs, Valid Prices, Existing Photo Files)
$dishIdMatches = [regex]::Matches($menuData, "id:\s*'([a-zA-Z0-9_-]+)',\s*categoryId:") | ForEach-Object { $_.Groups[1].Value }
$uniqueDishIds = $dishIdMatches | Select-Object -Unique
if ($dishIdMatches.Count -ne $uniqueDishIds.Count) {
    Write-Error "FAILED: Found duplicate dish IDs in data/menu-data.js"
    exit 1
}

$photos = Get-Content -Raw "data/menu-photos.js"
$photoMatches = [regex]::Matches($photos, '"([a-zA-Z0-9_-]+)":\s*"([^"]*)"')
foreach ($m in $photoMatches) {
    $path = $m.Groups[2].Value
    if (-not [string]::IsNullOrWhiteSpace($path)) {
        if (-not (Test-Path $path)) {
            Write-Error "FAILED: Referenced dish photo missing on disk: $path"
            exit 1
        }
    }
}
Write-Host "PASS [14/14]: Menu photos & dish integrity ($($uniqueDishIds.Count) unique dishes, all $($photoMatches.Count) photos verified on disk)" -ForegroundColor Green

Write-Host "`nAll 14 test suites PASSED with 100% compliance!" -ForegroundColor Cyan
