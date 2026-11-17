# Ton Espace Voyage — app Bali (reconstruite)

Code frontend récupéré depuis le bundle public de https://wv4ekz4vx6.zite.so/ (titre Zite : "Progressive Dashboard").

## Lancer

```bash
npm install
npm run dev
```

## Structure

- `src/main.tsx` — point d'entrée (React Query + ErrorBoundary)
- `src/App.tsx` — routeur : chargement / login / reset / app
- `src/contexts/AuthContext.tsx` — session (localStorage/sessionStorage, clé `tev_session_v2`)
- `src/api/workflows.ts` — appels aux workflows backend Zite
- `src/views/LoginView.tsx` — email → créer mot de passe / login / mot de passe oublié / reset
- `src/views/DashboardView.tsx` — accueil, progression checklist, 9 tuiles
- `src/views/ChecklistView.tsx` — checklist 22 items, sauvegarde debounce 900 ms
- `src/views/InfoView.tsx` — pages info (paragraphes, listes, tags, liens, grille)
- `src/data/content.ts` — tout le contenu (tuiles, checklist, 8 pages info)
- `src/index.css` — thème (vert `164 61% 26%`, police Inter)

## Ce qui N'EST PAS récupérable depuis le bundle

Les workflows backend tournent sur les serveurs Zite/Fillout. Leur code n'est pas dans le JS public.
À recréer (ou à copier depuis l'éditeur Zite) :

| Workflow | Entrée | Sortie attendue |
|---|---|---|
| `authCheckEmail` | `{ email }` | `{ status: "not_found" \| "no_password" \| "has_password" }` |
| `authSetPassword` | `{ email, password }` | `{ userId, firstName, sessionToken }` |
| `authLogin` | `{ email, password }` | `{ userId, firstName, sessionToken }` |
| `authForgotPassword` | `{ email }` | envoie un email avec lien `?reset=<token>` (valable 1 h) |
| `authResetPassword` | `{ resetToken, newPassword }` | `{ email, userId, firstName, sessionToken }` |
| `authVerifySession` | `{ sessionToken }` | `{ valid, email, userId, firstName }` |
| `getChecklist` | `{ sessionToken }` | `{ checkedItems: number[] }` |
| `updateChecklist` | `{ sessionToken, checkedItems: number[] }` | `{ ok }` |

Table utilisateurs implicite : email (liste blanche), mot de passe hashé, prénom, token de session, token de reset, items cochés.
