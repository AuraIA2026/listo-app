$userPath = "C:\Users\13900K"
Write-Host "Scanning top-level folders in $userPath..."

$folders = Get-ChildItem -Path $userPath -Directory -Force -ErrorAction SilentlyContinue

$results = @()
foreach ($f in $folders) {
    Write-Host "Measuring $f..."
    # Measure size using Robocopy which is much faster than Get-ChildItem -Recurse
    # Robocopy /L /S /NJH /NJS /NP /NDL /NC /NS
    $roboOut = robocopy $f.FullName NULL /L /S /NJH /NJS /NP /NDL /NC /NS /NFL /R:0 /W:0 /XJD /XJF
    $sizeInBytes = 0
    if ($LASTEXITCODE -ge 0) {
        # Robocopy output contains the total size at the end. We can parse it.
        # But actually we can parse it or get it. Let's write a helper to parse robocopy size.
    }
    
    # Alternatively, use standard .NET folder measurement which is fast:
    $size = 0
    try {
        $dirInfo = New-Object System.IO.DirectoryInfo($f.FullName)
        $files = $dirInfo.EnumerateFiles("*", [System.IO.SearchOption]::AllDirectories)
        foreach ($file in $files) {
            $size += $file.Length
        }
    } catch {
        # Fallback to Get-ChildItem
        $size = (Get-ChildItem -Path $f.FullName -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
    }
    
    if ($size -eq $null) { $size = 0 }
    
    $results += [PSCustomObject]@{
        Name = $f.Name
        Path = $f.FullName
        SizeGB = [Math]::Round($size / 1GB, 2)
        SizeBytes = $size
    }
}

Write-Host "`n--- Folder sizes in C:\Users\13900K ---"
$results | Sort-Object SizeBytes -Descending | Format-Table -AutoSize

# Let's inspect AppData specifically if it's large
$appDataPath = "C:\Users\13900K\AppData"
if (Test-Path $appDataPath) {
    Write-Host "`nScanning AppData subfolders..."
    $adFolders = Get-ChildItem -Path $appDataPath -Directory -Force -ErrorAction SilentlyContinue
    $adResults = @()
    foreach ($f in $adFolders) {
        Write-Host "Measuring AppData\$($f.Name)..."
        $size = 0
        try {
            $dirInfo = New-Object System.IO.DirectoryInfo($f.FullName)
            $files = $dirInfo.EnumerateFiles("*", [System.IO.SearchOption]::AllDirectories)
            foreach ($file in $files) {
                $size += $file.Length
            }
        } catch {
            $size = (Get-ChildItem -Path $f.FullName -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
        }
        if ($size -eq $null) { $size = 0 }
        $adResults += [PSCustomObject]@{
            Name = $f.Name
            Path = $f.FullName
            SizeGB = [Math]::Round($size / 1GB, 2)
            SizeBytes = $size
        }
    }
    Write-Host "--- AppData Subfolders ---"
    $adResults | Sort-Object SizeBytes -Descending | Format-Table -AutoSize
    
    # Scan AppData\Local subfolders
    $localPath = "C:\Users\13900K\AppData\Local"
    if (Test-Path $localPath) {
        Write-Host "`nScanning AppData\Local subfolders..."
        $localFolders = Get-ChildItem -Path $localPath -Directory -Force -ErrorAction SilentlyContinue
        $localResults = @()
        foreach ($f in $localFolders) {
            $size = 0
            try {
                $dirInfo = New-Object System.IO.DirectoryInfo($f.FullName)
                $files = $dirInfo.EnumerateFiles("*", [System.IO.SearchOption]::AllDirectories)
                foreach ($file in $files) {
                    $size += $file.Length
                }
            } catch {
                $size = (Get-ChildItem -Path $f.FullName -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
            }
            if ($size -eq $null) { $size = 0 }
            if ($size -gt 100MB) {
                $localResults += [PSCustomObject]@{
                    Name = $f.Name
                    Path = $f.FullName
                    SizeGB = [Math]::Round($size / 1GB, 2)
                    SizeBytes = $size
                }
            }
        }
        Write-Host "--- AppData\Local Subfolders (>100MB) ---"
        $localResults | Sort-Object SizeBytes -Descending | Format-Table -AutoSize
    }
}

# Find top files larger than 200MB in C:\Users\13900K
Write-Host "`nScanning for files larger than 200MB in $userPath..."
$largeFiles = @()
try {
    $dirInfo = New-Object System.IO.DirectoryInfo($userPath)
    $files = $dirInfo.EnumerateFiles("*", [System.IO.SearchOption]::AllDirectories)
    foreach ($file in $files) {
        if ($file.Length -gt 200MB) {
            $largeFiles += [PSCustomObject]@{
                Name = $file.Name
                Path = $file.FullName
                SizeGB = [Math]::Round($file.Length / 1GB, 3)
                SizeBytes = $file.Length
            }
        }
    }
} catch {
    Write-Host "EnumerateFiles failed, running Get-ChildItem fallback..."
    $largeFiles = Get-ChildItem -Path $userPath -Recurse -File -Force -ErrorAction SilentlyContinue |
        Where-Object { $_.Length -gt 200MB } |
        Select-Object Name, FullName, @{Name="SizeGB"; Expression={[Math]::Round($_.Length / 1GB, 3)}}, @{Name="SizeBytes"; Expression={$_.Length}}
}

Write-Host "--- Files > 200MB ---"
$largeFiles | Sort-Object SizeBytes -Descending | Select-Object -First 30 | Format-Table -AutoSize
