# ==============================================================================
# HOTEL PREMIER PWA - REGRESSION & INTEGRATION TEST RUNNER (PowerShell)
# ==============================================================================

Write-Host "Running Hotel Premier PWA Regression Suite..." -ForegroundColor Cyan

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
Write-Host "PASS: Guest details panel count ($panels) matches spec" -ForegroundColor Green

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
Write-Host "PASS: Booking price tokens and CSS classes verified" -ForegroundColor Green

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
Write-Host "PASS: Mobile number sanitization and past-date protections verified" -ForegroundColor Green

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
Write-Host "PASS: Service Worker ($swVer) and stylesheet/script version strings in full sync" -ForegroundColor Green

# 5. Check Brand Palette Boundaries (No green prices)
if ($royalCss.Contains("--stay-accent: #285347") -or $royalCss.Contains("--burgundy-primary: #29473E")) {
    Write-Error "FAILED: Found forbidden olive green brand override in royal.css"
    exit 1
}
Write-Host "PASS: Brand color boundaries confirmed (olive green prices eliminated)" -ForegroundColor Green

Write-Host "`nAll 5 test suites PASSED with 100% compliance!" -ForegroundColor Cyan
