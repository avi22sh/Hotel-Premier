# ==============================================================================
# HOTEL PREMIER - DIRECT LIVE PUBLISHING ENGINE
# Automatically unpacks overrides, saves photos, bumps cache, and pushes to GitHub
# 100% Zero-Cost native Windows execution without external dependencies
# ==============================================================================
param(
    [string]$InputFile,
    [string]$JsonPayload,
    [string]$ResultFile
)

$ErrorActionPreference = "Stop"

# Keep the API result separate from Git/PowerShell console output.
function Write-PublishResult($Value) {
    $resultJson = $Value | ConvertTo-Json -Depth 10 -Compress
    if ($ResultFile) {
        [IO.File]::WriteAllText($ResultFile, $resultJson, [System.Text.UTF8Encoding]::new($false))
    } else {
        $resultJson
    }
}

try {
    $rootDir = (Get-Item $PSScriptRoot).Parent.FullName
    Set-Location $rootDir
    $pendingTracked = git status --porcelain --untracked-files=no
    if ($LASTEXITCODE -ne 0) { throw "The publishing repository could not be opened." }
    if ($pendingTracked) { throw "Developer changes are being prepared on this PC. Your browser edits are safe. Finish that update before publishing again." }

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
            if (-not ($img.path -match '^assets/menu-uploads/published-[a-f0-9]{24}\.(webp|jpg|png|avif)$')) { throw "Invalid photo publish path." }

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
    # Older open tabs may omit deletion markers from their layout snapshot.
    # Keep committed removals unless the owner explicitly restores that item.
    if ((Test-Path $overridesFile) -and $bundle.overrides.layout.items) {
        $previousCode = [IO.File]::ReadAllText($overridesFile)
        $previousJson = $previousCode.Substring($previousCode.IndexOf('=') + 1).Trim().TrimEnd(';')
        $previous = $previousJson | ConvertFrom-Json
        foreach ($property in $previous.layout.items.PSObject.Properties) {
            if ($property.Value._deleted -and -not $bundle.overrides.dishes.PSObject.Properties[$property.Name]) {
                $bundle.overrides.layout.items | Add-Member -MemberType NoteProperty -Name $property.Name -Value ([PSCustomObject]@{_deleted=$true}) -Force
            }
        }
    }
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
    foreach ($releaseFile in @('app.js','asset-pipeline.js','photo-workflow.js','public-reviews.js','pwa-updates.js')) {
        $releasePath = Join-Path $rootDir $releaseFile
        $releaseText = [IO.File]::ReadAllText($releasePath).Replace($currentVer,$newVer)
        [IO.File]::WriteAllText($releasePath,$releaseText,[System.Text.UTF8Encoding]::new($false))
    }

    # 5. Maintain dist/ and 404.html parity
    $distDir = Join-Path $rootDir "dist"
    if (-not (Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir -Force | Out-Null }
    Copy-Item $indexFile (Join-Path $distDir "index.html") -Force
    Copy-Item $indexFile (Join-Path $distDir "404.html") -Force
    Copy-Item $swFile (Join-Path $distDir "sw.js") -Force
    $distDataDir = Join-Path $distDir "data"
    if (-not (Test-Path $distDataDir)) { New-Item -ItemType Directory -Path $distDataDir -Force | Out-Null }
    Copy-Item $overridesFile (Join-Path $distDataDir "published-overrides.js") -Force

    # If node is available, run build-public-dist
    if (Get-Command node -ErrorAction SilentlyContinue) {
        node (Join-Path $rootDir "tools\build-public-dist.cjs") | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Publish build failed. Your browser edits are still saved locally." }
    }

    # 6. Execute Git Commit & Push (if changes exist)
    git add assets/menu-uploads data/published-overrides.js sw.js index.html app.js asset-pipeline.js photo-workflow.js public-reviews.js pwa-updates.js
    if ($LASTEXITCODE -ne 0) { throw "Could not stage the publication. Your browser edits are still saved locally." }
    git diff --cached --quiet
    if ($LASTEXITCODE -gt 1) { throw "Could not inspect the publication changes." }
    $hasChanges = $LASTEXITCODE -eq 1
    if ($hasChanges) {
        $commitMsg = "feat(crm): 1-click live publish from Admin Studio (v$newVer)"
        git commit -m $commitMsg | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Could not commit the publication. No live update was completed." }
        git push origin main | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "GitHub did not accept the publication. No live update was completed. Export a backup and retry." }
    }

    $commitHash = (git rev-parse --short HEAD).Trim()

    $result = [PSCustomObject]@{
        success = $true
        version = "v$newVer"
        commit = $commitHash
        imagesSaved = $savedImagesCount
        timestamp = $timestamp
        publishedAt = $nowMs
        expectedContent = ($fileHeader + $overridesJson + $fileFooter)
        message = "Saved to GitHub. Website deployment must still be verified."
    }

    Write-PublishResult $result
} catch {
    $errObj = [PSCustomObject]@{
        success = $false
        error = $_.Exception.Message
    }
    Write-PublishResult $errObj
    exit 1
}
