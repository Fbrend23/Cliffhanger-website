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
- [x] `.editorconfig`, Prettier, ESLint, scripts `lint` et `format` · `.editorconfig`, `.prettierrc`, `eslint.config.js`, scripts `lint` et `format` ; Prettier non appliqué au dépôt (69 fichiers), ESLint : 0 erreur, 37 avertissements de complexité existants
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
- [ ] securityheaders.com et observatory.mozilla.org sans alerte · à passer en ligne

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
- [ ] Lighthouse mobile au vert, Core Web Vitals corrects · mesures locales du premier affichage seulement (1820 → 664 ms) ; aucun rapport Lighthouse

## 10. Accessibilité (10)
- [x] `lang`, un seul `<h1>`, lien d'évitement · `lang="fr"`, `h1` par page (test `dist`), lien vers `#contenu`
- [~] Tout au clavier, focus visible, piège de focus et `Échap` dans les fenêtres · menu (focus piégé, Échap), visionneuse en `<dialog>` ; parcours complet au clavier non consigné
- [x] `aria-expanded` / `aria-current` / `aria-pressed` / `aria-live` bien posés · burger, menu, légende de la visionneuse, statut du formulaire (`aria-pressed` sans objet)
- [x] `prefers-reduced-motion` géré (CSS et JS) · `site.css`, `Base.astro`, `Carrousel.astro`
- [x] Fonctionne sans JavaScript · variante `sans-js:`, menu en ligne de liens, formulaire remplacé par l'e-mail
- [~] Contrastes, textes alternatifs, labels de formulaire · labels du formulaire en place ; contrastes sur photos et texte à 60 à 75 % d'opacité non mesurés
- [~] Cibles cliquables d'au moins 24x24 px (44x44 sur mobile) · bouton du menu à 44 px de haut ; autres liens non mesurés
- [x] Zoom non bloqué, `color-scheme` si mode sombre · viewport sans `maximum-scale` ; `color-scheme: dark`
- [~] Test à 390, 820 et 1440 px · consigne du projet, suivie à chaque changement visuel ; non consigné
- [ ] axe ou Lighthouse sans erreur grave, test lecteur d'écran · non fait

## 11. SEO (11)
- [x] Contenu présent dans le HTML sans JavaScript · site statique
- [x] `title` et `description` uniques, un seul `<h1>` · vérifié par `test:dist`
- [x] Canonical, hreflang + `x-default` · canonical testé dans `test:dist` ; hreflang et `x-default` sans objet tant que le site est monolingue (version anglaise au « Reste à faire »)
- [x] Open Graph et Twitter complets · Open Graph et `twitter:title/description/image/card`
- [x] JSON-LD valide, échappé, testé · `seo.js`, `Base.astro`, test `dist`
- [x] `sitemap.xml` et `robots.txt` (généré depuis `SITE_URL`) · `@astrojs/sitemap` et `robots.txt.js`
- [x] 404 et pages utilitaires en `noindex`, anciennes URL en 301 côté serveur · 404 en `noindex` sans canonical ; 301 http/www vers le domaine unique ; aucune ancienne adresse listée, redirections du prototype non vérifiées
- [x] Un seul domaine canonique en HTTPS · `.htaccess` et `SITE_URL`
- [~] Pack de favicons complet (ico, svg, apple-touch-icon, manifeste) · `favicon.png` et `apple-touch-icon.png` ; ni `.ico`, ni SVG, ni manifeste
- [ ] Search Console vérifié, sitemap envoyé · champ `head_verification` prévu dans les réglages ; état à confirmer
- [ ] Lighthouse SEO à 100 · non mesuré

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
- [~] Noms explicites, 3 paramètres au plus · noms explicites en français ; paramètres non contrôlés
- [~] Fonctions courtes à une seule responsabilité · non mesuré ; `Base.astro` porte beaucoup de script en ligne
- [~] Retours anticipés, 3 niveaux d'imbrication au maximum · non contrôlé (aucune règle ESLint)
- [~] Aucun nombre ou texte magique, constantes nommées · textes d'interface centralisés dans `textes.js` ; jetons dans `@theme` ; nombres non audités
- [~] Commentaires = pourquoi, aucun code mort ni code commenté (knip) · commentaires qui disent le pourquoi (consigne du projet) ; knip absent
- [~] Aucune erreur avalée, messages d'erreur avec contexte · warnings explicites dans les loaders et échecs de build parlants ; audit systématique des `catch` non fait
- [ ] DRY à la troisième répétition (jscpd), sans abstraction prématurée · composants extraits (`Section`, `Accroche`, `TitrePage`…) ; jscpd absent
- [x] YAGNI : rien écrit pour plus tard, le plus simple qui marche · version anglaise et polices Adobe laissées au « Reste à faire »
- [ ] Règles ESLint de complexité actives, appliquées par la CI · aucun ESLint

## Fait suite à cet audit (23.10.2026, sur `dev`, non poussé)
`.node-version`, `.editorconfig`, fichiers cachés non servis (le manifeste de déploiement répondait 200 en ligne), `security.txt`,
CSP et `X-Frame-Options`, balises Twitter, `favicon.ico` et manifeste, polices de secours, faux succès du piège à robots
(le champ existait, le formulaire restait muet), test des liens internes, quatre failles `npm audit` corrigées, Dependabot,
`npm audit`, actions épinglées, actionlint, gitleaks (CI, hook, historique propre), ESLint, Prettier configuré, README.

## Vérifié en ligne le 28.10.2026 (curl, lecture seule)
En-têtes : CSP (`frame-ancestors 'none'; base-uri 'self'; object-src 'none'`), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS (hébergeur).
Fichiers : `security.txt` (échéance 2027-10-28), `favicon.ico`, `site.webmanifest`, `robots.txt`, sitemap, pages légales en 200.
Les cases cochées le 23.10 n'ont pas été revérifiées sur les ajouts du 24.10 (réseaux sociaux, fil d'Ariane, GoatCounter, retour arrière).

## Reste à faire
1. **Hors dépôt** : Search Console ; Sentry ; moniteur de disponibilité ; statistiques sans cookies ; protection de `main`.
2. **Après déploiement** : securityheaders, Observatory, Lighthouse, axe, lecteur d'écran, ZAP ; `/.deploy-manifest.json` et `/.well-known/security.txt` en ligne (404 puis 200).
3. **Avec décision** : Playwright (écarté pour l'instant : contenu du CMS instable) ; captcha sur la réservation (le piège suffit-il ?) ; formater le dépôt avec Prettier ; ramener les 37 avertissements de complexité à zéro, puis passer ces règles en `error` ; favicon SVG (pas de logo vectoriel) ; retour arrière à essayer pour de bon ; knip et jscpd.
