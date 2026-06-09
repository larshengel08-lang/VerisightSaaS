param(
    [string]$RepoRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

Set-Location $RepoRoot

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "=== $Title ===" -ForegroundColor Cyan
}

function Get-StatusBucket {
    git status --porcelain | ForEach-Object {
        if ($_ -match '^\?\?') {
            'untracked'
        } elseif ($_ -match '^ D|^D ') {
            'deleted'
        } else {
            'modified'
        }
    }
}

Write-Section "Repo"
Write-Host "Path: $RepoRoot"
Write-Host "Remote: $(git remote get-url origin)"
Write-Host "Head: $(git rev-parse --short HEAD)"
Write-Host "Branch: $(git branch --show-current)"

Write-Section "Branch Status"
git status --short --branch

Write-Section "Status Counts"
$statusBuckets = Get-StatusBucket | Group-Object | Sort-Object Name
foreach ($group in $statusBuckets) {
    Write-Host ("{0}: {1}" -f $group.Name, $group.Count)
}

Write-Section "Worktrees and Branches"
$worktreeCount = (git worktree list).Count
$branchCount = (git branch --format='%(refname:short)').Count
Write-Host "worktrees: $worktreeCount"
Write-Host "branches: $branchCount"

Write-Section "Local Branches Without Upstream"
$noUpstream = @()
git for-each-ref --format='%(refname:short)|%(upstream:short)' refs/heads | ForEach-Object {
    $parts = $_ -split '\|', 2
    if ([string]::IsNullOrWhiteSpace($parts[1])) {
        $noUpstream += $parts[0]
    }
}
Write-Host "count: $($noUpstream.Count)"
$noUpstream | Select-Object -First 25

Write-Section "Ahead Branches"
$aheadBranches = @()
git for-each-ref --format='%(refname:short)|%(upstream:track)' refs/heads | ForEach-Object {
    $parts = $_ -split '\|', 2
    if ($parts[1] -match 'ahead') {
        $aheadBranches += ("{0} {1}" -f $parts[0], $parts[1])
    }
}
Write-Host "count: $($aheadBranches.Count)"
$aheadBranches | Select-Object -First 25

Write-Section "Untracked Hotspots"
$untracked = git ls-files --others --exclude-standard
$patterns = [ordered]@{
    '.tmp/'                = 0
    'frontend/tmp/'        = 0
    'tmp/'                 = 0
    '.acceptance-runtime/' = 0
    'docs/'                = 0
    'frontend/docs/'       = 0
    '.png'                 = 0
    'env_like'             = 0
}

foreach ($file in $untracked) {
    if ($file.StartsWith('.tmp/')) { $patterns['.tmp/']++ }
    if ($file.StartsWith('frontend/tmp/')) { $patterns['frontend/tmp/']++ }
    if ($file.StartsWith('tmp/')) { $patterns['tmp/']++ }
    if ($file.StartsWith('.acceptance-runtime/')) { $patterns['.acceptance-runtime/']++ }
    if ($file.StartsWith('docs/')) { $patterns['docs/']++ }
    if ($file.StartsWith('frontend/docs/')) { $patterns['frontend/docs/']++ }
    if ($file -match '\.png$') { $patterns['.png']++ }
    if ($file -match '\.env|project\.json|\.vercel|\.temp') { $patterns['env_like']++ }
}

$patterns.GetEnumerator() | ForEach-Object {
    Write-Host ("{0}: {1}" -f $_.Key, $_.Value)
}

Write-Section "Sensitive or Deployment-Like Paths Not Ignored"
$suspiciousPaths = @(
    'frontend/.env.vercel.production',
    'frontend/.env.production.inspect',
    '.acceptance-runtime/guided-self-serve.json',
    'supabase/.temp/cli-latest'
)

foreach ($path in $suspiciousPaths) {
    if (Test-Path $path) {
        git check-ignore -v -- $path 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "IGNORED  $path"
        } else {
            Write-Host "NOT IGNORED  $path" -ForegroundColor Yellow
        }
    }
}

Write-Section "Suggested First Actions"
Write-Host "1. Label current untracked files as keep / ignore / move."
Write-Host "2. Review branches without upstream and ahead branches."
Write-Host "3. Tighten .gitignore for tmp/review/runtime output."
Write-Host "4. Prune stale worktrees only after branch ownership review."
