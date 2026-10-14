# edu_bot

Proyecto en construcción.

## Calculadora

Calculadora web sin dependencias. Se abre `index.html` en el navegador (doble clic: no necesita servidor, ni instalación, ni conexión).

- `calculadora.js` — núcleo de evaluación. Parser recursivo propio; **no usa `eval()` ni `Function()`**.
- `index.html` — interfaz, con teclado de mouse y teclado físico.
- `calculadora.test.js` — pruebas del núcleo.

Operaciones soportadas: `+`, `−`, `×`, `÷`, `^`, paréntesis, decimales (`.` o `,`) y cambio de signo `±`.

Atajos de teclado: dígitos y operadores, `Enter` para calcular, `Backspace` para borrar, `Esc` para limpiar.

### Pruebas

Requieren Node.js:

```
node calculadora.test.js
```

### Publicar en GitHub Pages

En el repositorio: **Settings → Pages → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`.

## Scripts incluidos

- `Cambiar proveedor Codex.cmd` / `Cambiar proveedor Codex.ps1` — lanza Codex CLI eligiendo proveedor (OpenAI o DeepSeek).
- `Configurar DeepSeek.cmd` — apunta a `configurar-deepseek.ps1` (archivo que todavía no está en el repo).