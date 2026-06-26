$Source = @"
using System;
using System.IO;
using System.Collections.Generic;

public class AppDataScanner {
    public static long GetFolderSize(string path) {
        long size = 0;
        try {
            DirectoryInfo di = new DirectoryInfo(path);
            if ((di.Attributes & FileAttributes.ReparsePoint) == FileAttributes.ReparsePoint) {
                return 0;
            }
            try {
                foreach (FileInfo file in di.EnumerateFiles("*", SearchOption.TopDirectoryOnly)) {
                    size += file.Length;
                }
            } catch {}
            try {
                foreach (DirectoryInfo dir in di.EnumerateDirectories("*", SearchOption.TopDirectoryOnly)) {
                    size += GetFolderSize(dir.FullName);
                }
            } catch {}
        } catch {}
        return size;
    }
}
"@

if (-not ([System.Management.Automation.PSTypeName]'AppDataScanner').Type) {
    Add-Type -TypeDefinition $Source -ErrorAction SilentlyContinue
}

$localPath = "C:\Users\13900K\AppData\Local"
Write-Host "Scanning subfolders in AppData\Local..."
$folders = Get-ChildItem -Path $localPath -Directory -Force -ErrorAction SilentlyContinue
$results = @()
foreach ($f in $folders) {
    $size = [AppDataScanner]::GetFolderSize($f.FullName)
    if ($size -gt 100MB) {
        $results += [PSCustomObject]@{
            Name = $f.Name
            SizeGB = [Math]::Round($size / 1GB, 2)
            SizeBytes = $size
            Path = $f.FullName
        }
    }
}

$results | Sort-Object SizeBytes -Descending | Format-Table -Property Name, SizeGB, Path -AutoSize
