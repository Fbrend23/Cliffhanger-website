# Checklist : cliffhanger

Type : Site statique. Générée le 23.10.2026.

## 1. Choix techno (01)
- [x] Besoin écrit en 3 lignes, statique envisagé en premier
- [x] Hébergeur choisi et ses contraintes lues
- [x] `.nvmrc` + `.node-version` + `engines`, un seul gestionnaire de paquets, lockfile commité
- [x] Chaque dépendance justifiée
- [x] Choix et raisons notés dans le README

## 2. Git et conventions (02)
- [x] `.gitignore` : `.env`, `node_modules`, `dist`
- [x] Branches `dev` / `main` (ou gitflow), `main` protégée si équipe
- [x] Commits conventionnels, corps = pourquoi
- [x] `.editorconfig`, Prettier, ESLint, scripts `lint` et `format`
- [x] Fichier de contexte IA (modèle : `templates/AGENTS.md`)

## 3. Config et secrets (03)
- [x] `.env.example` commenté et commité, `.env` ignoré
- [x] Validation des variables au démarrage ou au build
- [x] Aucun secret dans le bundle client
- [x] Jetons séparés, moindre privilège, aucun jeton admin dans la CI
- [x] Gitleaks dans le hook de pré-commit
- [x] Secrets de CI dans GitHub, plan de rotation noté

## 4. Sécurité de l'app (04)
- [x] Aucune sortie HTML brute non maîtrisée, JSON-LD et `<script>` échappés
- [x] URLs externes et redirections filtrées
- [x] En-têtes de sécurité, CSP présente ou absence justifiée par écrit
- [ ] securityheaders.com et observatory.mozilla.org sans alerte

## 5. Attaques extérieures (05)
- [x] Limitation de débit (login, contact, réinitialisation), IP lue correctement
- [x] Taille maximale des corps de requête
- [ ] Formulaires : honeypot (faux succès) + captcha vérifié côté serveur
- [x] `Options -Indexes`, dotfiles et `/api/` fermés
- [x] `robots.txt` réfléchi (moteurs, robots IA)
- [x] `security.txt` publié sur `/.well-known/`
- [x] `npm audit` en CI, Dependabot configuré
- [x] Actions épinglées par SHA, `permissions` minimales
- [x] gitleaks ou trufflehog passé sur tout l'historique
- [ ] Scan ZAP et injections manuelles passés

## 7. Tests (07)
- [x] `npm test` fonctionne sur un clone neuf
- [x] Unitaires sur logique métier et fonctions de sécurité
- [ ] E2E Playwright sur les parcours critiques
- [ ] Captures Playwright (`toHaveScreenshot`) sur accueil et formulaire
- [x] Test du `dist/` construit (SEO, JSON-LD, liens)
- [x] Dates testées en `TZ=UTC` et en local
- [x] Aucun test ne dépend du réseau (faux serveur ou MSW)
- [x] Tests de typage en CI (`astro check`, `vue-tsc`)
- [ ] Un bug corrigé = un test ajouté

## 8. CI/CD (08)
- [x] `verifier` puis `deployer`, `permissions`, `concurrency`, `timeout-minutes`
- [x] `dry_run`, contrôle des variables requises en première étape
- [x] Build refusé sans source de contenu
- [x] Marqueur de déploiement, mot de passe masqué, `.htaccess` à part, `build.json` en dernier
- [x] Actions et CLI épinglées, actionlint
- [ ] Retour arrière testé

## 9. Performance (09)
- [x] Images AVIF/WebP, dimensions explicites, image principale préchargée
- [x] `dist/` sans originaux en trop, SVG passés par `svgo`
- [x] Polices auto-hébergées, préchargées, police de secours ajustée (`size-adjust`)
- [x] `Cache-Control` par type de ressource, compression
- [x] Pas de JS inutile, `console.*` retirés
- [ ] Lighthouse mobile au vert, Core Web Vitals corrects

## 10. Accessibilité (10)
- [x] `lang`, un seul `<h1>`, lien d'évitement
- [x] Tout au clavier, focus visible, piège de focus et `Échap` dans les fenêtres
- [x] `aria-expanded` / `aria-current` / `aria-pressed` / `aria-live` bien posés
- [x] `prefers-reduced-motion` géré (CSS et JS)
- [x] Fonctionne sans JavaScript
- [ ] Contrastes, textes alternatifs, labels de formulaire
- [x] Cibles cliquables d'au moins 24x24 px (44x44 sur mobile)
- [x] Zoom non bloqué, `color-scheme` si mode sombre
- [x] Test à 390, 820 et 1440 px
- [ ] axe ou Lighthouse sans erreur grave, test lecteur d'écran

## 11. SEO (11)
- [x] Contenu présent dans le HTML sans JavaScript
- [x] `title` et `description` uniques, un seul `<h1>`
- [x] Canonical, hreflang + `x-default`
- [x] Open Graph et Twitter complets
- [x] JSON-LD valide, échappé, testé
- [x] `sitemap.xml` et `robots.txt` (généré depuis `SITE_URL`)
- [x] 404 et pages utilitaires en `noindex`, anciennes URL en 301 côté serveur
- [x] Un seul domaine canonique en HTTPS
- [x] Pack de favicons complet (ico, svg, apple-touch-icon, manifeste)
- [ ] Search Console vérifié, sitemap envoyé
- [ ] Lighthouse SEO à 100

## 12. Mise en production et suivi (12)
- [ ] Domaine, DNS, HTTPS valides, TTL DNS baissé 48 h avant la bascule
- [ ] Secrets de production distincts, renouvelés
- [x] Mentions légales et politique de confidentialité, cookies conformes ou absents
- [ ] Sentry actif, moniteur de disponibilité (alerte d'expiration SSL), statistiques sans cookies
- [ ] Parcours critiques testés sur la production
- [x] `.env`, `.git`, `/api/` en 404 sur la production
- [x] Dependabot actif, `npm audit` mensuel
- [x] README d'exploitation à jour (déployer, secrets, contacts)

## 13. Clean code (13)
- [x] Noms explicites, 3 paramètres au plus
- [x] Fonctions courtes à une seule responsabilité
- [x] Retours anticipés, 3 niveaux d'imbrication au maximum
- [x] Aucun nombre ou texte magique, constantes nommées
- [x] Commentaires = pourquoi, aucun code mort ni code commenté (knip)
- [x] Aucune erreur avalée, messages d'erreur avec contexte
- [x] DRY à la troisième répétition (jscpd), sans abstraction prématurée
- [x] YAGNI : rien écrit pour plus tard, le plus simple qui marche
- [x] Règles ESLint de complexité actives, appliquées par la CI
