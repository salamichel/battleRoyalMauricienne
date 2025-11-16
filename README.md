# 🎮 Battle Royale Mauricienne

Un jeu de cartes multijoueur inspiré de Magic: The Gathering et Hearthstone, avec un mode Battle Royale jusqu'à 9 joueurs simultanés. Thème culturel mauricien/créole.

## 📋 Caractéristiques

- **Battle Royale Multijoueur**: 2 à 9 joueurs simultanés
- **50+ Cartes**: 10 héros (9 héros + 1 vilain), 25 créatures, 15 sorts, 10 équipements
- **Temps Réel**: Communication WebSocket via Socket.io
- **Interface Moderne**: React 18 + TypeScript + Tailwind CSS
- **Architecture Containerisée**: Docker + Docker Compose
- **Thème Mauricien**: Héros et créatures inspirés de la culture mauricienne

## 🛠️ Stack Technique

### Backend
- Node.js 18+
- Express
- Socket.io
- TypeScript

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Socket.io Client

### Infrastructure
- Docker
- Docker Compose

## 🚀 Installation et Démarrage Rapide

### Prérequis
- Docker et Docker Compose installés
- Ports 3000 et 3001 disponibles

### Lancement avec Docker (Recommandé)

1. **Cloner le repository**
```bash
git clone <repository-url>
cd battleRoyalMauricienne
```

2. **Créer le fichier .env** (optionnel)
```bash
cp .env.example .env
```

3. **Démarrer l'application**
```bash
docker-compose up --build
```

4. **Accéder à l'application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

### Lancement en développement local (sans Docker)

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend (dans un autre terminal)
```bash
cd frontend
npm install
npm start
```

## 🎯 Comment Jouer

### 1. Sélection du Héros
- Choisissez votre héros parmi 10 personnages uniques
- Entrez votre pseudo (max 20 caractères)
- Option pour afficher/masquer les vilains

### 2. Lobby
- Créez une nouvelle partie OU
- Rejoignez une partie existante (max 9 joueurs)
- Consultez le classement des meilleurs joueurs 🏆

### 3. Salle d'Attente
- Attendez les autres joueurs (minimum 2 joueurs requis)
- Le créateur de la partie peut démarrer quand prêt

### 4. Jeu
- **Objectif**: Être le dernier joueur en vie
- **Deck**: 30 cartes générées automatiquement
- **Main de départ**: 3 cartes
- **Mana**: Commence à 1, +1 par tour (max 10)

#### Déroulement d'un tour:
1. Début: +1 mana max, régénération complète, piocher 1 carte
2. Phase principale: Jouer des cartes, équiper des objets
3. Phase de combat: Attaquer avec vos créatures
4. Fin: Utiliser les capacités, terminer le tour

### 5. Combat
- Attaque = max(0, Attaque_attaquant - Défense_cible)
- Créatures ne peuvent pas attaquer le tour où elles sont invoquées
- Dernier survivant gagne (ou joueur avec le plus de HP après 30 tours)

### 6. Classement (Leaderboard)
- Consultez le **Top 50 des meilleurs joueurs**
- Visualisez vos statistiques : victoires, parties jouées, taux de victoire
- Parcourez les **20 dernières parties** terminées
- Voyez qui a gagné et quels héros ont été utilisés

## 🃏 Types de Cartes

### Héros (10)
Exemples: Sylvanus, Purbhoo, Rughoobin, Narasimlu, Beerachee, Gangaram, Bagelloo, Gopee, Bonne, Lagrosse (vilain)

Chaque héros a:
- Points de vie uniques
- Statistiques d'attaque/défense
- Capacité spéciale unique

### Créatures (25)
- **Communes** (1-3 mana): Ti-Koulèr, Zanfan Lari, Pêcheur Lontan...
- **Rares** (4-5 mana): Chasseur Montagne, Danseur Séga, Pirogue Rapide...
- **Épiques** (6-7 mana): Esprit Forêt, Guerrier Marron, Chamane Kreol...
- **Légendaires** (8-10 mana): Dragon Volcan, Reine des Mers

### Sorts (15)
Effets instantanés: Boule de Feu, Soin Rapide, Bouclier Magique, Tempête de Sable, etc.

### Équipements (10)
Bonus permanents: Épée Rouillée, Armure Légère, Bouclier Robuste, Lame Enchantée, etc.

## 📁 Structure du Projet

```
battleRoyalMauricienne/
├── docker-compose.yml
├── .env.example
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts
│       ├── models/
│       │   └── Card.ts
│       ├── data/
│       │   ├── heroes.ts
│       │   ├── creatures.ts
│       │   ├── spells.ts
│       │   └── equipment.ts
│       ├── services/
│       │   ├── gameService.ts
│       │   └── playerService.ts
│       └── socket/
│           └── gameSocket.ts
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.js
    └── src/
        ├── App.tsx
        ├── index.tsx
        ├── types/
        │   └── index.ts
        ├── services/
        │   └── socketService.ts
        └── components/
            ├── Lobby/
            │   ├── HeroSelection.tsx
            │   ├── Lobby.tsx
            │   └── WaitingRoom.tsx
            ├── Game/
            │   ├── Board.tsx
            │   └── GameOver.tsx
            └── Cards/
                └── Card.tsx
```

## 🔧 Développement

### Ajouter de Nouvelles Cartes

#### Backend
Modifiez les fichiers dans `backend/src/data/`:
- `heroes.ts` - Nouveaux héros
- `creatures.ts` - Nouvelles créatures
- `spells.ts` - Nouveaux sorts
- `equipment.ts` - Nouveaux équipements

#### Format des cartes
Consultez les interfaces TypeScript dans `backend/src/models/Card.ts`

### Modifier la Logique de Jeu
Fichier principal: `backend/src/services/gameService.ts`

### Personnaliser l'Interface
- Composants React: `frontend/src/components/`
- Styles: `frontend/src/index.css` et Tailwind classes

## 🐛 Débogage

### Vérifier les logs Docker
```bash
# Tous les services
docker-compose logs -f

# Backend uniquement
docker-compose logs -f backend

# Frontend uniquement
docker-compose logs -f frontend
```

### Redémarrer les services
```bash
docker-compose restart
```

### Reconstruire après modifications
```bash
docker-compose down
docker-compose up --build
```

### Problèmes courants

**Erreur de connexion Socket.io**
- Vérifiez que le backend est démarré
- Vérifiez l'URL dans `.env` ou `REACT_APP_BACKEND_URL`
- Vérifiez les CORS dans `backend/src/server.ts`

**Port déjà utilisé**
- Changez les ports dans `docker-compose.yml`
- Ou arrêtez le processus utilisant le port

**Modifications non prises en compte**
- Les volumes Docker synchronisent automatiquement
- Si nécessaire, reconstruisez: `docker-compose up --build`

## 🔥 Firebase & Persistance

### Configuration Firebase (Optionnel)

Par défaut, le jeu utilise un stockage en mémoire (les données sont perdues au redémarrage). Pour activer la persistance avec Firebase Firestore :

#### 1. Créer un Projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Créez un nouveau projet
3. Activez **Firestore Database** (mode production ou test)

#### 2. Générer la Clé de Service

1. Dans Firebase Console, allez dans **Paramètres du projet** (⚙️)
2. Onglet **Comptes de service**
3. Cliquez sur **Générer une nouvelle clé privée**
4. Un fichier JSON sera téléchargé

#### 3. Configurer l'Environnement

**Option A: Variable d'environnement (Recommandé)**
```bash
# Créer un fichier .env à la racine
echo 'FIREBASE_SERVICE_ACCOUNT=<contenu du JSON sur une ligne>' > .env
```

**Option B: Docker Compose**
```yaml
# Dans docker-compose.yml, ajouter sous backend > environment:
- FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

**Note importante**: Le JSON doit être sur une seule ligne. Remplacez les retours à la ligne par `\n` dans les clés privées.

#### 4. Redémarrer l'Application
```bash
docker-compose down
docker-compose up --build
```

### Fonctionnalités avec Firebase

Une fois configuré, Firebase Firestore sauvegarde automatiquement :

✅ **Statistiques des joueurs**
- Nombre de parties jouées
- Victoires et défaites
- Taux de victoire
- Héros favori
- Dégâts totaux infligés

✅ **Historique des parties**
- 20 dernières parties terminées
- Gagnant et participants
- Durée et nombre de tours
- Héros utilisés

✅ **Classement (Leaderboard)**
- Top 50 des meilleurs joueurs
- Tri par victoires
- Persistance des données entre sessions

### Collections Firestore

Le jeu crée automatiquement ces collections :

- `player_stats` - Statistiques des joueurs
- `game_history` - Historique des parties terminées

### Mode Sans Firebase

Sans configuration Firebase :
- ✅ Le jeu fonctionne normalement
- ✅ Classement disponible (en mémoire)
- ⚠️ Données perdues au redémarrage
- 💡 Idéal pour tests et développement

## 🎨 Personnalisation

### Thème de Couleurs
Modifier `frontend/tailwind.config.js`:
```js
colors: {
  primary: { ... },
  secondary: { ... }
}
```

### Règles de Jeu
Modifier les constantes dans `backend/src/services/gameService.ts`:
- Nombre de cartes initiales
- Mana de départ
- Limite de mana maximale
- Durée maximale (tours)

## 📊 API Socket.io

### Événements Client → Serveur
- `join_lobby` - Rejoindre le lobby
- `get_heroes` - Obtenir la liste des héros
- `get_leaderboard` - Obtenir le classement
- `get_recent_games` - Obtenir les parties récentes
- `create_game` - Créer une partie
- `join_game` - Rejoindre une partie
- `start_game` - Démarrer la partie
- `game_action` - Effectuer une action de jeu
- `leave_game` - Quitter une partie

### Événements Serveur → Client
- `lobby_games` - Liste des parties disponibles
- `leaderboard_data` - Données du classement
- `recent_games_data` - Parties récentes
- `game_created` - Partie créée
- `player_joined` - Joueur a rejoint
- `game_started` - Partie démarrée
- `game_state_updated` - État du jeu mis à jour
- `game_ended` - Partie terminée

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer:

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

MIT License - Voir le fichier LICENSE pour plus de détails

## 👥 Auteurs

Projet développé pour la communauté mauricienne

## 🙏 Remerciements

- Inspiration: Magic: The Gathering, Hearthstone
- Culture mauricienne/créole pour les thèmes des cartes

---

**Bon jeu! 🎮🏝️**
