$targetPath = "C:\"
Write-Host "Scanning top-level folders in $targetPath..."
$folders = Get-ChildItem -Path $targetPath -Force -ErrorAction SilentlyContinue

$results = @()

# Measure root files first
$rootFilesSize = (Get-ChildItem -Path $targetPath -File -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
if ($rootFilesSize -gt 0) {
    $results += [PSCustomObject]@{
        Name = "[Root Files] (pagefile.sys, hiberfil.sys, etc.)"
        Path = $targetPath
        SizeGB = [Math]::Round($rootFilesSize / 1GB, 2)
        SizeBytes = $rootFilesSize
    }
}

foreach ($item in $folders) {
    if ($item.PSIsContainer) {
        # Skip certain system folders that might hang or deny access to speed up and prevent errors
        if ($item.Name -eq "System Volume Information" -or $item.Name -eq '$Recycle.Bin') {
            # Recycler can be measured separately, but let's do it quickly
            $size = (Get-ChildItem -Path $item.FullName -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
            if ($size -eq $null) { $size = 0 }
            $results += [PSCustomObject]@{
                Name = $item.Name
                Path = $item.FullName
                SizeGB = [Math]::Round($size / 1GB, 2)
                SizeBytes = $size
            }
            continue
        }
        
        Write-Host "Measuring folder: $($item.FullName)..."
        $size = (Get-ChildItem -Path $item.FullName -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
        if ($size -eq $null) { $size = 0 }
        $results += [PSCustomObject]@{
            Name = $item.Name
            Path = $item.FullName
            SizeGB = [Math]::Round($size / 1GB, 2)
            SizeBytes = $size
        }
    }
}

Write-Host "`n--- Top Level of C:\ ---"
$results | Sort-Object SizeBytes -Descending | Format-Table -AutoSize

# Now let's list largest folders in C:\Users
$usersPath = "C:\Users"
if (Test-Path $usersPath) {
    Write-Host "`nScanning C:\Users folders..."
    $userFolders = Get-ChildItem -Path $usersPath -Directory -Force -ErrorAction SilentlyContinue
    $userResults = @()
    foreach ($uf in $userFolders) {
        Write-Host "Measuring user folder: $($uf.FullName)..."
        $size = (Get-ChildItem -Path $uf.FullName -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
        if ($size -eq $null) { $size = 0 }
        $userResults += [PSCustomObject]@{
            Name = $uf.Name
            Path = $uf.FullName
            SizeGB = [Math]::Round($size / 1GB, 2)
            SizeBytes = $size
        }
    }
    Write-Host "--- C:\Users Folder Sizes ---"
    $userResults | Sort-Object SizeBytes -Descending | Format-Table -AutoSize
}

# Now scan under C:\Users\13900K
$userHome = "C:\Users\13900K"
if (Test-Path $userHome) {
    Write-Host "`nScanning C:\Users\13900K subfolders..."
    $subfolders = Get-ChildItem -Path $userHome -Directory -Force -ErrorAction SilentlyContinue
    $subResults = @()
    foreach ($sf in $subfolders) {
        Write-Host "Measuring C:\Users\13900K\$($sf.Name)..."
        $size = (Get-ChildItem -Path $sf.FullName -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
        if ($size -eq $null) { $size = 0 }
        $subResults += [PSCustomObject]@{
            Name = $sf.Name
            Path = $sf.FullName
            SizeGB = [Math]::Round($size / 1GB, 2)
            SizeBytes = $size
        }
    }
    Write-Host "--- C:\Users\13900K Subfolder Sizes ---"
    $subResults | Sort-Object SizeBytes -Descending | Format-Table -AutoSize
}
