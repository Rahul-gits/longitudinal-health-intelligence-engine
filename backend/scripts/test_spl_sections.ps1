Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = (Resolve-Path 'backend/db/dm_spl_release_human_rx_part1.zip').Path
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)

$sampleIndices = @(0, 100, 12500)

foreach ($idx in $sampleIndices) {
    $entry = $zip.Entries[$idx]
    $stream = $entry.Open()
    $nestedZip = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Read)
    $xmlEntry = $nestedZip.Entries | Where-Object { $_.FullName -like '*.xml' } | Select-Object -First 1
    $r = New-Object System.IO.StreamReader($xmlEntry.Open())
    [xml]$xml = $r.ReadToEnd()
    $r.Close()

    $medNode = $xml.SelectSingleNode("//*[local-name()='manufacturedMedicine']/*[local-name()='name']")
    $medName = if ($medNode) { $medNode.InnerText.Trim() } else { "Drug" }

    Write-Host "=========================================="
    Write-Host "DRUG: $medName (Index $idx)"
    
    # Contraindications
    $ci = $xml.SelectSingleNode("//*[local-name()='section'][*[local-name()='code'][@code='34070-3']]")
    if ($ci) {
        $ciText = ($ci.text.InnerText -replace '\s+', ' ').Trim()
        Write-Host "[CONTRAINDICATIONS]: $($ciText.Substring(0, [Math]::Min(200, $ciText.Length)))..."
    }

    # Drug Interactions
    $di = $xml.SelectSingleNode("//*[local-name()='section'][*[local-name()='code'][@code='34073-7']]")
    if ($di) {
        $diText = ($di.text.InnerText -replace '\s+', ' ').Trim()
        Write-Host "[DRUG INTERACTIONS]: $($diText.Substring(0, [Math]::Min(200, $diText.Length)))..."
    }

    # Warnings / Boxed
    $warn = $xml.SelectSingleNode("//*[local-name()='section'][*[local-name()='code'][@code='34071-1' or @code='34066-1']]")
    if ($warn) {
        $warnText = ($warn.text.InnerText -replace '\s+', ' ').Trim()
        Write-Host "[WARNINGS]: $($warnText.Substring(0, [Math]::Min(200, $warnText.Length)))..."
    }

    $nestedZip.Dispose()
    $stream.Dispose()
}

$zip.Dispose()
