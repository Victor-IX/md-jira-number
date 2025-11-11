# Version Bump Script
# Updates version in both manifest.json and package.json

$manifestPath = Join-Path $PSScriptRoot ".." "manifest.json"
$packagePath = Join-Path $PSScriptRoot ".." "package.json"

# Read current versions
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$package = Get-Content $packagePath -Raw | ConvertFrom-Json

Write-Host "`n🔢 Version Bump Script`n" -ForegroundColor Cyan
Write-Host "Current version: $($manifest.version)`n" -ForegroundColor Yellow

# Calculate suggested versions
$versionParts = $manifest.version -split '\.'
$major = [int]$versionParts[0]
$minor = [int]$versionParts[1]
$patch = [int]$versionParts[2]

$patchVersion = "$major.$minor.$($patch + 1)"
$minorVersion = "$major.$($minor + 1).0"
$majorVersion = "$($major + 1).0.0"

Write-Host "Suggested versions:"
Write-Host "  1) Patch: $patchVersion (bug fixes)" -ForegroundColor Green
Write-Host "  2) Minor: $minorVersion (new features, backward compatible)" -ForegroundColor Green
Write-Host "  3) Major: $majorVersion (breaking changes)" -ForegroundColor Green
Write-Host "  4) Custom version`n"

$choice = Read-Host "Select option (1-4)"

switch ($choice) {
    "1" { $newVersion = $patchVersion }
    "2" { $newVersion = $minorVersion }
    "3" { $newVersion = $majorVersion }
    "4" {
        $newVersion = Read-Host "Enter custom version (e.g., 1.2.3)"
        if ($newVersion -notmatch '^\d+\.\d+\.\d+$') {
            Write-Host "`n❌ Invalid version format. Please use semantic versioning (e.g., 1.2.3)" -ForegroundColor Red
            exit 1
        }
    }
    default {
        Write-Host "`n❌ Invalid option selected" -ForegroundColor Red
        exit 1
    }
}

# Update manifest.json
$manifest.version = $newVersion
$manifestJson = $manifest | ConvertTo-Json -Depth 10
Set-Content -Path $manifestPath -Value $manifestJson -NoNewline
Add-Content -Path $manifestPath -Value "`n"
Write-Host "✅ Updated manifest.json to version $newVersion" -ForegroundColor Green

# Update package.json
$package.version = $newVersion
$packageJson = $package | ConvertTo-Json -Depth 10
Set-Content -Path $packagePath -Value $packageJson -NoNewline
Add-Content -Path $packagePath -Value "`n"
Write-Host "✅ Updated package.json to version $newVersion" -ForegroundColor Green

Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "   git add manifest.json package.json"
Write-Host "   git commit -m `"Bump version to $newVersion`""
Write-Host "   git push origin main"
Write-Host "   git tag v$newVersion"
Write-Host "   git push origin v$newVersion"
Write-Host "`n   Then create a GitHub release at:"
Write-Host "   https://github.com/Victor-IX/md-jira-number/releases`n" -ForegroundColor Blue
