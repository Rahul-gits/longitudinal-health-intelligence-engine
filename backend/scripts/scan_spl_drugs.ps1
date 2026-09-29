Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = (Resolve-Path 'backend/db/dm_spl_release_human_rx_part1.zip').Path
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)

$found = 0
$step = [Math]::Floor($zip.Entries.Count / 120)

Write-Host "Scanning samples across archive..."

for ($i = 0; $i -lt $zip.Entries.Count; $i += $step) {
    if ($found -ge 30) { break }
    $entry = $zip.Entries[$i]
    $stream = $entry.Open()
    try {
        $nestedZip = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Read)
        $xmlEntry = $nestedZip.Entries | Where-Object { $_.FullName -like '*.xml' } | Select-Object -First 1
        if ($xmlEntry) {
            $r = New-Object System.IO.StreamReader($xmlEntry.Open())
            $xmlText = $r.ReadToEnd()
            $r.Close()
            
            $drug = ''
            if ($xmlText -match '<name>([^<]+)</name>') {
                $drug = $matches[1].Trim()
            }
            if (-not $drug -and $xmlText -match '<title>([^<]+)</title>') {
                $drug = $matches[1].Trim()
            }
            if ($drug) {
                Write-Host "Index $i | $drug"
                $found++
            }
        }
        $nestedZip.Dispose()
    } catch {
        # ignore error
    } finally {
        $stream.Dispose()
    }
}

$zip.Dispose()
Write-Host "Finished scanning $found samples."
