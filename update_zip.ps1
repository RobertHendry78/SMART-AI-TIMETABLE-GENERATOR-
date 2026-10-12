$src = "c:\Users\sameer\.gemini\antigravity-ide\scratch\smart-ai-timetable-generator"
$dest1 = "C:\Users\sameer\OneDrive\Desktop\smart-ai-timetable-generator.zip"
$dest2 = "C:\Users\sameer\smart-ai-timetable-generator.zip"
$temp = Join-Path $env:TEMP ("stt_" + [System.Guid]::NewGuid().ToString())

New-Item -ItemType Directory -Path $temp | Out-Null
Copy-Item -Path "$src\*" -Destination $temp -Recurse -Force -Exclude "node_modules", ".git"
Get-ChildItem -Path $temp -Recurse -Include "node_modules", ".git", "dist" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

Compress-Archive -Path "$temp\*" -DestinationPath $dest1 -Force
Copy-Item -Path $dest1 -Destination $dest2 -Force
Remove-Item -Path $temp -Recurse -Force
Write-Host "ZIP updated with Scheduled Periods removed"
