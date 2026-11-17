# Audit de la checklist : cliffhanger (annotations)

Type : Site statique. Générée le 23.10.2026. Auditée le 23.10.2026 (lecture du dépôt, rien exécuté en ligne).

Légende : `[x]` fait · `[~]` partiel · `[ ]` à faire. Une case reste vide quand le dépôt n'en porte aucune preuve.

## 1. Choix techno (01)
- [x] Besoin écrit en 3 lignes, statique envisagé en premier · README (intro) et commentaire de `astro.config.mjs` : site statique, CMS lu au build seulement
- [x] Hébergeur choisi et ses contraintes lues · Infomaniak en FTP, `.htaccess`, marqueur de cible, hébergeur sans corbeille (`deploy.yml`)
- [x] `.nvmrc` + `.node-version` + `engines`, un seul gestionnaire de paquets, lockfile commité · `.nvmrc`, `.node-version` (24), `engines`, npm, lockfile
- [x] Chaque dépendance justifiée · 5 dépendances (Astro, sitemap, Tailwind + plugin Vite, sharp), toutes expliquées dans le README ou la config
- [x] Choix et raisons notés dans le README · section « Choix techniques » du README

## 2. Git et conventions (02)
- [x] `.gitignore` : `.env`, `node_modules`, `dist` · et `.cache/`, `public/media/`, `/private`
- [~] Branches `dev` / `main` (ou gitflow), `main` protégée si équipe · `dev`/`main` en place ; protection de `main` non vérifiable depuis le dépôt (seul développeur, fast-forward direct)
- [~] Commits conventionnels, corps = pourquoi · `type: Phrase` suivi sur la quasi-totalité de l'historique (26 messages sur 196 hors format)
- [x] `.editorconfig`, Prettier, ESLint, scripts `lint` et `format` · `.editorconfig`, `.prettierrc`, `eslint.config.js`, scripts `lint` et `format` ; Prettier non appliqué au dépôt (69 fichiers), ESLint : 0 erreur, complexité, imbrication, paramètres et longueur de fonction en erreur
- [x] Fichier de contexte IA (modèle : `templates/AGENTS.md`) · `CLAUDE.md`

## 3. Config et secrets (03)
- [x] `.env.example` commenté et commité, `.env` ignoré
- [x] Validation des variables au démarrage ou au build · `astro:env` (`astro.config.mjs`), étape « Refuser un build sans ses sources » en CI
- [x] Aucun secret dans le bundle client · `DIRECTUS_TOKEN` en `access: 'secret'` ; la clé Prodysos est une clé publiable, voulue dans les pages
- [x] Jetons séparés, moindre privilège, aucun jeton admin dans la CI · policy de build en lecture du contenu publié, plus l'écriture des seuls champs de `cliff_publication` (`platform-cms/scripts/lib/permissions.mjs`) ; aucun jeton admin en CI (le mot de passe FTP donne l'accès au compte d'hébergement, hors périmètre)
- [x] Gitleaks dans le hook de pré-commit · `.githooks/pre-commit` (gitleaks ou Docker), activé par `npm install`
- [x] Secrets de CI dans GitHub, plan de rotation noté · tableau « Secrets » du README, rotation annuelle

## 4. Sécurité de l'app (04)
- [~] Aucune sortie HTML brute non maîtrisée, JSON-LD et `<script>` échappés · JSON-LD échappé (`<` → `<`, `Base.astro`) et `typographier()` à l'affichage ; `set:html` sur le HTML du CMS (`TexteRiche`) et `head_verification` rendus tels quels : source de confiance (Studio), non assainie
- [~] URLs externes et redirections filtrées · aucune redirection applicative ; liens du CMS non filtrés
- [x] En-têtes de sécurité, CSP présente ou absence justifiée par écrit · `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, CSP `frame-ancestors/base-uri/object-src` ; pas de `script-src`, justifié dans `.htaccess` ; HSTS posé par l'hébergeur
- [~] securityheaders.com et observatory.mozilla.org sans alerte · Observatory le 17.11.2026 : B, 75/100, 10 tests sur 12 ; perdu : CSP sans `script-src` (−20, choix justifié dans `.htaccess`) et pas de SRI sur le script externe (−5, GoatCounter) ; CORP absent sans effet sur la note. securityheaders.com pas passé

## 5. Attaques extérieures (05)
- [x] Limitation de débit (login, contact, réinitialisation), IP lue correctement · sans objet : ni login ni formulaire de contact ; la réservation est validée et limitée côté Prodysos
- [x] Taille maximale des corps de requête · sans objet côté site statique (aucune route serveur)
- [~] Formulaires : honeypot (faux succès) + captcha vérifié côté serveur · seul formulaire : la réservation (`Reservation.astro`), vers Prodysos ; ni honeypot ni captcha ici
- [x] `Options -Indexes`, dotfiles et `/api/` fermés · `-Indexes` posé ; `/api/` inexistant ; dotfiles hors de `dist/` (le marqueur et le manifeste restent à la racine FTP, à vérifier en production)
- [x] `robots.txt` réfléchi (moteurs, robots IA) · `src/pages/robots.txt.js`, 17 robots d'entraînement refusés, plus `TDM-Reservation` et `X-Robots-Tag`
- [x] `security.txt` publié sur `/.well-known/` · `src/pages/.well-known/security.txt.js`, testé dans `test:dist`
- [x] `npm audit` en CI, Dependabot configuré · `check.yml` (`--omit=dev --audit-level=high`), `.github/dependabot.yml` ; 4 failles corrigées (`npm audit fix`)
- [x] Actions épinglées par SHA, `permissions` minimales · `check.yml` et `deploy.yml` épinglés par empreinte, `permissions: contents: read`
- [x] gitleaks ou trufflehog passé sur tout l'historique · gitleaks 8.30.1 : 204 commits, aucun secret ; aussi en CI
- [ ] Scan ZAP et injections manuelles passés · non fait

## 7. Tests (07)
- [x] `npm test` fonctionne sur un clone neuf · `deploy.yml` lance `npm ci` puis `npm test` sur un checkout vierge à chaque déploiement (dernier : 28.10.2026, succès)
- [x] Unitaires sur logique métier et fonctions de sécurité · dates, générique, typographie, SEO, Prodysos, loaders, légal, déploiement (`test/*.test.js`)
- [ ] E2E Playwright sur les parcours critiques · absent
- [ ] Captures Playwright (`toHaveScreenshot`) sur accueil et formulaire · absent (captures faites à la main en CDP)
- [x] Test du `dist/` construit (SEO, JSON-LD, liens) · `test/site-construit.mjs` (`npm run test:dist`) : tirets, titres et descriptions uniques, canonical, JSON-LD, h1, adresses de développement ; liens internes non contrôlés
- [x] Dates testées en `TZ=UTC` et en local · `deploy.yml` lance `npm test` en Bruxelles puis en UTC
- [x] Aucun test ne dépend du réseau (faux serveur ou MSW) · faux Directus (`test/faux-directus/`)
- [x] Tests de typage en CI (`astro check`, `vue-tsc`) · `check.yml` : `npm run check`
- [~] Un bug corrigé = un test ajouté · pratique suivie en partie, non systématique

## 8. CI/CD (08)
- [x] `verifier` puis `deployer`, `permissions`, `concurrency`, `timeout-minutes` · deux workflows : `check.yml` (job `verifier`, sur `dev`) et `deploy.yml` (job `deployer`, sur `main`) ; `concurrency` et `timeout-minutes` posés
- [x] `dry_run`, contrôle des variables requises en première étape
- [x] Build refusé sans source de contenu · étape « Refuser un build sans ses sources » ; zéro spectacle publié arrête aussi le build
- [x] Marqueur de déploiement, mot de passe masqué, `.htaccess` à part, `build.json` en dernier · marqueur FTP vérifié avant toute écriture, URL expurgées dans les journaux, manifeste `.deploy-manifest.json` envoyé en dernier ; `.htaccess` est envoyé avec `dist/`, non à part
- [x] Actions et CLI épinglées, actionlint · actions par empreinte, gitleaks et actionlint à version fixe, actionlint sans remarque
- [ ] Retour arrière testé · aucun retour arrière documenté ni essayé

## 9. Performance (09)
- [x] Images AVIF/WebP, dimensions explicites, image principale préchargée · `src/lib/images.js`, `Photo.astro`, préchargement AVIF dans `Base.astro`
- [x] `dist/` sans originaux en trop, SVG passés par `svgo` · `dist/` (32 Mo) ne contient que des WebP, AVIF et quelques JPEG d'aperçu (Open Graph), plus la vidéo du menu ; aucun SVG, `svgo` sans objet
- [x] Polices auto-hébergées, préchargées, police de secours ajustée (`size-adjust`) · `woff2` préchargées, `font-display: swap`, polices de secours ajustées (`size-adjust`, `site.css`)
- [x] `Cache-Control` par type de ressource, compression · `.htaccess` (immutable un an, une semaine, `no-cache` pour le HTML) ; compression laissée à l'hébergeur, non vérifiée
- [x] Pas de JS inutile, `console.*` retirés · aucun framework client ; un seul `console.warn` (build, `prodysos.js`)
- [x] Lighthouse mobile au vert, Core Web Vitals corrects · 17.11.2026, accueil en production (Lighthouse 12.6.1, mobile) : performance 94, accessibilité 100, bonnes pratiques 100 ; LCP 2,3 s, FCP 2,3 s, TBT 0 ms, CLS 0, Speed Index 3,7 s. Mesure de laboratoire (pas de données de terrain). Autres gabarits le même jour (performance / accessibilité / bonnes pratiques / SEO, LCP) : `/spectacles/` 90/100/100/92 (3,1 s), spectacle 83/100/100/92 (4,1 s), `/agenda/` 97/100/100/100 (2,4 s), `/compagnie/` 94/100/100/100 (2,8 s), `/galerie/` 79/100/100/92 (5,1 s), `/montreal/` 93/100/100/100 (2,8 s), `/contact/` 96/100/100/100 (2,5 s) ; CLS à 0 partout. Les deux plus lents : la galerie (corrigée le 17.11 : les quatre premières vignettes étaient en priorité haute et se disputaient la bande passante, seule la première l'est maintenant ; Lighthouse mobile en local avec gzip, 88 → 99 et LCP 3,9 → 1,9 s, bureau 100 avant et après, à remesurer en production après déploiement ; reste 149 à 372 Ko d'images signalées trop lourdes : vignettes en WebP seulement, sans AVIF, et pas de largeur entre 480 et 800 px) et la fiche spectacle (LCP : le titre, 3 s de délai de rendu, cascade `rise` comprise). La vidéo du menu (2,2 à 2,6 Mo) part au repos après `load` sur 4g : voulu, elle pèse dans le poids total (3,3 Mo) mais pas dans le LCP

## 10. Accessibilité (10)
- [x] `lang`, un seul `<h1>`, lien d'évitement · `lang="fr"`, `h1` par page (test `dist`), lien vers `#contenu`
- [~] Tout au clavier, focus visible, piège de focus et `Échap` dans les fenêtres · menu (focus piégé, Échap), visionneuse en `<dialog>` ; parcours complet au clavier non consigné
- [x] `aria-expanded` / `aria-current` / `aria-pressed` / `aria-live` bien posés · burger, menu, légende de la visionneuse, statut du formulaire (`aria-pressed` sans objet)
- [x] `prefers-reduced-motion` géré (CSS et JS) · `site.css`, `Base.astro`, `Carrousel.astro`
- [x] Fonctionne sans JavaScript · variante `sans-js:`, menu en ligne de liens, formulaire remplacé par l'e-mail
- [~] Contrastes, textes alternatifs, labels de formulaire · 30.10.2026, build sur le vrai CMS : axe-core (WCAG 2.1 AA) sans violation sur 13 pages (une par gabarit) à 390, 820 et 1440 px, alt et labels compris ; les ~150 textes qu'axe ne tranche pas (blanc à 60 à 75 % d'opacité sur photo) mesurés au pixel, fond capturé texte masqué. Voile du haut des héros porté à 0,7 et pied de page à 90 % d'opacité après mesure. Restait sous le seuil au 5e centile des pixels les plus clairs : logo et « Menu » de `/compagnie/` à 390 px (3,8 pour 4,5), titres de l'accueil à 820 px (2,86 pour 3), phrase de la 404 (4,46 pour 4,5). Corrigé le 17.11.2026 (outil refait, mesure de départ retrouvée : « Menu » 3,85, 404 à 1440 px 4,49) : logo et « Menu » au repos à 90 % d'opacité au lieu de 75 (« Menu » 4,74, logo 4,27 pour un logotype), titres de la liste des spectacles à 85 % (au moins 3,1 de 700 à 1080 px de haut, 2,8 avant), phrase des pages centrées à 85 % (404 : 5,2 à 5,8 à 390, 820 et 1440 px). « Menu » mesuré aussi sur l'accueil, un spectacle, Montréal et la galerie à 390, 820 et 1440 px : au moins 4,7. Le pied de page de `/agenda/` à 1440 px ne se reproduit plus : 7,7 ou plus de 700 à 1300 px de haut. Les médianes sont toutes au-dessus des seuils. Les pastilles de `/contact/` et de la 404 (bordure blanche) et « Découvrir » (mesuré en plein fondu) sont des artefacts de la mesure
- [~] Cibles cliquables d'au moins 24x24 px (44x44 sur mobile) · 17.11.2026, 11 pages (une par gabarit), zone réelle de chaque lien et bouton (pseudo-éléments compris, par balayage d'`elementFromPoint`) : à 390 px au doigt et à 1440 px à la souris, aucune cible sous 24 px (minimum WCAG 2.5.8). Au doigt, 44 px atteints partout sauf le lien « Lire la review de Montreal » (26 px, vient du texte riche du CMS, `/montreal/`) ; liens au milieu d'une phrase exemptés (WCAG 2.5.8). Corrigés le 17.11 : liens des tableaux (titres de l'agenda et des projets, équipe : 24 à 36 px avant), e-mail de `/contact/` (30 px), « Découvrir » (42 px de large). Recouvrements de zones voisines non vérifiés (l'outil est trop bruyant sur les listes de noms en ligne)
- [x] Zoom non bloqué, `color-scheme` si mode sombre · viewport sans `maximum-scale` ; `color-scheme: dark`
- [~] Test à 390, 820 et 1440 px · consigne du projet, suivie à chaque changement visuel ; non consigné
- [~] axe ou Lighthouse sans erreur grave, test lecteur d'écran · axe-core sans violation (voir ci-dessus) ; test au lecteur d'écran non fait

## 11. SEO (11)
- [x] Contenu présent dans le HTML sans JavaScript · site statique
- [x] `title` et `description` uniques, un seul `<h1>` · vérifié par `test:dist`
- [x] Canonical, hreflang + `x-default` · canonical testé dans `test:dist` ; hreflang et `x-default` sans objet tant que le site est monolingue (version anglaise au « Reste à faire »)
- [x] Open Graph et Twitter complets · Open Graph et `twitter:title/description/image/card`
- [x] JSON-LD valide, échappé, testé · `seo.js`, `Base.astro`, test `dist`
- [x] `sitemap.xml` et `robots.txt` (généré depuis `SITE_URL`) · `@astrojs/sitemap` et `robots.txt.js`
- [x] 404 et pages utilitaires en `noindex`, anciennes URL en 301 côté serveur · 404 en `noindex` sans canonical ; 301 http/www vers le domaine unique ; aucune ancienne adresse listée, redirections du prototype non vérifiées
- [x] Un seul domaine canonique en HTTPS · `.htaccess` et `SITE_URL`
- [x] Pack de favicons complet (ico, svg, apple-touch-icon, manifeste) · `favicon.ico`, `favicon.png`, `apple-touch-icon.png`, `icone-192.png`, `icone-384.png` et `site.webmanifest`, déclarés dans `Base.astro` ; pas de SVG, le logo n'existe qu'en raster (décision du 30.10.2026)
- [ ] Search Console vérifié, sitemap envoyé · champ `head_verification` prévu dans les réglages ; état à confirmer
- [ ] Lighthouse SEO à 100 · 17.11.2026 : 92 sur l'accueil, répété deux fois. Seul audit en échec : `robots.txt` « impossible à télécharger », alors que le fichier répond 200 en `text/plain` (498 octets, aussi avec un User-Agent de navigateur headless). Intermittent : même fichier, même serveur, le SEO est à 100 sur `/agenda/`, `/compagnie/`, `/montreal/` et `/contact/` et à 92 sur l'accueil, `/spectacles/`, un spectacle et `/galerie/` pour ce seul audit. Côté mesure (téléchargement du fichier par Lighthouse), pas un défaut de `robots.txt`. À confirmer avec PageSpeed Insights ou un second poste

## 12. Mise en production et suivi (12)
- [~] Domaine, DNS, HTTPS valides, TTL DNS baissé 48 h avant la bascule · domaine en dur dans `.htaccess` et HTTPS forcé ; DNS et TTL hors dépôt
- [ ] Secrets de production distincts, renouvelés · `GITHUB_DEPLOY_TOKEN` régénéré le 23.10.2026 et vérifié (run `workflow_dispatch` en succès) ; les autres secrets pas renouvelés
- [x] Mentions légales et politique de confidentialité, cookies conformes ou absents · pages `/mentions-legales/` et `/confidentialite/` en 200 (28.10.2026), aucun `Set-Cookie`, GoatCounter sans cookie comme seul traceur
- [ ] Sentry actif, moniteur de disponibilité (alerte d'expiration SSL), statistiques sans cookies · aucun des trois dans le dépôt
- [ ] Parcours critiques testés sur la production · à faire (ne jamais envoyer la réservation sur le vrai Prodysos)
- [x] `.env`, `.git`, `/api/` en 404 sur la production · vérifié le 28.10.2026 : `/.env`, `/.git/config` et `/.htaccess` en 403, `/api/`, `/.deploy-manifest.json` et le marqueur de cible en 404 : rien d'exposé
- [x] Dependabot actif, `npm audit` mensuel · Dependabot hebdomadaire sur `dev`, `npm audit` à chaque vérification
- [x] README d'exploitation à jour (déployer, secrets, contacts) · README : déployer, revenir en arrière, secrets, contact

## 13. Clean code (13)
- [x] Noms explicites, 3 paramètres au plus · noms entiers en français (les lettres seules ne restent que dans les boucles et les correspondances de regex) ; `max-params` à 3 en erreur (`npm run lint`)
- [x] Fonctions courtes à une seule responsabilité · `max-lines-per-function` à 50 en erreur (`npm run lint`, CI) ; loaders et script de la galerie découpés
- [x] Retours anticipés, 3 niveaux d'imbrication au maximum · `max-depth` à 3 et `complexity` à 10 en erreur (`npm run lint`, CI)
- [x] Aucun nombre ou texte magique, constantes nommées · textes d'interface dans `textes.js` (aucun texte en dur dans les gabarits), jetons dans `@theme` ; délais, rejeux, troncatures et unités de temps nommés (`src/lib`, scripts de `Base.astro` et `Fond.astro`) ; codes HTTP laissés en clair
- [x] Commentaires = pourquoi, aucun code mort ni code commenté (knip) · `npm run knip` sort à zéro (CI)
- [x] Aucune erreur avalée, messages d'erreur avec contexte · chaque `catch` vide porte un commentaire qui dit pourquoi ; warnings explicites dans les loaders
- [x] DRY à la troisième répétition (jscpd), sans abstraction prématurée · `npm run dupli` : aucun doublon de 50 jetons ou plus, `.astro` compris (CI) ; à 30 jetons, trois petits clones de balisage en deux exemplaires, laissés
- [x] YAGNI : rien écrit pour plus tard, le plus simple qui marche · version anglaise et polices Adobe laissées au « Reste à faire »
- [x] Règles ESLint de complexité actives, appliquées par la CI · `eslint.config.js` : `complexity`, `max-depth`, `max-params`, `max-lines-per-function` en erreur, `check.yml` lance `npm run lint`

## Fait suite à cet audit (23.10.2026, sur `dev`, non poussé)
`.node-version`, `.editorconfig`, fichiers cachés non servis (le manifeste de déploiement répondait 200 en ligne), `security.txt`,
CSP et `X-Frame-Options`, balises Twitter, `favicon.ico` et manifeste, polices de secours, faux succès du piège à robots
(le champ existait, le formulaire restait muet), test des liens internes, quatre failles `npm audit` corrigées, Dependabot,
`npm audit`, actions épinglées, actionlint, gitleaks (CI, hook, historique propre), ESLint, Prettier configuré, README.

## Vérifié en ligne le 28.10.2026 (curl, lecture seule)
En-têtes : CSP (`frame-ancestors 'none'; base-uri 'self'; object-src 'none'`), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS (hébergeur).
Fichiers : `security.txt` (échéance 2027-10-28), `favicon.ico`, `site.webmanifest`, `robots.txt`, sitemap, pages légales en 200.
Les cases cochées le 23.10 n'ont pas été revérifiées sur les ajouts du 24.10 (réseaux sociaux, fil d'Ariane, GoatCounter, retour arrière).

## Vérifié en ligne le 17.11.2026 (curl, Observatory, Lighthouse, lecture seule)
En-têtes inchangés (HSTS, CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`). `/.well-known/security.txt` en 200, `/.deploy-manifest.json` en 404, `/.env` et `/.git/config` en 403, `robots.txt` et `sitemap-index.xml` en 200, http et www en 301 vers le domaine unique. Observatory B (75), Lighthouse mobile 94 / 100 / 100 / 92 (voir les cases concernées).

## Reste à faire
1. **Hors dépôt** : Search Console ; Sentry ; moniteur de disponibilité ; statistiques sans cookies ; protection de `main`.
2. **En ligne** : securityheaders.com, lecteur d'écran, ZAP ; comprendre l'échec de Lighthouse sur `robots.txt` (PageSpeed Insights) ; Lighthouse sur les autres gabarits.
3. **Avec décision** : Playwright (écarté pour l'instant : contenu du CMS instable) ; captcha sur la réservation (le piège suffit-il ?) ; formater le dépôt avec Prettier ; retour arrière à essayer pour de bon.
