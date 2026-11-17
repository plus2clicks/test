# Ton Espace Voyage

App mobile-first pour des voyageurs partant à Bali : login par email (liste blanche dans la table Voyageurs) + mot de passe,
tableau de bord avec progression, checklist de 22 tâches sauvegardée par voyageur, 8 pages d'infos (Formalités, Argent,
Internet, Applis, Transports, Valise, Santé, Urgence) et un lien vers une carte Google My Maps.

- Auth maison (pas zitejs/auth) : `src/api/auth*.ts`, helpers dans `src/lib/auth.ts`, sessions stockées dans Voyageurs.sessionToken.
- Contenu éditorial : `src/data/content.ts`.
- Pour autoriser un voyageur : ajouter une ligne dans la table Voyageurs avec son email (et prénom).
