import * as admin from 'firebase-admin';

class FirebaseService {
  private static instance: FirebaseService;
  private db: admin.firestore.Firestore | null = null;
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public initialize(): void {
    if (this.initialized) {
      return;
    }

    try {
      // Check if Firebase credentials are provided
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

      if (!serviceAccount) {
        console.warn('⚠️  Firebase not configured. Using in-memory storage only.');
        console.warn('💡 To enable Firebase: Set FIREBASE_SERVICE_ACCOUNT environment variable');
        this.initialized = false;
        return;
      }

      // Parse service account
      const credentials = JSON.parse(serviceAccount);

      // Initialize Firebase Admin
      admin.initializeApp({
        credential: admin.credential.cert(credentials)
      });

      this.db = admin.firestore();
      this.initialized = true;

      console.log('✅ Firebase Firestore initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase:', error);
      console.warn('⚠️  Continuing with in-memory storage only');
      this.initialized = false;
    }
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public getDb(): admin.firestore.Firestore | null {
    return this.db;
  }

  // Collections references
  public getPlayersCollection() {
    if (!this.db) return null;
    return this.db.collection('players');
  }

  public getPlayerStatsCollection() {
    if (!this.db) return null;
    return this.db.collection('player_stats');
  }

  public getGamesCollection() {
    if (!this.db) return null;
    return this.db.collection('games');
  }

  public getGameHistoryCollection() {
    if (!this.db) return null;
    return this.db.collection('game_history');
  }
}

export const firebaseService = FirebaseService.getInstance();
