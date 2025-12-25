# Module Faza'et-Ard (Investissements Agricoles)

## Vue d'ensemble
Le module Faza'et-Ard est un système de financement participatif (crowdfunding) permettant aux agriculteurs de créer des projets d'investissement et aux investisseurs de financer ces projets en échange de rendements prévisibles.

## Backend (NestJS)

### Entités

#### 1. InvestmentProject
Représente un projet d'investissement créé par un agriculteur.

**Champs principaux:**
- `title`: Titre du projet
- `description`: Description détaillée
- `targetAmount`: Montant cible à collecter
- `currentAmount`: Montant actuellement collecté
- `minimumInvestment`: Investissement minimum requis
- `expectedROI`: Retour sur investissement attendu (%)
- `duration`: Durée du projet (en mois)
- `category`: Catégorie (Olives, Greenhouse, Livestock, etc.)
- `location`: Localisation géographique
- `status`: Statut ('active', 'funded', 'closed')
- `images`: URLs des images du projet
- `ownerId`: ID du propriétaire du projet

#### 2. Investment
Représente un investissement individuel dans un projet.

**Champs principaux:**
- `amount`: Montant investi
- `projectId`: ID du projet
- `investorId`: ID de l'investisseur
- `returnsReceived`: Retours déjà reçus
- `createdAt`: Date de l'investissement

### API Endpoints

#### Projets
- `GET /investments/projects` - Liste tous les projets (avec filtres)
  - Query params: status, category, location, minAmount, maxAmount
  
- `GET /investments/projects/:id` - Détails d'un projet spécifique

- `GET /investments/projects/my` - Projets de l'utilisateur connecté (auth requise)

- `POST /investments/projects` - Créer un nouveau projet (auth requise)
  - Body: CreateProjectDto
  
- `PATCH /investments/projects/:id` - Modifier un projet (auth requise, owner only)
  - Body: UpdateProjectDto
  
- `DELETE /investments/projects/:id` - Supprimer un projet (auth requise, owner only)

#### Investissements
- `POST /investments/invest` - Investir dans un projet (auth requise)
  - Body: { projectId, amount }
  
- `GET /investments/my-investments` - Investissements de l'utilisateur (auth requise)

- `GET /investments/projects/:id/investments` - Liste des investissements pour un projet (auth requise)

- `GET /investments/projects/:id/investors` - Liste des investisseurs d'un projet (auth requise)

#### Statistiques
- `GET /investments/stats` - Statistiques globales de l'utilisateur (auth requise)
  - Retourne: total investi, retours reçus, projets actifs, etc.

### DTOs

#### CreateProjectDto
```typescript
{
  title: string;
  description: string;
  targetAmount: number;
  minimumInvestment: number;
  expectedROI: number;
  duration: number;
  category: string;
  location: string;
  images?: string[];
}
```

#### CreateInvestmentDto
```typescript
{
  projectId: number;
  amount: number;
}
```

### Services

**InvestmentsService** fournit:
- Gestion CRUD des projets
- Validation des investissements
- Calcul automatique des montants collectés
- Changement automatique du statut (active → funded)
- Calcul des statistiques utilisateur

### Validation

- Montant minimum d'investissement respecté
- Pas de sur-financement (ne peut pas dépasser targetAmount)
- Seuls les projets "active" acceptent des investissements
- Seul le propriétaire peut modifier/supprimer son projet

## Frontend (Next.js)

### Pages créées

#### 1. `/investments` (app/investments/page.tsx)
Page principale affichant la liste des projets d'investissement.

**Fonctionnalités:**
- Titre et description du module
- Bouton "Créer un Projet" (redirige vers /investments/create)
- Composant InvestmentsClient pour afficher les projets

#### 2. `/investments/create` (app/investments/create/page.tsx)
Formulaire de création de projet d'investissement.

**Fonctionnalités:**
- Authentification requise (redirection vers /login si non connecté)
- Formulaire complet avec validation
- Champs:
  - Titre du projet
  - Description (textarea)
  - Montant total cible
  - Investissement minimum
  - ROI attendu (%)
  - Durée (mois)
  - Catégorie (select)
  - Localisation
  - Images (URLs séparées par virgules)
- Gestion des erreurs et succès
- Redirection vers le projet créé après succès

#### 3. `/investments/[id]` (app/investments/[id]/page.tsx)
Page de détails d'un projet avec formulaire d'investissement.

**Fonctionnalités:**
- Affichage complet du projet:
  - Images (ou placeholder)
  - Titre, catégorie, localisation, durée
  - Barre de progression du financement
  - Description détaillée
  - Statistiques (ROI, montant minimum, restant, nombre d'investisseurs)
- Sidebar d'investissement:
  - Formulaire d'investissement avec montant
  - Calcul en temps réel du retour estimé
  - Validation du montant minimum
  - Gestion des erreurs
- Liste des investissements récents
- Informations sur le propriétaire du projet
- Bouton retour vers la liste

### Composant

#### InvestmentsClient (app/investments/InvestmentsClient.tsx)
Composant client-side pour afficher et filtrer les projets.

**Fonctionnalités:**
- Récupération des projets depuis l'API backend
- Filtres interactifs:
  - Recherche par texte
  - Localisation
  - Catégorie (Tous, Olives, Serre, Élevage, etc.)
- Affichage en grille responsive
- Cards de projets avec:
  - Image ou placeholder
  - Titre et description courte
  - Barre de progression
  - Montant cible et collecté
  - ROI et durée
  - Localisation
  - Boutons "Voir Détails" et "Investir"
- États de chargement et erreur
- Message si aucun projet trouvé

### Intégration API

Toutes les pages utilisent `API_BASE_URL` depuis `/src/api-config.js` qui pointe vers `http://localhost:5000`.

### Authentification

- Les pages protégées vérifient le token JWT dans localStorage
- Redirection automatique vers /login si non authentifié
- Header Authorization: Bearer {token} dans les requêtes

## Architecture de Base de Données

Tables créées automatiquement par TypeORM:
- `investment_project`: Stocke les projets d'investissement
- `investment`: Stocke les investissements individuels

Relations:
- User ↔ InvestmentProject (one-to-many, owner)
- User ↔ Investment (one-to-many, investor)
- InvestmentProject ↔ Investment (one-to-many)

## Flux Utilisateur

### Pour un Agriculteur (Créateur de Projet)
1. Se connecter
2. Aller sur /investments
3. Cliquer sur "Créer un Projet"
4. Remplir le formulaire de création
5. Suivre la progression du financement
6. Recevoir les fonds une fois l'objectif atteint

### Pour un Investisseur
1. Se connecter
2. Parcourir les projets sur /investments
3. Filtrer par catégorie, localisation, etc.
4. Cliquer sur un projet pour voir les détails
5. Entrer un montant d'investissement
6. Confirmer l'investissement
7. Suivre ses investissements via GET /investments/my-investments

## Tests

### Backend
Démarrer le serveur: `npm run start:dev`
Le serveur écoute sur `http://localhost:5000`

### Frontend
Démarrer le serveur: `npm run dev`
L'application est accessible sur `http://localhost:3000`

### Endpoints à tester

1. **Lister les projets** (public)
   ```
   GET http://localhost:5000/investments/projects
   ```

2. **Créer un projet** (auth requise)
   ```
   POST http://localhost:5000/investments/projects
   Headers: Authorization: Bearer {token}
   Body: {
     "title": "Projet Olive Bio",
     "description": "Extension d'oliviers biologiques...",
     "targetAmount": 50000,
     "minimumInvestment": 1000,
     "expectedROI": 12,
     "duration": 24,
     "category": "Olives",
     "location": "Sfax"
   }
   ```

3. **Investir** (auth requise)
   ```
   POST http://localhost:5000/investments/invest
   Headers: Authorization: Bearer {token}
   Body: {
     "projectId": 1,
     "amount": 5000
   }
   ```

4. **Voir mes statistiques** (auth requise)
   ```
   GET http://localhost:5000/investments/stats
   Headers: Authorization: Bearer {token}
   ```

## Améliorations Futures Possibles

1. **Upload d'images**: Intégrer le système d'upload pour les images de projets
2. **Notifications**: Alertes email/SMS pour nouveaux investissements
3. **Tableau de bord**: Dashboard détaillé pour propriétaires et investisseurs
4. **Documents**: Upload de business plans, prévisions financières
5. **Paiements**: Intégration d'une passerelle de paiement (Stripe, PayPal)
6. **Updates**: Système de mise à jour de progression pour les projets
7. **Messages**: Chat entre investisseurs et propriétaires
8. **Vérification**: Validation manuelle des projets par admin
9. **Rapports**: Génération de rapports financiers
10. **Exports**: Export CSV/PDF des investissements

## Conformité et Sécurité

- ✅ Authentification JWT pour toutes les opérations sensibles
- ✅ Validation des données côté serveur
- ✅ Protection contre les injections SQL (TypeORM)
- ✅ Validation des montants et limites
- ✅ Contrôle des autorisations (seul le propriétaire peut modifier)
- ⚠️ TODO: Implémenter rate limiting
- ⚠️ TODO: Ajouter HTTPS en production
- ⚠️ TODO: Conformité légale pour le financement participatif

## Conclusion

Le module Faza'et-Ard est maintenant complet et fonctionnel avec:
- ✅ Backend NestJS avec API REST complète
- ✅ Base de données avec relations appropriées
- ✅ Frontend Next.js avec 3 pages principales
- ✅ Système d'authentification intégré
- ✅ Validation et gestion des erreurs
- ✅ Interface utilisateur responsive et intuitive

Le module est prêt pour les tests et peut être étendu selon les besoins futurs.
