Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = (Resolve-Path "backend/db/dm_spl_release_human_rx_part1.zip").Path
Write-Host "Opening: $zipPath"
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
Write-Host "Total Zip Entries: $($zip.Entries.Count)"

$count = 0
foreach ($entry in $zip.Entries) {
    if ($count -lt 25) {
        Write-Host "[$count] $($entry.FullName) | Size: $($entry.Length) bytes"
    }
    $count++
}
$zip.Dispose()
Write-Host "Done."
