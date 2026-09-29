Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = (Resolve-Path "backend/db/dm_spl_release_human_rx_part1.zip").Path
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)

$sw = [System.Diagnostics.Stopwatch]::StartNew()
$count = 0
$valid = 0

for ($i = 0; $i -lt 100; $i++) {
    $entry = $zip.Entries[$i]
    $stream = $entry.Open()
    try {
        $nestedZip = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Read)
        $xmlEntry = $nestedZip.Entries | Where-Object { $_.FullName.EndsWith(".xml") } | Select-Object -First 1
        if ($xmlEntry) {
            $r = New-Object System.IO.StreamReader($xmlEntry.Open())
            $text = $r.ReadToEnd()
            $r.Close()

            # Fast regex extraction
            $medName = ""
            if ($text -match '<manufacturedMedicine>[\s\S]*?<name>([^<]+)</name>') {
                $medName = $matches[1].Trim()
            } elseif ($text -match '<manufacturedProduct>[\s\S]*?<name>([^<]+)</name>') {
                $medName = $matches[1].Trim()
            }

            if ($medName) { $valid++ }
        }
        $nestedZip.Dispose()
    } catch {} finally {
        $stream.Dispose()
    }
    $count++
}

$sw.Stop()
$zip.Dispose()

Write-Host "Processed $count entries in $($sw.ElapsedMilliseconds) ms. Valid drugs found: $valid"
Write-Host "Projected rate: $([Math]::Round($count / ($sw.ElapsedMilliseconds / 1000), 1)) entries/sec"
