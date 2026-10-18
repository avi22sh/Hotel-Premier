# Mechanical preview packaging: compress existing samples for an inline comparison.
param([Parameter(Mandatory=$true)][string]$PreviewDirectory)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$previewFile = Join-Path $PreviewDirectory 'theme-preview.html'
$markup = [System.IO.File]::ReadAllText($previewFile)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
foreach ($variant in @(@('cream','__LIGHT_PHOTO__'), @('slate','__DARK_PHOTO__'))) {
    $source = [System.Drawing.Image]::FromFile((Join-Path $PreviewDirectory "paneer-$($variant[0])-theme-v2.png"))
    $stream = [System.IO.MemoryStream]::new()
    $parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
    $parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]82)
    try {
        $source.Save($stream,$codec,$parameters)
        $markup = $markup.Replace($variant[1], ('data:image/jpeg;base64,' + [Convert]::ToBase64String($stream.ToArray())))
    } finally { $source.Dispose(); $stream.Dispose(); $parameters.Dispose() }
}
if ([System.Text.Encoding]::UTF8.GetByteCount($markup) -ge 1000000) { throw 'Preview exceeds inline size limit.' }
[System.IO.File]::WriteAllText($previewFile, $markup)
Write-Output 'Preview images embedded; no network requests or new generations.'
