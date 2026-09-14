Add-Type -AssemblyName System.Drawing

$size = 1024
$bitmap = New-Object System.Drawing.Bitmap($size, $size)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::FromArgb(17, 18, 20))

$backgroundBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(24, 30, 31))
$graphics.FillRectangle($backgroundBrush, 64, 64, 896, 896)

$greenPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(61, 220, 132), 46)
$greenPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$greenPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLine($greenPen, 210, 512, 814, 512)
$graphics.DrawLine($greenPen, 512, 292, 512, 732)

$plateBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(61, 220, 132))
$graphics.FillRectangle($plateBrush, 150, 398, 70, 228)
$graphics.FillRectangle($plateBrush, 245, 350, 70, 324)
$graphics.FillRectangle($plateBrush, 709, 350, 70, 324)
$graphics.FillRectangle($plateBrush, 804, 398, 70, 228)

$output = Join-Path $PSScriptRoot '..\assets\icon.png'
$bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$backgroundBrush.Dispose()
$greenPen.Dispose()
$plateBrush.Dispose()
$bitmap.Dispose()