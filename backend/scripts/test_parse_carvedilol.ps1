Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = (Resolve-Path "backend/db/dm_spl_release_human_rx_part1.zip").Path
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)

# Carvedilol is at index 12500
$entry = $zip.Entries[12500]
Write-Host "Parsing: $($entry.FullName)"
$stream = $entry.Open()
$nestedZip = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Read)
$xmlEntry = $nestedZip.Entries | Where-Object { $_.FullName -like "*.xml" } | Select-Object -First 1

$r = New-Object System.IO.StreamReader($xmlEntry.Open())
[xml]$xml = $r.ReadToEnd()
$r.Close()

# Extract manufactured medicine / active ingredient
$medicineName = $xml.SelectSingleNode("//*[local-name()='manufacturedMedicine']/*[local-name()='name']")
if ($medicineName) {
    Write-Host "Medicine Name: $($medicineName.InnerText)"
}

$activeIngredients = $xml.SelectNodes("//*[local-name()='activeIngredient']//*[local-name()='name']")
foreach ($ai in $activeIngredients) {
    Write-Host "Active Ingredient: $($ai.InnerText)"
}

# Look for specific LOINC sections
$sections = $xml.SelectNodes("//*[local-name()='section']")
foreach ($s in $sections) {
    $code = $s.code.code
    $title = $s.title
    if ($title -is [System.Xml.XmlElement]) { $title = $title.InnerText }
    $titleStr = "$title".Trim()
    
    if ($code -in @("34067-9", "34070-3", "34071-1", "34073-7", "34066-1", "42232-9")) {
        $text = $s.text.InnerText
        if ($text.Length -gt 250) { $text = $text.Substring(0, 250) + "..." }
        Write-Host "`n[Section $code]: $titleStr"
        Write-Host "Snippet: $text"
    }
}

$nestedZip.Dispose()
$stream.Dispose()
$zip.Dispose()
