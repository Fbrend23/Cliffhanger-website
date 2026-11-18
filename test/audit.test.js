import test from 'node:test';
import assert from 'node:assert/strict';
import { avis, juger } from '../scripts/lib/audit.mjs';

const GHSA = 'GHSA-fc5q-39xc-vjpf';
const avisPicomatch = { title: 'ReDoS', severity: 'high', url: `https://github.com/advisories/${GHSA}` };
// Comme npm : le paquet touché porte l'avis, ceux qui en dépendent le citent par leur nom.
const rapport = {
  vulnerabilities: {
    picomatch: { via: [avisPicomatch] },
    vite: { via: ['picomatch', 'tinyglobby'] },
    astro: { via: ['vite'] },
  },
};
const exception = { jusquAu: '2026-12-17', pourquoi: 'test' };

test('avis : un avis une fois, les dépendances qui le citent par leur nom sont ignorées', () => {
  assert.deepEqual(avis(rapport), [{ id: 'GHSA-FC5Q-39XC-VJPF', titre: 'ReDoS', gravité: 'high' }]);
  assert.deepEqual(avis({}), []);
});

test('juger : une faille haute sans exception arrête la vérification', () => {
  const r = juger(rapport, {}, '2026-11-18');
  assert.deepEqual(r.bloquants, [{ id: 'GHSA-FC5Q-39XC-VJPF', titre: 'ReDoS', expirée: false }]);
  assert.deepEqual(r.tolérés, []);
});

test('juger : une exception en cours tolère la faille, sans bloquer', () => {
  const r = juger(rapport, { 'GHSA-FC5Q-39XC-VJPF': exception }, '2026-12-17');
  assert.deepEqual(r, { bloquants: [], tolérés: ['GHSA-FC5Q-39XC-VJPF'], inutiles: [] });
});

test('juger : le lendemain de la date limite, la faille arrête de nouveau la vérification', () => {
  const r = juger(rapport, { 'GHSA-FC5Q-39XC-VJPF': exception }, '2026-12-18');
  assert.equal(r.bloquants.length, 1);
  assert.equal(r.bloquants[0].expirée, true);
});

test('juger : une exception dont l’avis a disparu est signalée pour être retirée', () => {
  const r = juger({ vulnerabilities: {} }, { 'GHSA-FC5Q-39XC-VJPF': exception }, '2026-11-18');
  assert.deepEqual(r, { bloquants: [], tolérés: [], inutiles: ['GHSA-FC5Q-39XC-VJPF'] });
});

test('juger : une faille moyenne ne bloque pas', () => {
  const moyenne = { vulnerabilities: { x: { via: [{ ...avisPicomatch, severity: 'moderate' }] } } };
  assert.deepEqual(juger(moyenne, {}, '2026-11-18').bloquants, []);
});
