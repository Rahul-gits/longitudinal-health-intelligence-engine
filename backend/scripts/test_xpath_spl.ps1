Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = (Resolve-Path 'backend/db/dm_spl_release_human_rx_part1.zip').Path
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)

$sampleIndices = @(0, 50, 100, 250, 500, 1000, 2500, 5000, 8000, 10000, 12500, 14000)

foreach ($idx in $sampleIndices) {
    if ($idx -lt $zip.Entries.Count) {
        $entry = $zip.Entries[$idx]
        $stream = $entry.Open()
        try {
            $nestedZip = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Read)
            $xmlEntry = $nestedZip.Entries | Where-Object { $_.FullName -like '*.xml' } | Select-Object -First 1
            if ($xmlEntry) {
                $r = New-Object System.IO.StreamReader($xmlEntry.Open())
                [xml]$xml = $r.ReadToEnd()
                $r.Close()
                
                $medNode = $xml.SelectSingleNode("//*[local-name()='manufacturedMedicine']/*[local-name()='name']")
                if (-not $medNode) {
                    $medNode = $xml.SelectSingleNode("//*[local-name()='manufacturedProduct']/*[local-name()='name']")
                }
                $aiNode = $xml.SelectSingleNode("//*[local-name()='activeMoiety']/*[local-name()='name']")
                if (-not $aiNode) {
                    $aiNode = $xml.SelectSingleNode("//*[local-name()='activeIngredient']//*[local-name()='name']")
                }
                $orgNode = $xml.SelectSingleNode("//*[local-name()='representedOrganization']/*[local-name()='name']")

                $medName = if ($medNode) { $medNode.InnerText.Trim() } else { "N/A" }
                $aiName = if ($aiNode) { $aiNode.InnerText.Trim() } else { "N/A" }
                $orgName = if ($orgNode) { $orgNode.InnerText.Trim() } else { "N/A" }

                Write-Host "Index $idx | Med: '$medName' | Active: '$aiName' | Org: '$orgName'"
            }
            $nestedZip.Dispose()
        } catch {
            Write-Host "Index $idx | Error: $_"
        } finally {
            $stream.Dispose()
        }
    }
}

$zip.Dispose()
