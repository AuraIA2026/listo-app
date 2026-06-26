$Source = @"
using System;
using System.IO;
using System.Collections.Generic;

public class DiskScannerV3 {
    public struct FileInfoData {
        public string Name;
        public string Path;
        public long Length;
    }

    public Dictionary<string, long> FolderSizes = new Dictionary<string, long>(StringComparer.OrdinalIgnoreCase);
    public List<FileInfoData> LargeFiles = new List<FileInfoData>();
    public long MinLargeFileSize = 314572800; // 300MB

    public long Scan(string path, int depth = 0) {
        long size = 0;
        try {
            DirectoryInfo di = new DirectoryInfo(path);
            if ((di.Attributes & FileAttributes.ReparsePoint) == FileAttributes.ReparsePoint) {
                return 0;
            }

            if (depth == 1) {
                Console.WriteLine("Scanning: " + path + "...");
            }

            // Sum files in this directory
            try {
                foreach (FileInfo file in di.EnumerateFiles("*", SearchOption.TopDirectoryOnly)) {
                    size += file.Length;
                    if (file.Length >= MinLargeFileSize) {
                        LargeFiles.Add(new FileInfoData { Name = file.Name, Path = file.FullName, Length = file.Length });
                    }
                }
            } catch {}

            // Recurse subdirectories
            try {
                foreach (DirectoryInfo dir in di.EnumerateDirectories("*", SearchOption.TopDirectoryOnly)) {
                    size += Scan(dir.FullName, depth + 1);
                }
            } catch {}

            FolderSizes[path] = size;
        } catch {}
        return size;
    }

    public long GetSize(string path) {
        long size;
        if (FolderSizes.TryGetValue(path, out size)) {
            return size;
        }
        return 0;
    }
}
"@

# Compile the helper class (without silencing errors to catch compilation issues)
Add-Type -TypeDefinition $Source

Write-Host "Starting single-pass C:\ drive analysis. This scans everything once and caches sizes..."
$scanner = New-Object DiskScannerV3
$null = $scanner.Scan("C:\", 0)

Write-Host "`n=== TOP LEVEL OF C:\ ==="
$cFolders = Get-ChildItem -Path "C:\" -Force -ErrorAction SilentlyContinue
$results = @()

# Root Files
$rootFilesSize = 0
try {
    $di = New-Object System.IO.DirectoryInfo("C:\")
    foreach ($file in $di.EnumerateFiles("*", [System.IO.SearchOption]::TopDirectoryOnly)) {
        $rootFilesSize += $file.Length
    }
} catch {}

if ($rootFilesSize -gt 0) {
    $results += [PSCustomObject]@{
        Name = "[Root Files] (sys/temp files)"
        SizeGB = [Math]::Round($rootFilesSize / 1GB, 2)
        SizeBytes = $rootFilesSize
        Path = "C:\"
    }
}

foreach ($item in $cFolders) {
    if ($item.PSIsContainer) {
        $size = $scanner.GetSize($item.FullName)
        $results += [PSCustomObject]@{
            Name = $item.Name
            SizeGB = [Math]::Round($size / 1GB, 2)
            SizeBytes = $size
            Path = $item.FullName
        }
    }
}
$results | Sort-Object SizeBytes -Descending | Format-Table -Property Name, SizeGB, Path -AutoSize

# Users Folder Scan
$usersPath = "C:\Users"
if (Test-Path $usersPath) {
    Write-Host "`n=== C:\Users FOLDER SIZES ==="
    $userFolders = Get-ChildItem -Path $usersPath -Directory -Force -ErrorAction SilentlyContinue
    $userResults = @()
    foreach ($uf in $userFolders) {
        $size = $scanner.GetSize($uf.FullName)
        $userResults += [PSCustomObject]@{
            Name = $uf.Name
            SizeGB = [Math]::Round($size / 1GB, 2)
            SizeBytes = $size
            Path = $uf.FullName
        }
    }
    $userResults | Sort-Object SizeBytes -Descending | Format-Table -Property Name, SizeGB, Path -AutoSize
}

# User 13900K Scan
$userHome = "C:\Users\13900K"
if (Test-Path $userHome) {
    Write-Host "`n=== C:\Users\13900K SUBFOLDER SIZES ==="
    $subfolders = Get-ChildItem -Path $userHome -Directory -Force -ErrorAction SilentlyContinue
    $subResults = @()
    foreach ($sf in $subfolders) {
        $size = $scanner.GetSize($sf.FullName)
        $subResults += [PSCustomObject]@{
            Name = $sf.Name
            SizeGB = [Math]::Round($size / 1GB, 2)
            SizeBytes = $size
            Path = $sf.FullName
        }
    }
    $subResults | Sort-Object SizeBytes -Descending | Format-Table -Property Name, SizeGB, Path -AutoSize

    # AppData Scan
    $appData = "$userHome\AppData"
    if (Test-Path $appData) {
        Write-Host "`n=== AppData FOLDER SIZES ==="
        $adFolders = Get-ChildItem -Path $appData -Directory -Force -ErrorAction SilentlyContinue
        $adResults = @()
        foreach ($af in $adFolders) {
            $size = $scanner.GetSize($af.FullName)
            $adResults += [PSCustomObject]@{
                Name = $af.Name
                SizeGB = [Math]::Round($size / 1GB, 2)
                SizeBytes = $size
                Path = $af.FullName
            }
        }
        $adResults | Sort-Object SizeBytes -Descending | Format-Table -Property Name, SizeGB, Path -AutoSize
    }

    # Individual large files
    Write-Host "`n=== INDIVIDUAL FILES > 300MB IN $userHome ==="
    $lfResults = @()
    foreach ($lf in $scanner.LargeFiles) {
        $lfResults += [PSCustomObject]@{
            Name = $lf.Name
            SizeGB = [Math]::Round($lf.Length / 1GB, 3)
            SizeBytes = $lf.Length
            Path = $lf.Path
        }
    }
    $lfResults | Sort-Object SizeBytes -Descending | Select-Object -First 30 | Format-Table -Property Name, SizeGB, Path -AutoSize
}
