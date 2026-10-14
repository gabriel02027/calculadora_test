/*
 * Pruebas del núcleo de la calculadora.
 * Ejecutar con: node calculadora.test.js
 */
'use strict';

const assert = require('assert');
const path = require('path');
const { calcular, formatear } = require(path.join(__dirname, 'calculadora.js'));

let pasadas = 0;
let fallidas = 0;

function prueba(descripcion, fn) {
  try {
    fn();
    pasadas += 1;
    console.log('  ok    ' + descripcion);
  } catch (error) {
    fallidas += 1;
    console.log('  FALLA ' + descripcion + '  ->  ' + error.message);
  }
}

function da(expresion, esperado) {
  return function () {
    assert.strictEqual(calcular(expresion), esperado);
  };
}

function fallaCon(expresion, fragmento) {
  return function () {
    assert.throws(
      function () { calcular(expresion); },
      function (error) { return error.message.indexOf(fragmento) !== -1; },
      'se esperaba un error que contuviera "' + fragmento + '"'
    );
  };
}

console.log('Suma y resta');
prueba('1+2 = 3', da('1+2', 3));
prueba('7-2-1 = 4 (asociativa a la izquierda)', da('7-2-1', 4));
prueba('-5+3 = -2', da('-5+3', -2));
prueba('3--2 = 5', da('3--2', 5));
prueba('-(4+1) = -5', da('-(4+1)', -5));

console.log('Precedencia y producto');
prueba('2+3*4 = 14', da('2+3*4', 14));
prueba('(2+3)*4 = 20', da('(2+3)*4', 20));
prueba('10/4 = 2.5', da('10/4', 2.5));
prueba('8/2/2 = 2', da('8/2/2', 2));
prueba('2*-3 = -6', da('2*-3', -6));

console.log('Potencia');
prueba('2^10 = 1024', da('2^10', 1024));
prueba('2^3^2 = 512 (asociativa a la derecha)', da('2^3^2', 512));
prueba('-2^2 = -4', da('-2^2', -4));
prueba('2^-1 = 0.5', da('2^-1', 0.5));

console.log('Paréntesis y decimales');
prueba('1.5+1.5 = 3', da('1.5+1.5', 3));
prueba('1,5+1,5 = 3 (coma decimal)', da('1,5+1,5', 3));
prueba('((1+2)*(3+4)) = 21', da('((1+2)*(3+4))', 21));

console.log('Símbolos que muestra la interfaz');
prueba('6 × 7 = 42', da('6 \u00d7 7', 42));
prueba('9 ÷ 3 = 3', da('9 \u00f7 3', 3));
prueba('5 − 8 = -3', da('5 \u2212 8', -3));
prueba('" 2 + 2 " = 4 (espacios)', da(' 2 + 2 ', 4));

console.log('Errores');
prueba('"" -> vacía', fallaCon('', 'vac'));
prueba('"   " -> vacía', fallaCon('   ', 'vac'));
prueba('1/0 -> división entre cero', fallaCon('1/0', 'cero'));
prueba('1+ -> se esperaba un número', fallaCon('1+', 'mero'));
prueba('2^ -> se esperaba un número', fallaCon('2^', 'mero'));
prueba('(1+2 -> falta cerrar', fallaCon('(1+2', 'cerrar'));
prueba('1+2) -> carácter inesperado', fallaCon('1+2)', 'inesperado'));
prueba('abc -> se esperaba un número', fallaCon('abc', 'mero'));
prueba('1..2 -> carácter inesperado', fallaCon('1..2', 'inesperado'));

console.log('Notación científica');
prueba('1e3 = 1000', da('1e3', 1000));
prueba('1.5e2 = 150', da('1.5e2', 150));
prueba('1e-3 = 0.001', da('1e-3', 0.001));
prueba('un resultado se puede volver a escribir', da('1.000000e13', 1e13));

console.log('Formato del resultado');
prueba('0.1+0.2 se muestra como 0.3', function () {
  assert.strictEqual(formatear(0.1 + 0.2), '0.3');
});
prueba('1/3 se muestra como 0.333333333333', function () {
  assert.strictEqual(formatear(1 / 3), '0.333333333333');
});
prueba('1e13 usa notación exponencial', function () {
  assert.strictEqual(formatear(1e13), '1.000000e13');
});
prueba('NaN devuelve Error', function () {
  assert.strictEqual(formatear(NaN), 'Error');
});

console.log('');
console.log(pasadas + ' pasadas, ' + fallidas + ' fallidas');
if (fallidas > 0) {
  process.exitCode = 1;
}