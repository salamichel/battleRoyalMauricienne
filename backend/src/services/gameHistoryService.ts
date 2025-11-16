import { Game, Player } from '../models/Card';
import { firebaseService } from '../database/firebase';

interface GameHistoryEntry {
  gameId: string;
  players: {
    pseudo: string;
    heroName: string;
    heroId: string;
    finalHp: number;
    isWinner: boolean;
    isAlive: boolean;
  }[];
  winner: {
    pseudo: string;
    heroName: string;
  };
  totalTurns: number;
  duration: number; // in milliseconds
  createdAt: Date;
  endedAt: Date;
}

export class GameHistoryService {
  private static gameHistory: GameHistoryEntry[] = [];

  // Save game to history
  static async saveGameToHistory(game: Game): Promise<void> {
    if (game.status !== 'finished' || !game.winner) {
      return;
    }

    const endedAt = new Date();
    const duration = endedAt.getTime() - new Date(game.createdAt).getTime();

    const historyEntry: GameHistoryEntry = {
      gameId: game.id,
      players: game.players.map(player => ({
        pseudo: player.pseudo,
        heroName: player.hero.name,
        heroId: player.hero.id,
        finalHp: player.hp,
        isWinner: player.id === game.winner?.id,
        isAlive: player.isAlive
      })),
      winner: {
        pseudo: game.winner.pseudo,
        heroName: game.winner.hero.name
      },
      totalTurns: game.turn,
      duration,
      createdAt: new Date(game.createdAt),
      endedAt
    };

    // Save to Firebase
    if (firebaseService.isInitialized()) {
      try {
        const collection = firebaseService.getGameHistoryCollection();
        if (collection) {
          await collection.doc(game.id).set({
            gameId: historyEntry.gameId,
            players: historyEntry.players,
            winner: historyEntry.winner,
            totalTurns: historyEntry.totalTurns,
            duration: historyEntry.duration,
            createdAt: historyEntry.createdAt,
            endedAt: historyEntry.endedAt
          });
          console.log(`✅ Game ${game.id.substring(0, 8)} saved to history`);
        }
      } catch (error) {
        console.error('Error saving game to Firebase history:', error);
      }
    }

    // Also save to in-memory (for fallback)
    this.gameHistory.push(historyEntry);

    // Keep only last 1000 games in memory
    if (this.gameHistory.length > 1000) {
      this.gameHistory.shift();
    }
  }

  // Get recent games
  static async getRecentGames(limit: number = 10): Promise<GameHistoryEntry[]> {
    // Try Firebase first
    if (firebaseService.isInitialized()) {
      try {
        const collection = firebaseService.getGameHistoryCollection();
        if (collection) {
          const snapshot = await collection
            .orderBy('endedAt', 'desc')
            .limit(limit)
            .get();

          const games: GameHistoryEntry[] = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            games.push({
              gameId: data.gameId,
              players: data.players,
              winner: data.winner,
              totalTurns: data.totalTurns,
              duration: data.duration,
              createdAt: data.createdAt?.toDate() || new Date(),
              endedAt: data.endedAt?.toDate() || new Date()
            });
          });

          return games;
        }
      } catch (error) {
        console.error('Error fetching game history from Firebase:', error);
      }
    }

    // Fallback to in-memory
    return this.gameHistory
      .sort((a, b) => b.endedAt.getTime() - a.endedAt.getTime())
      .slice(0, limit);
  }

  // Get player's game history
  static async getPlayerGameHistory(pseudo: string, limit: number = 10): Promise<GameHistoryEntry[]> {
    // Try Firebase first
    if (firebaseService.isInitialized()) {
      try {
        const collection = firebaseService.getGameHistoryCollection();
        if (collection) {
          const snapshot = await collection
            .where('players', 'array-contains-any', [{ pseudo }])
            .orderBy('endedAt', 'desc')
            .limit(limit)
            .get();

          const games: GameHistoryEntry[] = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            // Filter to only games where this player participated
            if (data.players.some((p: any) => p.pseudo === pseudo)) {
              games.push({
                gameId: data.gameId,
                players: data.players,
                winner: data.winner,
                totalTurns: data.totalTurns,
                duration: data.duration,
                createdAt: data.createdAt?.toDate() || new Date(),
                endedAt: data.endedAt?.toDate() || new Date()
              });
            }
          });

          return games;
        }
      } catch (error) {
        console.error('Error fetching player game history from Firebase:', error);
      }
    }

    // Fallback to in-memory
    return this.gameHistory
      .filter(game => game.players.some(p => p.pseudo === pseudo))
      .sort((a, b) => b.endedAt.getTime() - a.endedAt.getTime())
      .slice(0, limit);
  }
}
