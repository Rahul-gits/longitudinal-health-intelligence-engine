Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = (Resolve-Path "backend/db/dm_spl_release_human_rx_part1.zip").Path
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
Write-Host "Total items in SPL archive: $($zip.Entries.Count)"

# Let's inspect 10 samples spread across the dataset
$sampleIndices = @(0, 100, 500, 1000, 2500, 5000, 7500, 10000, 12500, 14000)

foreach ($idx in $sampleIndices) {
    if ($idx -lt $zip.Entries.Count) {
        $entry = $zip.Entries[$idx]
        $stream = $entry.Open()
        $nestedZip = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Read)
        $xmlEntry = $nestedZip.Entries | Where-Object { $_.FullName -like "*.xml" } | Select-Object -First 1
        if ($xmlEntry) {
            $r = New-Object System.IO.StreamReader($xmlEntry.Open())
            $xmlText = $r.ReadToEnd()
            $r.Close()
            
            # Simple regex extraction for drug name / title
            $title = ""
            if ($xmlText -match "<title>(.*?)</title>") {
                $title = $matches[1] -replace "<[^>]+>", " "
            }
            Write-Host "Sample [$idx]: $($entry.FullName) | Title: $title"
        }
        $nestedZip.Dispose()
        $stream.Dispose()
    }
}

$zip.Dispose()
