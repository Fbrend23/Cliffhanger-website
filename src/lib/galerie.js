// Les filtres de la galerie : un groupe par spectacle belge montré, plus « Coulisses ».
import { T } from './textes.js';

/** Clé du groupe des photos sans spectacle. */
export const CLÉ_COULISSES = 'coulisses';

/**
 * Le groupe d'une photo : le slug de son spectacle s'il est belge, `coulisses` sans spectacle,
 * `null` pour un spectacle qui n'a pas de filtre (Montréal : il n'a que sa page, la photo
 * n'apparaît que sous « Tout »).
 * @param {{ spectacle: string|null }} photo
 * @param {{ slug: string }[]} belges
 * @returns {string|null}
 */
export const cléPhoto = (photo, belges) => {
  if (!photo.spectacle) return CLÉ_COULISSES;
  return belges.some((s) => s.slug === photo.spectacle) ? photo.spectacle : null;
};

/**
 * Les filtres, dans l'ordre où chaque spectacle apparaît d'abord dans la galerie (celui du Studio),
 * « Coulisses » en dernier et seulement s'il y a des photos sans spectacle. Moins de deux groupes :
 * rien à filtrer, la liste est vide.
 * @param {{ spectacle: string|null }[]} photos
 * @param {{ slug: string, title: string }[]} belges
 * @returns {{ clé: string, titre: string }[]}
 */
export const groupesGalerie = (photos, belges) => {
  const clés = [...new Set(photos.map((p) => cléPhoto(p, belges)).filter((c) => c !== null))];
  const ordonnées = [...clés.filter((c) => c !== CLÉ_COULISSES), ...clés.filter((c) => c === CLÉ_COULISSES)];
  if (ordonnées.length < 2) return [];
  return ordonnées.map((clé) => ({ clé, titre: clé === CLÉ_COULISSES ? T.coulisses : (belges.find((s) => s.slug === clé)?.title ?? clé) }));
};
