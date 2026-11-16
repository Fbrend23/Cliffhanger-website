// Le texte d'une erreur attrapée : `catch (e)` peut recevoir autre chose qu'une `Error`.
/** @param {unknown} e */
export const messageDe = (e) => (e instanceof Error ? e.message : String(e));
