$Source = @"
using System;
using System.IO;
using System.Collections.Generic;

public class DiskScanner {
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

Add-Type -TypeDefinition $Source
Write-Host "Success"
