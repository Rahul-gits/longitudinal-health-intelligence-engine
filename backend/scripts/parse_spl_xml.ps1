Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = (Resolve-Path "backend/db/dm_spl_release_human_rx_part1.zip").Path
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$entry = $zip.Entries[0]
$stream = $entry.Open()
$nestedZip = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Read)
$xmlEntry = $nestedZip.Entries | Where-Object { $_.FullName -like "*.xml" } | Select-Object -First 1
$r = New-Object System.IO.StreamReader($xmlEntry.Open())
[xml]$xml = $r.ReadToEnd()
$r.Close()
$nestedZip.Dispose()
$stream.Dispose()
$zip.Dispose()

Write-Host "Title: $($xml.document.title)"
Write-Host "Document Code: $($xml.document.code.displayName)"
$sections = $xml.SelectNodes("//*[local-name()='section']")
Write-Host "Total sections: $($sections.Count)"
foreach ($sec in $sections) {
    $secTitle = $sec.title
    $secCode = $sec.code.code
    $secDisplayName = $sec.code.displayName
    if ($secTitle) {
        Write-Host "  -> Section: '$secTitle' | Code: $secCode ($secDisplayName)"
    }
}
