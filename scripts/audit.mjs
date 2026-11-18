#!/usr/bin/env node
// L'audit des dépendances livrées, depuis .github/workflows/check.yml et
// `npm run audit:prod`. Comme `npm audit --omit=dev --audit-level=high`, mais
// avec les exceptions de scripts/audit-exceptions.json : chacune a une date
// limite et un motif, et la vérification échoue quand l'une a expiré ou ne sert
// plus (voir scripts/lib/audit.mjs). La logique est pure, testée dans test/audit.test.js.

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { juger } from './lib/audit.mjs';

const exceptions = JSON.parse(readFileSync(new URL('./audit-exceptions.json', import.meta.url), 'utf8'));

// npm sort 1 quand il trouve des failles : seul le JSON compte.
const npm = spawnSync('npm', ['audit', '--omit=dev', '--json'], { encoding: 'utf8', shell: true, maxBuffer: 64 * 1024 * 1024 });
if (!npm.stdout.trim()) {
  console.error(`npm audit n'a rien rendu : ${npm.stderr}`);
  process.exit(1);
}

const aujourdhui = new Date().toISOString().slice(0, 10);
const { bloquants, tolérés, inutiles } = juger(JSON.parse(npm.stdout), exceptions, aujourdhui);

for (const id of tolérés) console.log(`Toléré jusqu'au ${exceptions[id].jusquAu} : ${id}. ${exceptions[id].pourquoi}`);
for (const b of bloquants) {
  const suite = b.expirée ? `exception expirée le ${exceptions[b.id].jusquAu}, la lever ou la prolonger après examen` : 'aucune exception';
  console.error(`::error::Faille haute ${b.id} : ${b.titre} (${suite})`);
}
for (const id of inutiles)
  console.error(`::error::L'exception ${id} ne sert plus (avis corrigé ou paquet retiré) : la supprimer de scripts/audit-exceptions.json`);

process.exit(bloquants.length > 0 || inutiles.length > 0 ? 1 : 0);
