
# 🚀 GreenConnect

GreenConnect est une plateforme web agricole tunisienne composée de deux dossiers :
- **backend/** : API NestJS (Node.js)
- **front-end/** : Application Next.js (React)

---

## 🏗️ Architecture du projet

```
GreenConnect/
├── backend/      # API REST NestJS
└── front-end/    # Application Next.js
```

---

## ✨ Fonctionnalités du projet

- Authentification (login, register, reset-password)
- Gestion de profil utilisateur
- Ajout, modification et consultation de produits
- Module Market Place (affichage, recherche, filtrage)
- Gestion du panier (ajout, suppression, validation)
- Système d’investissement (ajout, suivi, historique)
- Tableau de bord (statistiques, résumé d’activité)
- Notifications (alertes, messages)
- Gestion des commandes
- Gestion des livraisons
- Sécurité (JWT, gardes, validation)
- ... (toutes les autres fonctionnalités présentes dans le code)

---

## 📦 Prérequis à installer

Avant de commencer, installez sur votre machine :
- **Node.js** (version 18 ou plus) : https://nodejs.org/
- **npm** (installé avec Node.js)
- **PostgreSQL** (version 14 ou plus) : https://www.postgresql.org/download/
- **NestJS CLI** (global) :
    ```
    npm install -g @nestjs/cli
    ```

---

## 📂 Installation des dépendances

### Backend
Dans le dossier `backend` :
```
cd backend
npm install
```
Principales dépendances : @nestjs/*, typeorm, pg, bcrypt, passport, multer, class-validator, etc.

### Frontend
Dans le dossier `front-end` :
```
cd front-end
npm install
```
Principales dépendances : next, react, react-dom, tailwindcss, framer-motion, lucide-react, swiper, etc.

---

## ⚙️ Configuration des variables d'environnement

### Backend
Créer un fichier `.env` dans `backend` :
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=VotreMotDePasse
DATABASE_NAME=greeenconnect
```

### Frontend
Si besoin, créer un fichier `.env.local` dans `front-end` pour les variables spécifiques (API URL, etc.)

---

## 🗄️ Base de données

Créer la base PostgreSQL :
```sql
CREATE DATABASE greeenconnect;
```

---

## 🚦 Lancement du projet

1. Cloner le repo (ou copier les dossiers backend et front-end)
2. Installer les dépendances dans chaque dossier
3. Configurer les fichiers `.env`
4. Créer la base de données
5. Démarrer le backend :
        ```
        cd backend
        npm run start:dev
        ```
6. Démarrer le frontend :
        ```
        cd front-end
        npm run dev
        ```

Le frontend sera accessible sur : http://localhost:3000
Le backend sur : http://localhost:5000

---

## 📚 Documentation rapide

- **backend/** : API NestJS, structure modulaire (auth, users, products, investments, orders, cart, notifications, etc.)
- **front-end/** : Next.js, pages et composants React, TailwindCSS pour le style

Pour plus de détails, consultez les fichiers README dans chaque dossier si disponibles.

## 📦 Prérequis et dépendances nécessaires

Avant de démarrer le backend, assurez-vous d'avoir installé :

### Outils système
- **Node.js** (version 18 ou plus)  
    https://nodejs.org/
- **npm** (installé avec Node.js)
- **PostgreSQL** (version 14 ou plus)  
    https://www.postgresql.org/download/
- **NestJS CLI** (interface en ligne de commande NestJS)
    ```bash
    npm install -g @nestjs/cli
    ```

### Dépendances Node.js (installées automatiquement)
Dans le dossier `backend`, exécutez :
```bash
npm install
```
Cela installera toutes les dépendances listées dans `package.json`, notamment :

**Principales dépendances :**
- @nestjs/common, @nestjs/core, @nestjs/jwt, @nestjs/passport, @nestjs/typeorm, @nestjs/platform-express, @nestjs/serve-static
- bcrypt, class-transformer, class-validator, multer, passport, passport-jwt, pg, reflect-metadata, rxjs, sqlite3, typeorm, uuid

**Dépendances de développement :**
- @nestjs/cli, @nestjs/schematics, @nestjs/testing, @types/*, eslint, prettier, jest, ts-jest, ts-node, typescript, etc.

Vous n'avez rien à installer manuellement à part le NestJS CLI, tout le reste est géré par `npm install`.

## 1️⃣ Prérequis à installer
Avant de lancer le projet, assurez-vous d'avoir installé :
✔ **Node.js** (version 18 ou plus)\
🔗 https://nodejs.org/

✔ **PostgreSQL** (version 14 ou plus)\
🔗 https://www.postgresql.org/download/

✔ **npm** (installé avec Node)\
Vérifier :
``` bash
node -v
npm -v
```
✔ **NestJS CLI** (si pas installé)
``` bash
npm install -g @nestjs/cli
```
------------------------------------------------------------------------

## 2️⃣ Cloner le projet depuis GitHub

``` bash
git clone (lien)
cd (....)
```
------------------------------------------------------------------------

## 3️⃣ Installation des dépendances
### 📌 Backend

``` bash
cd backend
npm install
```

### 📌 Frontend

``` bash
cd ../frontend
npm install
```
------------------------------------------------------------------------

## 4️⃣ Configuration des variables d'environnement (Backend)

Dans le dossier **backend**, créer un fichier :
    .env
Y ajouter :

    DATABASE_HOST=localhost
    DATABASE_PORT=5432
    DATABASE_USER=postgres
    DATABASE_PASSWORD=VotreMotDePasse
    DATABASE_NAME=greeenconnect

------------------------------------------------------------------------

## 5️⃣ Créer la base de données PostgreSQL

Dans pgAdmin ou dans le terminal PostgreSQL :

``` sql
CREATE DATABASE greeenconnect;
```

------------------------------------------------------------------------

## 6️⃣ Lancer le backend (NestJS)

Dans le dossier **backend** :

``` bash
npm run start:dev
```

------------------------------------------------------------------------

## 7️⃣ Lancer le frontend (Next.js)

Dans le dossier **frontend** :

``` bash
npm run dev
```

Le frontend démarre sur :\
👉 http://localhost:3000
------------------------------------------------------------------------

## 8️⃣ Backend / Frontend : Connexion API
Le frontend accède au backend via :\
👉 http://localhost:5000
