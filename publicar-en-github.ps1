# publicar-en-github.ps1
#
# Publica este proyecto en https://github.com/gabriel02027/calculadora_test
# creando DOS commits:
#   1) "Calculadora lista: núcleo con parser propio, interfaz y pruebas"
#   2) "hola este es el segundo commit"   <- incluye una mejora pequeña del parser
#
# Uso: clic derecho > "Ejecutar con PowerShell", o desde la terminal:
#   powershell -ExecutionPolicy Bypass -File .\publicar-en-github.ps1

Set-Location -LiteralPath $PSScriptRoot

$url = 'https://github.com/gabriel02027/calculadora_test.git'
$rama = 'main'

# >>> BLOQUE-JS-INICIO
$viejoJs = '      var valor = Number(origen.slice(inicio, pos));'
$bloqueJs = @(
  '      // Exponente: deja reutilizar un resultado como 1e13',
  "      if (origen.charAt(pos) === 'e' || origen.charAt(pos) === 'E') {",
  '        var marca = pos;',
  '        pos += 1;',
  "        if (origen.charAt(pos) === '+' || origen.charAt(pos) === '-') {",
  '          pos += 1;',
  '        }',
  '        var inicioExponente = pos;',
  "        while (pos < origen.length && origen.charAt(pos) >= '0' && origen.charAt(pos) <= '9') {",
  '          pos += 1;',
  '        }',
  '        if (pos === inicioExponente) {',
  '          pos = marca;',
  '        }',
  '      }',
  '      var valor = Number(origen.slice(inicio, pos));'
) -join "`n"
# >>> BLOQUE-JS-FIN

# >>> BLOQUE-TEST-INICIO
$viejoTest = "console.log('Formato del resultado');"
$bloqueTest = @(
  "console.log('Notación científica');",
  "prueba('1e3 = 1000', da('1e3', 1000));",
  "prueba('1.5e2 = 150', da('1.5e2', 150));",
  "prueba('1e-3 = 0.001', da('1e-3', 0.001));",
  "prueba('un resultado se puede volver a escribir', da('1.000000e13', 1e13));",
  '',
  "console.log('Formato del resultado');"
) -join "`n"
# >>> BLOQUE-TEST-FIN

Write-Host '== 1/7  Identidad de los commits =='
git config user.name 'gabriel02027'
git config user.email 'gabxmorqles7807@gmail.com'
Write-Host ('   ' + (git config --get user.name) + ' <' + (git config --get user.email) + '>')

Write-Host '== 2/7  Limpieza del archivo de prueba =='
$sobrante = Join-Path $PSScriptRoot 'probe-raiz.txt'
if (Test-Path -LiteralPath $sobrante) {
  try {
    Remove-Item -LiteralPath $sobrante -Force -ErrorAction Stop
    Write-Host '   Eliminado probe-raiz.txt'
  } catch {
    Write-Host '   No se pudo eliminar probe-raiz.txt. Borralo a mano; no afecta al resto.'
  }
} else {
  Write-Host '   Nada que limpiar.'
}

Write-Host '== 3/7  Repositorio local =='
if (Test-Path -LiteralPath (Join-Path $PSScriptRoot '.git')) {
  Write-Host '   Ya existe .git'
} else {
  git init -b $rama
}

Write-Host '== 4/7  Primero commit =='
git rev-parse --verify --quiet HEAD | Out-Null
if ($LASTEXITCODE -eq 0) {
  Write-Host '   El repositorio ya tiene commits: no se repite el primero.'
} else {
  git add -A
  git commit -m 'Calculadora lista: núcleo con parser propio, interfaz y pruebas'
}

Write-Host '== 5/7  Cambio pequeño en el código =='
$marcas = @(
  @{ archivo = 'calculadora.js';      viejo = $viejoJs;   bloque = $bloqueJs;   yaAplicado = 'Exponente: deja reutilizar' },
  @{ archivo = 'calculadora.test.js'; viejo = $viejoTest; bloque = $bloqueTest; yaAplicado = 'Notación científica' }
)

foreach ($item in $marcas) {
  $ruta = Join-Path $PSScriptRoot $item.archivo
  $contenido = Get-Content -LiteralPath $ruta -Raw -Encoding UTF8
  if ($contenido.Contains($item.yaAplicado)) {
    Write-Host ('   ' + $item.archivo + ': el cambio ya estaba aplicado.')
    continue
  }
  $ocurrencias = ([regex]::Matches($contenido, [regex]::Escape($item.viejo))).Count
  if ($ocurrencias -ne 1) {
    Write-Host ('   ' + $item.archivo + ': no se encontró el punto exacto; se omite.')
    continue
  }
  $salto = if ($contenido.Contains("`r`n")) { "`r`n" } else { "`n" }
  $bloque = ($item.bloque -split "`r?`n") -join $salto
  $nuevo = $contenido.Replace($item.viejo, $bloque)
  [System.IO.File]::WriteAllText($ruta, $nuevo, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host ('   ' + $item.archivo + ': modificado.')
}

Write-Host '== 6/7  Segundo commit =='
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host '   No hay cambios nuevos que registrar.'
} else {
  git commit -m 'hola este es el segundo commit'
}

Write-Host '== 7/7  Remoto y subida =='
git remote remove origin 2>$null
git remote add origin $url
git remote -v
git ls-remote --exit-code --heads origin $rama 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) {
  Write-Host '   El remoto ya tiene contenido en esa rama: se integra antes de subir.'
  git pull --no-edit --no-rebase --allow-unrelated-histories origin $rama
} else {
  Write-Host '   El remoto está vacío: la subida será directa.'
}
git push -u origin $rama

Write-Host ''
Write-Host 'Estado final:'
git log --oneline -n 5
git status --short --branch