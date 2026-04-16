$ErrorActionPreference = 'Stop'

$repoRoot = 'C:\Users\larsh\Desktop\Business\Verisight'
$businessRoot = 'C:\Users\larsh\Desktop\Business'
$notesRoot = Join-Path $businessRoot 'Notes\Backups\Verisight'
$docsExternal = Join-Path $businessRoot 'Docs_External'
$timestamp = Get-Date -Format 'yyyy-MM-dd_HHmmss'
$targetDir = Join-Path $notesRoot $timestamp
$bundlePath = Join-Path $targetDir 'Verisight_repo.bundle'
$manifestPath = Join-Path $targetDir 'repo_manifest.txt'
$docsSnapshotDir = Join-Path $targetDir 'repo_key_docs'
$externalZipPath = Join-Path $targetDir 'Docs_External.zip'

New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
New-Item -ItemType Directory -Force -Path $docsSnapshotDir | Out-Null

$headCommit = git -C $repoRoot rev-parse HEAD
$branch = git -C $repoRoot branch --show-current
$statusShort = git -C $repoRoot status --short

git -C $repoRoot bundle create $bundlePath --all | Out-Null

$keyFiles = @(
    'docs\prompts\PROMPT_CHECKLIST.xlsx',
    'docs\strategy\ROADMAP.md',
    'docs\strategy\STRATEGY.md',
    'docs\ops\CHECKLIST_AUDIT_TRACKER.md',
    'docs\ops\BACKUP_AND_RECOVERY_BASELINE.md'
)

foreach ($relativePath in $keyFiles) {
    $sourcePath = Join-Path $repoRoot $relativePath
    if (Test-Path $sourcePath) {
        $destinationPath = Join-Path $docsSnapshotDir $relativePath
        $destinationParent = Split-Path -Parent $destinationPath
        New-Item -ItemType Directory -Force -Path $destinationParent | Out-Null
        Copy-Item -LiteralPath $sourcePath -Destination $destinationPath -Force
    }
}

if (Test-Path $docsExternal) {
    if (Test-Path $externalZipPath) {
        Remove-Item -LiteralPath $externalZipPath -Force
    }
    Compress-Archive -Path (Join-Path $docsExternal '*') -DestinationPath $externalZipPath -CompressionLevel Optimal
}

$manifest = @(
    "Backup timestamp: $timestamp"
    "Repository root: $repoRoot"
    "Branch: $branch"
    "HEAD commit: $headCommit"
    "Worktree clean at backup time: $([string]::IsNullOrWhiteSpace(($statusShort -join '')))"
    ""
    "Git status --short:"
)

if ($statusShort) {
    $manifest += $statusShort
} else {
    $manifest += '(clean)'
}

$manifest += @(
    ""
    "Included artifacts:"
    "- Verisight_repo.bundle"
    "- repo_key_docs\\"
    "- Docs_External.zip"
    ""
    "Manual remote checklist:"
    "- Confirm Supabase export / backup"
    "- Confirm Railway env / service configuration"
    "- Confirm Vercel production project / deployment context"
    "- Confirm relevant domain and mail configuration if recently changed"
)

Set-Content -Path $manifestPath -Value $manifest -Encoding UTF8

Write-Output "Backup baseline created:"
Write-Output $targetDir
