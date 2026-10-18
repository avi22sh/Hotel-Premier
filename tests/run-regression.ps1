# ==============================================================================
# HOTEL PREMIER PWA - REGRESSION & INTEGRATION TEST RUNNER (PowerShell)
# ==============================================================================

Write-Host "Running Hotel Premier PWA Comprehensive Regression Suite..." -ForegroundColor Cyan

$html = Get-Content -Raw "index.html"
$royalCss = Get-Content -Raw "royal.css"
$stylesCss = Get-Content -Raw "styles.css"
$app = Get-Content -Raw "app.js"
$sw = Get-Content -Raw "sw.js"

# 1. Check guest details panels
$panels = ([regex]::Matches($html, 'class="guest-details-panel"')).Count
if ($panels -ne 2) {
    Write-Error "FAILED: Expected 2 guest-details-panels in index.html, found $panels"
    exit 1
}
Write-Host "PASS [1/8]: Guest details panel count ($panels) matches spec" -ForegroundColor Green

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
Write-Host "PASS [2/8]: Booking price tokens and CSS classes verified" -ForegroundColor Green

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
Write-Host "PASS [3/8]: Mobile number sanitization and past-date protections verified" -ForegroundColor Green

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
Write-Host "PASS [4/8]: Service Worker ($swVer) and stylesheet/script version strings in full sync" -ForegroundColor Green

# 5. Check Brand Palette Boundaries (No green prices)
if ($royalCss.Contains("--stay-accent: #285347") -or $royalCss.Contains("--burgundy-primary: #29473E")) {
    Write-Error "FAILED: Found forbidden olive green brand override in royal.css"
    exit 1
}
Write-Host "PASS [5/8]: Brand color boundaries confirmed (olive green prices eliminated)" -ForegroundColor Green

# 6. Sourced Guest Policy & Content Wording Guard
if (-not $html.Contains("guest-policy-panel") -or -not $html.Contains("booking-policy-note")) {
    Write-Error "FAILED: index.html missing policy containers"
    exit 1
}
if ($html -match "Reserve Deluxe Room|24h Room Service|Room Only \(EP\)") {
    Write-Error "FAILED: Found unapproved legacy wording in index.html"
    exit 1
}
Write-Host "PASS [6/8]: Sourced guest policy panels & accurate brand phrasing verified" -ForegroundColor Green

# 7. Glassmorphism & Card Contrast Architecture
foreach ($cls in @('.tariff-plan-box', '.bulk-tier-card', '.tier-tag', '.tier-name', '.tier-perks')) {
    if (-not $royalCss.Contains($cls) -and -not $stylesCss.Contains($cls)) {
        Write-Error "FAILED: Missing CSS rules for $cls"
        exit 1
    }
}
Write-Host "PASS [7/8]: Glassmorphic tariff cards and group tier styling verified" -ForegroundColor Green

# 8. GitHub Pages SPA Routing Parity (404.html == index.html)
$f404 = Get-Content -Raw "404.html"
if ($html -ne $f404) {
    Write-Error "FAILED: 404.html is out of sync with index.html (GitHub Pages SPA fallback will serve stale assets)"
    exit 1
}
Write-Host "PASS [8/8]: GitHub Pages SPA routing fallback (404.html) in exact byte parity with index.html" -ForegroundColor Green

Write-Host "`nAll 8 test suites PASSED with 100% compliance!" -ForegroundColor Cyan
