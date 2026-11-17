import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cléPhoto, groupesGalerie } from '../src/lib/galerie.js';

const belges = [
  { slug: 'inedit', title: 'L’Inédit de Molière' },
  { slug: 'femmes', title: 'Les Femmes se vantent' },
];
const photo = (spectacle) => ({ spectacle });

test('la clé d’une photo : son spectacle belge, coulisses, ou aucune pour Montréal', () => {
  assert.equal(cléPhoto(photo('femmes'), belges), 'femmes');
  assert.equal(cléPhoto(photo(null), belges), 'coulisses');
  assert.equal(cléPhoto(photo('montreal'), belges), null);
});

test('les groupes suivent l’ordre de la galerie, Coulisses en dernier', () => {
  const photos = [photo(null), photo('femmes'), photo('inedit'), photo('femmes')];
  assert.deepEqual(groupesGalerie(photos, belges), [
    { clé: 'femmes', titre: 'Les Femmes se vantent' },
    { clé: 'inedit', titre: 'L’Inédit de Molière' },
    { clé: 'coulisses', titre: 'Coulisses' },
  ]);
});

test('Coulisses n’apparaît que s’il y a des photos sans spectacle', () => {
  const clés = groupesGalerie([photo('inedit'), photo('femmes')], belges).map((g) => g.clé);
  assert.deepEqual(clés, ['inedit', 'femmes']);
});

test('un spectacle hors des belges n’a pas de filtre', () => {
  const clés = groupesGalerie([photo('inedit'), photo('montreal'), photo(null)], belges).map((g) => g.clé);
  assert.deepEqual(clés, ['inedit', 'coulisses']);
});

test('moins de deux groupes : rien à filtrer', () => {
  assert.deepEqual(groupesGalerie([photo('inedit'), photo('inedit')], belges), []);
  assert.deepEqual(groupesGalerie([], belges), []);
});
