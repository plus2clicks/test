# zite-app — Ton Espace Voyage au format Zite (zitejs)

Dossier `apps/espace-voyage/` = l'app telle qu'elle doit vivre dans un workspace Zite :
frontend React dans `src/`, 8 workflows backend dans `src/api/` (un fichier = un workflow), helpers auth dans `src/lib/auth.ts`.

## Envoyer dans ton compte Zite

Clé API : app.zite.com → Settings → Developer.

```bash
ZITE_API_KEY=ta_cle node zite-push.js all
```

Le script : crée le workspace "Espace Voyage" → ouvre une session de build → crée la table `Voyageurs`
→ crée l'app (accès public) → écrit les fichiers → type-check → commit → attend le build → publie.
Chaque étape peut être relancée seule (`node zite-push.js check`), l'état est dans `.push-state.json`.

## Après publication

- Autoriser un voyageur : ajouter une ligne dans la table **Voyageurs** avec son email (+ prénom).
- "Mot de passe oublié" : le lien est généré et écrit dans les logs du workflow `authForgotPassword`.
  Pour l'envoyer par email, connecter l'intégration Email dans Zite et compléter le TODO du fichier.
