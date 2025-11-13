import { Player, PlayerStats, Hero } from '../models/Card';
import { v4 as uuidv4 } from 'uuid';

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
  static getPlayerStats(pseudo: string): PlayerStats | null {
    return this.playerStats.get(pseudo) || null;
  }

  // Update player stats
  static updatePlayerStats(pseudo: string, won: boolean, damageDealt: number, heroId: string): void {
    let stats = this.playerStats.get(pseudo);

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

    stats.gamesPlayed++;
    if (won) {
      stats.gamesWon++;
    } else {
      stats.gamesLost++;
    }
    stats.totalDamageDealt += damageDealt;
    stats.lastPlayed = new Date();

    this.playerStats.set(pseudo, stats);
  }

  // Get all player stats (for leaderboard)
  static getAllPlayerStats(): PlayerStats[] {
    return Array.from(this.playerStats.values())
      .sort((a, b) => b.gamesWon - a.gamesWon);
  }
}
