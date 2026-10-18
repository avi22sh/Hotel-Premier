param(
    [Parameter(Mandatory=$true)][string]$PhotoPath,
    [Parameter(Mandatory=$true)][string]$OutputPath,
    [Parameter(Mandatory=$true)][string]$DishName,
    [ValidateSet('slate','cream')][string]$Theme = 'slate',
    [switch]$FreePlanVerified
)
# Single, explicit pilot request. No retry, gateway, paid fallback, or public endpoint.
$ErrorActionPreference = 'Stop'
if (!$FreePlanVerified) { throw 'Verify Workers Free in the account dashboard before using this pilot.' }
if (Test-Path -LiteralPath $OutputPath) { throw 'Output already exists; originals and previous samples will not be overwritten.' }
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Net.Http
$pilotTokenPath = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'HotelPremierPhotoPilot/workers-ai-token.dpapi'
$pilotSecureToken = Get-Content -LiteralPath $pilotTokenPath -Raw | ConvertTo-SecureString
$pilotCredential = [pscredential]::new('WorkersAI', $pilotSecureToken)
$client = [System.Net.Http.HttpClient]::new()
$client.Timeout = [TimeSpan]::FromSeconds(120)
$form = [System.Net.Http.MultipartFormDataContent]::new()
try {
    $sourceImage = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $PhotoPath).Path)
    try {
        $scale = [Math]::Min(1, 511.0 / [Math]::Max($sourceImage.Width, $sourceImage.Height))
        $smallImage = [System.Drawing.Bitmap]::new([Math]::Max(1,[int]($sourceImage.Width*$scale)), [Math]::Max(1,[int]($sourceImage.Height*$scale)))
        $graphics = [System.Drawing.Graphics]::FromImage($smallImage)
        $stream = [System.IO.MemoryStream]::new()
        try {
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.DrawImage($sourceImage, 0, 0, $smallImage.Width, $smallImage.Height)
            $smallImage.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
            $bytes = $stream.ToArray()
        } finally { $graphics.Dispose(); $smallImage.Dispose(); $stream.Dispose() }
    } finally { $sourceImage.Dispose() }
    # Palette references are from styles.css; hex values are visual guidance, not guaranteed output pixels.
    $surface = if ($Theme -eq 'slate') { 'a minimal matte blue-charcoal slate surface inspired by #17212D, fading to a plain deep charcoal background inspired by #0D141C, with a very subtle warm antique-brass light reflection inspired by #C5A880' } else { 'a minimal matte warm ivory stone surface inspired by #FAF7F0, fading to a plain warm cream background inspired by #F4EFE6, with a very subtle warm antique-brass light reflection inspired by #C5A880' }
    $prompt = "Edit the supplied reference photograph of $DishName for Hotel Premier, an Indian vegetarian restaurant. Preserve the exact dish, every visible ingredient, portion size, garnish, bowl or plate, composition and camera angle. Change the surrounding table and background to $surface. Make a clearly different background, not just a colour filter. Keep the food brightly and naturally lit with soft neutral-warm light, realistic contact shadows and natural colours. No extra food, no new garnish, no invented ingredients, no text, logos, hands or new utensils. Do not redesign the dish or serving vessel."
    $prompt += ' Keep the setting uncluttered: no lamps, candles, flowers, decorative objects or gold ornaments. Maintain identical neutral food exposure and white balance regardless of whether the background is light or dark. Only the surrounding surface should adopt the theme palette. Leave breathing room around the serving vessel for a square menu-card crop.'
    $form.Add([System.Net.Http.StringContent]::new($prompt), 'prompt')
    $form.Add([System.Net.Http.StringContent]::new('1024'), 'width')
    $form.Add([System.Net.Http.StringContent]::new('1024'), 'height')
    $form.Add([System.Net.Http.StringContent]::new('1247'), 'seed')
    $imageContent = [System.Net.Http.ByteArrayContent]::new($bytes)
    $imageContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::new('image/png')
    $form.Add($imageContent, 'input_image_0', 'reference.png')
    $client.DefaultRequestHeaders.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer', $pilotCredential.GetNetworkCredential().Password)
    $endpoint = 'https://api.cloudflare.com/client/v4/accounts/3f42ea8ca36c6357807b18f2cfa7f41c/ai/run/@cf/black-forest-labs/flux-2-klein-4b'
    $response = $client.PostAsync($endpoint, $form).GetAwaiter().GetResult()
    if (!$response.IsSuccessStatusCode) {
        throw "Cloudflare returned HTTP $([int]$response.StatusCode). Stopped without retry or paid fallback."
    }
    $payload = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json
    if ($payload.success -ne $true -or !$payload.result.image) { throw 'No generated image returned. Stopped without retry.' }
    $imageBytes = [Convert]::FromBase64String(($payload.result.image -replace '^data:image/[^;]+;base64,',''))
    $parentPath = Split-Path -Parent $OutputPath
    [System.IO.Directory]::CreateDirectory($parentPath) | Out-Null
    # CreateNew also protects against a file appearing during the network request.
    $outputStream = [System.IO.File]::Open($OutputPath, [System.IO.FileMode]::CreateNew)
    try { $outputStream.Write($imageBytes,0,$imageBytes.Length) } finally { $outputStream.Dispose() }
    Write-Output "Saved one unapproved pilot sample: $OutputPath"
} catch {
    # Never print provider response bodies, authorization headers or token contents.
    if ($_.Exception.Message -match '^Cloudflare returned HTTP|^No generated image') { Write-Error $_.Exception.Message }
    else { Write-Error 'Pilot failed. No token or provider response body printed; no automatic retry.' }
} finally {
    $form.Dispose()
    $client.Dispose()
    $pilotCredential = $null
    $pilotSecureToken.Dispose()
}
