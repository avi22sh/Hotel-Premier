# ==============================================================================
# HOTEL PREMIER - DIRECT LIVE PUBLISHING ENGINE
# Automatically unpacks overrides, saves photos, bumps cache, and pushes to GitHub
# 100% Zero-Cost native Windows execution without external dependencies
# ==============================================================================
param(
    [string]$InputFile,
    [string]$JsonPayload
)

$ErrorActionPreference = "Stop"

try {
    $rootDir = (Get-Item $PSScriptRoot).Parent.FullName
    Set-Location $rootDir

    # 1. Parse JSON payload
    if ($InputFile -and (Test-Path $InputFile)) {
        $raw = Get-Content -Raw -Encoding UTF8 $InputFile
    } elseif ($JsonPayload) {
        $raw = $JsonPayload
    } else {
        throw "No publish bundle provided. Supply -InputFile or -JsonPayload."
    }

    $bundle = $raw | ConvertFrom-Json
    if (-not $bundle.overrides) {
        throw "Invalid bundle: missing 'overrides' object."
    }

    # 2. Extract and save uploaded images to assets/menu-uploads
    $uploadDir = Join-Path $rootDir "assets\menu-uploads"
    if (-not (Test-Path $uploadDir)) { New-Item -ItemType Directory -Path $uploadDir -Force | Out-Null }

    $savedImagesCount = 0
    if ($bundle.images) {
        foreach ($img in $bundle.images) {
            if (-not $img.path -or -not $img.base64) { continue }
            # Security check: path must be inside assets/menu-uploads/
            $relPath = ($img.path -replace '/', '\').TrimStart('\')
            if (-not $relPath.StartsWith("assets\menu-uploads")) { continue }

            $targetPath = Join-Path $rootDir $relPath
            $targetDir = Split-Path $targetPath -Parent
            if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }

            if (-not (Test-Path $targetPath)) {
                $bytes = [Convert]::FromBase64String($img.base64)
                [IO.File]::WriteAllBytes($targetPath, $bytes)
                $savedImagesCount++
            }
        }
    }

    # 3. Format and update data/published-overrides.js
    $nowMs = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    $bundle.overrides | Add-Member -MemberType NoteProperty -Name "publishedAt" -Value $nowMs -Force

    $overridesFile = Join-Path $rootDir "data\published-overrides.js"
    $overridesJson = ($bundle.overrides | ConvertTo-Json -Depth 25)
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $fileHeader = "// Reviewed owner public export, $timestamp.`nwindow.HOTEL_PREMIER_PUBLISHED_OVERRIDES = "
    $fileFooter = ";`n"
    [IO.File]::WriteAllText($overridesFile, ($fileHeader + $overridesJson + $fileFooter), [System.Text.Encoding]::UTF8)

    # 4. Bump Cache Version in sw.js and index.html
    $swFile = Join-Path $rootDir "sw.js"
    $indexFile = Join-Path $rootDir "index.html"
    $swContent = Get-Content -Raw -Encoding UTF8 $swFile

    $match = [regex]::Match($swContent, "const CACHE_NAME = 'hotel-premier-v([0-9\.]+)';")
    if (-not $match.Success) {
        throw "Could not find CACHE_NAME in sw.js"
    }
    $currentVer = $match.Groups[1].Value
    $parts = $currentVer.Split('.')
    if ($parts.Length -eq 2) {
        $major = $parts[0]
        $minor = [int]$parts[1] + 1
        $newVer = "$major.$minor"
    } else {
        $newVer = "$currentVer.1"
    }

    $swContent = $swContent.Replace("const CACHE_NAME = 'hotel-premier-v$currentVer';", "const CACHE_NAME = 'hotel-premier-v$newVer';")
    [IO.File]::WriteAllText($swFile, $swContent, [System.Text.Encoding]::UTF8)

    $indexContent = Get-Content -Raw -Encoding UTF8 $indexFile
    $indexContent = [regex]::Replace($indexContent, "(\?v=)[0-9\.]+", "`${1}$newVer")
    [IO.File]::WriteAllText($indexFile, $indexContent, [System.Text.Encoding]::UTF8)

    # 5. Maintain dist/ and 404.html parity
    $distDir = Join-Path $rootDir "dist"
    if (-not (Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir -Force | Out-Null }
    Copy-Item $indexFile (Join-Path $distDir "index.html") -Force
    Copy-Item $indexFile (Join-Path $distDir "404.html") -Force

    # If node is available, run build-public-dist
    if (Get-Command node -ErrorAction SilentlyContinue) {
        node (Join-Path $rootDir "tools\build-public-dist.cjs") | Out-Null
    }

    # 6. Execute Git Commit & Push
    git add assets/menu-uploads data/published-overrides.js sw.js index.html dist/
    $commitMsg = "feat(crm): 1-click live publish from Admin Studio (v$newVer)"
    git commit -m $commitMsg | Out-Null
    git push origin main | Out-Null

    $commitHash = (git rev-parse --short HEAD).Trim()

    $result = [PSCustomObject]@{
        success = $true
        version = "v$newVer"
        commit = $commitHash
        imagesSaved = $savedImagesCount
        timestamp = $timestamp
        message = "Published successfully to live site! All guest phones will update shortly."
    }

    $result | ConvertTo-Json
} catch {
    $errObj = [PSCustomObject]@{
        success = $false
        error = $_.Exception.Message
    }
    $errObj | ConvertTo-Json
    exit 1
}
