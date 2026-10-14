$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$codex = Get-Command codex.exe -ErrorAction SilentlyContinue
if (-not $codex) {
$codex = Get-ChildItem -Path (Join-Path $env:USERPROFILE 'AppData\Local\OpenAI\Codex\bin\*\codex.exe') -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
}
if (-not $codex) { Write-Error 'Codex CLI was not found in PATH or the standard installation folder.'; exit 1 }
$codexPath = if ($codex.Source) { $codex.Source } else { $codex.FullName }
Write-Host 'Select the Codex provider for this session:'
Write-Host '  1. OpenAI'
Write-Host '  2. DeepSeek (restore)'
$choice = Read-Host 'Choose 1 or 2'
switch ($choice) {
  '1' { $provider = 'openai'; $model = 'gpt-6-luna' }
  '2' { $provider = 'deepseek'; $model = 'deepseek-flash' }
  default { Write-Host 'Invalid choice. No changes were made.'; exit 2 }
}
Write-Host ('Starting Codex with {0} / {1}...' -f $provider, $model)
& $codexPath -c ('model_provider="{0}"' -f $provider) -c ('model="{0}"' -f $model)
exit $LASTEXITCODE


