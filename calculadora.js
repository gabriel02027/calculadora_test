/*
 * Calculadora - nucleo de evaluacion.
 * Parser recursivo propio: no usa eval() ni Function().
 */
(function (raiz, fabrica) {
  var api = fabrica();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    raiz.Calculadora = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function normalizar(entrada) {
    return String(entrada == null ? '' : entrada)
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/,/g, '.')
      .replace(/\s+/g, '');
  }

  function calcular(entrada) {
    var origen = normalizar(entrada);
    var pos = 0;

    if (origen === '') {
      throw new Error('expresión vacía');
    }

    function fallo(mensaje) {
      throw new Error(mensaje);
    }

    function asoma(caracter) {
      return origen.charAt(pos) === caracter;
    }

    function leerNumero() {
      var inicio = pos;
      var yaTienePunto = false;
      while (pos < origen.length) {
        var caracter = origen.charAt(pos);
        if (caracter >= '0' && caracter <= '9') {
          pos += 1;
        } else if (caracter === '.' && !yaTienePunto) {
          yaTienePunto = true;
          pos += 1;
        } else {
          break;
        }
      }
      if (pos === inicio) {
        fallo('se esperaba un número');
      }
      // Exponente: deja reutilizar un resultado como 1e13
      if (origen.charAt(pos) === 'e' || origen.charAt(pos) === 'E') {
        var marca = pos;
        pos += 1;
        if (origen.charAt(pos) === '+' || origen.charAt(pos) === '-') {
          pos += 1;
        }
        var inicioExponente = pos;
        while (pos < origen.length && origen.charAt(pos) >= '0' && origen.charAt(pos) <= '9') {
          pos += 1;
        }
        if (pos === inicioExponente) {
          pos = marca;
        }
      }
      var valor = Number(origen.slice(inicio, pos));
      if (!isFinite(valor)) {
        fallo('número inválido');
      }
      return valor;
    }

    function leerPrimario() {
      if (asoma('(')) {
        pos += 1;
        var interno = leerSuma();
        if (!asoma(')')) {
          fallo('falta cerrar el paréntesis');
        }
        pos += 1;
        return interno;
      }
      return leerNumero();
    }

    function leerPotencia() {
      var base = leerPrimario();
      if (asoma('^')) {
        pos += 1;
        return Math.pow(base, leerUnario());
      }
      return base;
    }

    function leerUnario() {
      if (asoma('-')) {
        pos += 1;
        return -leerUnario();
      }
      if (asoma('+')) {
        pos += 1;
        return leerUnario();
      }
      return leerPotencia();
    }

    function leerProducto() {
      var acumulado = leerUnario();
      while (pos < origen.length) {
        if (asoma('*')) {
          pos += 1;
          acumulado *= leerUnario();
        } else if (asoma('/')) {
          pos += 1;
          var divisor = leerUnario();
          if (divisor === 0) {
            fallo('no se puede dividir entre cero');
          }
          acumulado /= divisor;
        } else {
          break;
        }
      }
      return acumulado;
    }

    function leerSuma() {
      var acumulado = leerProducto();
      while (pos < origen.length) {
        if (asoma('+')) {
          pos += 1;
          acumulado += leerProducto();
        } else if (asoma('-')) {
          pos += 1;
          acumulado -= leerProducto();
        } else {
          break;
        }
      }
      return acumulado;
    }

    var resultado = leerSuma();
    if (pos < origen.length) {
      fallo("carácter inesperado '" + origen.charAt(pos) + "'");
    }
    if (!isFinite(resultado)) {
      fallo('el resultado no es un número finito');
    }
    return resultado;
  }

  function formatear(valor) {
    if (typeof valor !== 'number' || !isFinite(valor)) {
      return 'Error';
    }
    var compacto = Number(valor.toPrecision(12));
    if (Math.abs(compacto) >= 1e12) {
      return compacto.toExponential(6).replace('e+', 'e');
    }
    return String(compacto);
  }

  return { calcular: calcular, formatear: formatear };
});