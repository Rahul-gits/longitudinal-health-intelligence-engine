Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = (Resolve-Path "backend/db/dm_spl_release_human_rx_part1.zip").Path
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$firstEntry = $zip.Entries[0]
Write-Host "Opening nested entry: $($firstEntry.FullName)"

$stream = $firstEntry.Open()
$nestedZip = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Read)
Write-Host "Nested entries count: $($nestedZip.Entries.Count)"
foreach ($n in $nestedZip.Entries) {
    Write-Host "  Nested: $($n.FullName) | $($n.Length) bytes"
    if ($n.FullName -like "*.xml") {
        $r = New-Object System.IO.StreamReader($n.Open())
        $xmlContent = $r.ReadToEnd()
        $r.Close()
        Write-Host "  XML Length: $($xmlContent.Length)"
        Write-Host "  Preview: $($xmlContent.Substring(0, [Math]::Min(500, $xmlContent.Length)))"
    }
}
$nestedZip.Dispose()
$stream.Dispose()
$zip.Dispose()
