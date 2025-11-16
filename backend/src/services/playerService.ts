import { Player, PlayerStats, Hero } from '../models/Card';
import { v4 as uuidv4 } from 'uuid';
import { firebaseService } from '../database/firebase';

export class PlayerService {
  private static playerStats: Map<string, PlayerStats> = new Map();

  // Create a new player
  static createPlayer(socketId: string, pseudo: string, hero: Hero): Player {
    const player: Player = {
      id: uuidv4(),
      socketId,
      pseudo,
      hero: { ...hero }, // Clone hero to avoid shared references
      deck: [],
      hand: [],
      board: [],
      graveyard: [],
      equipment: [],
      mana: 0,
      maxMana: 0,
      hp: hero.maxHp,
      isAlive: true,
      usedAbilityThisTurn: false
    };

    return player;
  }

  // Get player stats
  static async getPlayerStats(pseudo: string): Promise<PlayerStats | null> {
    // Try Firebase first
    if (firebaseService.isInitialized()) {
      try {
        const collection = firebaseService.getPlayerStatsCollection();
        if (collection) {
          const doc = await collection.doc(pseudo).get();
          if (doc.exists) {
            const data = doc.data();
            return {
              pseudo: data?.pseudo,
              gamesPlayed: data?.gamesPlayed || 0,
              gamesWon: data?.gamesWon || 0,
              gamesLost: data?.gamesLost || 0,
              totalDamageDealt: data?.totalDamageDealt || 0,
              favoriteHero: data?.favoriteHero || '',
              lastPlayed: data?.lastPlayed?.toDate() || new Date()
            };
          }
        }
      } catch (error) {
        console.error('Error fetching player stats from Firebase:', error);
      }
    }

    // Fallback to in-memory
    return this.playerStats.get(pseudo) || null;
  }

  // Update player stats
  static async updatePlayerStats(
    pseudo: string,
    won: boolean,
    damageDealt: number,
    heroId: string
  ): Promise<void> {
    // Get existing stats
    let stats = await this.getPlayerStats(pseudo);

    if (!stats) {
      stats = {
        pseudo,
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        totalDamageDealt: 0,
        favoriteHero: heroId,
        lastPlayed: new Date()
      };
    }

    // Update stats
    stats.gamesPlayed++;
    if (won) {
      stats.gamesWon++;
    } else {
      stats.gamesLost++;
    }
    stats.totalDamageDealt += damageDealt;
    stats.lastPlayed = new Date();

    // Save to Firebase
    if (firebaseService.isInitialized()) {
      try {
        const collection = firebaseService.getPlayerStatsCollection();
        if (collection) {
          await collection.doc(pseudo).set({
            pseudo: stats.pseudo,
            gamesPlayed: stats.gamesPlayed,
            gamesWon: stats.gamesWon,
            gamesLost: stats.gamesLost,
            totalDamageDealt: stats.totalDamageDealt,
            favoriteHero: stats.favoriteHero,
            lastPlayed: stats.lastPlayed
          });
          console.log(`✅ Stats saved to Firebase for ${pseudo}`);
        }
      } catch (error) {
        console.error('Error saving player stats to Firebase:', error);
      }
    }

    // Also save to in-memory (for fallback)
    this.playerStats.set(pseudo, stats);
  }

  // Get all player stats (for leaderboard)
  static async getAllPlayerStats(): Promise<PlayerStats[]> {
    // Try Firebase first
    if (firebaseService.isInitialized()) {
      try {
        const collection = firebaseService.getPlayerStatsCollection();
        if (collection) {
          const snapshot = await collection
            .orderBy('gamesWon', 'desc')
            .limit(100)
            .get();

          const stats: PlayerStats[] = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            stats.push({
              pseudo: data.pseudo,
              gamesPlayed: data.gamesPlayed || 0,
              gamesWon: data.gamesWon || 0,
              gamesLost: data.gamesLost || 0,
              totalDamageDealt: data.totalDamageDealt || 0,
              favoriteHero: data.favoriteHero || '',
              lastPlayed: data.lastPlayed?.toDate() || new Date()
            });
          });

          return stats;
        }
      } catch (error) {
        console.error('Error fetching leaderboard from Firebase:', error);
      }
    }

    // Fallback to in-memory
    return Array.from(this.playerStats.values())
      .sort((a, b) => b.gamesWon - a.gamesWon)
      .slice(0, 100);
  }

  // Get top players (for leaderboard display)
  static async getTopPlayers(limit: number = 10): Promise<PlayerStats[]> {
    const allStats = await this.getAllPlayerStats();
    return allStats.slice(0, limit);
  }

  // Calculate win rate
  static calculateWinRate(stats: PlayerStats): number {
    if (stats.gamesPlayed === 0) return 0;
    return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  }
}
