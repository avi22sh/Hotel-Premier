# Interactive Windows-only credential setup. Never stores a plaintext token.
# Run on the restaurant owner's Windows account, not on a web server.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$pilotDirectory = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'HotelPremierPhotoPilot'
$pilotCredentialPath = Join-Path $pilotDirectory 'workers-ai-token.dpapi'

$form = New-Object System.Windows.Forms.Form
$form.Text = 'Hotel Premier - private photo pilot setup'
$form.ClientSize = New-Object System.Drawing.Size(540, 255)
$form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$form.TopMost = $true

$description = New-Object System.Windows.Forms.Label
$description.Location = New-Object System.Drawing.Point(20, 18)
$description.Size = New-Object System.Drawing.Size(500, 70)
$description.Text = 'Paste the Cloudflare token limited to Workers AI for your account. It will be encrypted for this Windows user, outside the website and GitHub repository. This step makes no API calls and does not activate billing.'
$form.Controls.Add($description)

$tokenInput = New-Object System.Windows.Forms.TextBox
$tokenInput.Location = New-Object System.Drawing.Point(20, 95)
$tokenInput.Size = New-Object System.Drawing.Size(500, 28)
$tokenInput.UseSystemPasswordChar = $true
$form.Controls.Add($tokenInput)

$status = New-Object System.Windows.Forms.Label
$status.Location = New-Object System.Drawing.Point(20, 135)
$status.Size = New-Object System.Drawing.Size(500, 45)
$status.Text = 'Only paste here, not into chat or the public PWA.'
$form.Controls.Add($status)

$save = New-Object System.Windows.Forms.Button
$save.Location = New-Object System.Drawing.Point(270, 195)
$save.Size = New-Object System.Drawing.Size(150, 35)
$save.Text = 'Save encrypted token'
$save.Add_Click({
    if ($tokenInput.Text.Trim().Length -lt 20 -or $tokenInput.Text.Trim() -match '\s') {
        $status.Text = 'Please paste the token itself, without spaces or a Bearer prefix.'
        return
    }
    if (Test-Path -LiteralPath $pilotCredentialPath) {
        $choice = [System.Windows.Forms.MessageBox]::Show('Replace the previously saved photo-pilot token?', 'Confirm replacement', 'YesNo', 'Question')
        if ($choice -ne 'Yes') { return }
    }
    try {
        $secureToken = ConvertTo-SecureString -String $tokenInput.Text.Trim() -AsPlainText -Force
        $encryptedToken = ConvertFrom-SecureString -SecureString $secureToken
        [System.IO.Directory]::CreateDirectory($pilotDirectory) | Out-Null
        [System.IO.File]::WriteAllText($pilotCredentialPath, $encryptedToken)
        $secureToken.Dispose()
        $tokenInput.Clear()
        $status.Text = 'Saved encrypted on this Windows account. Return to the chat and say: token saved.'
        $save.Enabled = $false
    } catch {
        $tokenInput.Clear()
        $status.Text = 'Could not save securely. No token was printed. Close this window and ask for help.'
    }
})
$form.Controls.Add($save)

$close = New-Object System.Windows.Forms.Button
$close.Location = New-Object System.Drawing.Point(430, 195)
$close.Size = New-Object System.Drawing.Size(90, 35)
$close.Text = 'Close'
$close.Add_Click({ $form.Close() })
$form.Controls.Add($close)
$form.AcceptButton = $save
$form.CancelButton = $close
$form.Add_FormClosed({ $tokenInput.Clear() })
$form.Add_Shown({
    $form.Activate()
    $tokenInput.Focus()
    Write-Output 'Photo-pilot masked entry window is open. No credential has been read or printed.'
})
[void]$form.ShowDialog()
$form.Dispose()
