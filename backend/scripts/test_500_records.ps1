Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = (Resolve-Path "backend/db/dm_spl_release_human_rx_part1.zip").Path
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)

$sw = [System.Diagnostics.Stopwatch]::StartNew()
$count = 0
$extracted = 0

for ($i = 0; $i -lt 500; $i++) {
    $entry = $zip.Entries[$i]
    $stream = $entry.Open()
    try {
        $nestedZip = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Read)
        $xmlEntry = $nestedZip.Entries | Where-Object { $_.FullName.EndsWith(".xml") } | Select-Object -First 1
        if ($xmlEntry) {
            $r = New-Object System.IO.StreamReader($xmlEntry.Open())
            $text = $r.ReadToEnd()
            $r.Close()

            $medName = ""
            if ($text -match '<manufacturedMedicine>[\s\S]*?<name>([^<]+)</name>') {
                $medName = $matches[1].Trim()
            } elseif ($text -match '<manufacturedProduct>[\s\S]*?<name>([^<]+)</name>') {
                $medName = $matches[1].Trim()
            }

            $aiName = ""
            if ($text -match '<activeMoiety>[\s\S]*?<name>([^<]+)</name>') {
                $aiName = $matches[1].Trim()
            } elseif ($text -match '<activeIngredient>[\s\S]*?<name>([^<]+)</name>') {
                $aiName = $matches[1].Trim()
            }

            # Fast section extraction with regex
            $ci = ""
            if ($text -match '<code\s+code="34070-3"[\s\S]*?<text>([\s\S]*?)</text>') {
                $ci = ($matches[1] -replace '<[^>]+>', ' ' -replace '\s+', ' ').Trim()
            }

            $warn = ""
            if ($text -match '<code\s+code="(34071-1|34066-1|42232-9)"[\s\S]*?<text>([\s\S]*?)</text>') {
                $warn = ($matches[2] -replace '<[^>]+>', ' ' -replace '\s+', ' ').Trim()
            }

            if ($medName -and $medName -notlike "*OXYGEN*" -and ($ci -or $warn)) {
                $extracted++
            }
        }
        $nestedZip.Dispose()
    } catch {} finally {
        $stream.Dispose()
    }
    $count++
}

$sw.Stop()
$zip.Dispose()

Write-Host "Scanned $count packages in $($sw.ElapsedMilliseconds) ms."
Write-Host "High-value drug labels extracted: $extracted"
Write-Host "Rate: $([Math]::Round($count / ($sw.ElapsedMilliseconds / 1000), 1)) pkgs/sec"
