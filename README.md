# 🚀 GreenConnect 
## 🧱 Choix du framework
**Front-end :** Next.js\
**Back-end :** NestJS\
**Base de données :** PostgreSQL

------------------------------------------------------------------------

## ✨ Fonctionnalités développées

-   login\
-   register\
-   view profile\
-   add product\
-   view product's detail\
-   add a product to panier\
-   view the owner of the post\
-   Module Market Place\
-   About\
-   Contact\
-   ...
------------------------------------------------------------------------
# 📌 Étapes de lancement du projet GreenConnect

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
