// Le jugement de `npm audit`, sans lancer npm : quelles failles de gravité haute
// arrêtent la vérification, quelles exceptions ont expiré ou ne servent plus.
// Pur, testé dans test/audit.test.js ; scripts/audit.mjs lit le rapport.
//
// Une exception n'est jamais oubliée : elle porte une date limite (passé ce
// jour, la faille arrête de nouveau la CI), et si l'avis ne figure plus dans
// le rapport (corrigé, ou paquet retiré) la CI échoue aussi, pour qu'on la retire.

const GRAVITÉS_BLOQUANTES = new Set(['high', 'critical']);

/**
 * L'identifiant GHSA d'un avis, tiré de son adresse.
 * @param {string|undefined} url  https://github.com/advisories/GHSA-xxxx-xxxx-xxxx
 */
const identifiant = (url) => /GHSA(?:-[\da-z]{4}){3}/i.exec(url ?? '')?.[0]?.toUpperCase() ?? null;

/**
 * Les avis d'un rapport `npm audit --json`. Une dépendance qui hérite d'une
 * faille la cite par son nom (une chaîne dans `via`) : seuls les avis eux-mêmes
 * (des objets) comptent, une fois chacun.
 * @param {{ vulnerabilities?: Record<string, { via?: unknown[] }> }} rapport
 * @returns {{ id: string, titre: string, gravité: string }[]}
 */
export function avis(rapport) {
  const vias = Object.values(rapport.vulnerabilities ?? {}).flatMap((v) => v.via ?? []);
  const parId = new Map();
  for (const via of vias.filter((x) => typeof x === 'object' && x)) {
    const id = identifiant(via.url);
    if (id && !parId.has(id)) parId.set(id, { id, titre: via.title ?? id, gravité: via.severity ?? 'high' });
  }
  return [...parId.values()];
}

/**
 * Ce que dit le rapport au regard des exceptions.
 * @param {{ vulnerabilities?: Record<string, { via?: unknown[] }> }} rapport
 * @param {Record<string, { jusquAu: string, pourquoi: string }>} exceptions  par identifiant GHSA
 * @param {string} aujourdhui  AAAA-MM-JJ
 * @returns {{ bloquants: { id: string, titre: string, expirée: boolean }[], tolérés: string[], inutiles: string[] }}
 */
export function juger(rapport, exceptions, aujourdhui) {
  const trouvés = avis(rapport);
  const bloquants = [];
  const tolérés = [];
  for (const a of trouvés.filter((x) => GRAVITÉS_BLOQUANTES.has(x.gravité))) {
    const exception = exceptions[a.id];
    if (!exception) bloquants.push({ id: a.id, titre: a.titre, expirée: false });
    else if (aujourdhui > exception.jusquAu) bloquants.push({ id: a.id, titre: a.titre, expirée: true });
    else tolérés.push(a.id);
  }
  const présents = new Set(trouvés.map((a) => a.id));
  return { bloquants, tolérés, inutiles: Object.keys(exceptions).filter((id) => !présents.has(id)) };
}
