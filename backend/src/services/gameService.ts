import { v4 as uuidv4 } from 'uuid';
import { Game, Player, GameAction, Card, Creature, Equipment, Spell, Hero } from '../models/Card';
import { creatures } from '../data/creatures';
import { spells } from '../data/spells';
import { equipment } from '../data/equipment';

export class GameService {
  private static games: Map<string, Game> = new Map();

  // Create a new game
  static createGame(creatorId: string): Game {
    const game: Game = {
      id: uuidv4(),
      status: 'waiting',
      players: [],
      currentPlayerIndex: 0,
      turn: 1,
      winner: null,
      createdAt: new Date(),
      creatorId
    };

    this.games.set(game.id, game);
    return game;
  }

  // Get a game by ID
  static getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  // Get all games
  static getAllGames(): Game[] {
    return Array.from(this.games.values());
  }

  // Get available games (waiting status)
  static getAvailableGames(): Game[] {
    return Array.from(this.games.values()).filter(game => game.status === 'waiting');
  }

  // Add player to game
  static addPlayerToGame(gameId: string, player: Player): boolean {
    const game = this.games.get(gameId);
    if (!game || game.status !== 'waiting' || game.players.length >= 9) {
      return false;
    }

    // Generate deck for player
    player.deck = this.generateDeck();
    player.hand = [];
    player.board = [];
    player.graveyard = [];
    player.equipment = [];
    player.mana = 0;
    player.maxMana = 0;
    player.hp = player.hero.maxHp;
    player.isAlive = true;
    player.usedAbilityThisTurn = false;

    // Draw initial hand (3 cards)
    for (let i = 0; i < 3; i++) {
      this.drawCard(gameId, player.id, player);
    }

    game.players.push(player);
    return true;
  }

  // Remove player from game
  static removePlayerFromGame(gameId: string, playerId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    game.players = game.players.filter(p => p.id !== playerId);

    // Delete game if empty
    if (game.players.length === 0) {
      this.games.delete(gameId);
    }
  }

  // Start game
  static startGame(gameId: string): boolean {
    const game = this.games.get(gameId);
    if (!game || game.status !== 'waiting' || game.players.length < 2) {
      return false;
    }

    game.status = 'playing';
    game.turn = 1;
    game.currentPlayerIndex = 0;

    // Initialize first player's turn
    const firstPlayer = game.players[0];
    firstPlayer.maxMana = 1;
    firstPlayer.mana = 1;
    this.drawCard(gameId, firstPlayer.id);

    return true;
  }

  // Generate a random deck
  private static generateDeck(): Card[] {
    const deck: Card[] = [];

    // Add 10 random creatures
    for (let i = 0; i < 10; i++) {
      const randomCreature = creatures[Math.floor(Math.random() * creatures.length)];
      const creature: Creature = {
        ...randomCreature,
        id: uuidv4(), // Unique ID for each card instance
        hp: randomCreature.maxHp,
        canAttack: false,
        equipment: []
      };
      deck.push(creature);
    }

    // Add 10 random spells
    for (let i = 0; i < 10; i++) {
      const randomSpell = spells[Math.floor(Math.random() * spells.length)];
      const spell: Spell = {
        ...randomSpell,
        id: uuidv4()
      };
      deck.push(spell);
    }

    // Add 7 random equipment
    for (let i = 0; i < 7; i++) {
      const randomEquipment = equipment[Math.floor(Math.random() * equipment.length)];
      const eq: Equipment = {
        ...randomEquipment,
        id: uuidv4()
      };
      deck.push(eq);
    }

    // Shuffle deck
    return this.shuffleArray(deck);
  }

  // Shuffle array
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Draw a card
  static drawCard(gameId: string, playerId: string, player?: Player): boolean {
    const game = this.games.get(gameId);
    if (!game) return false;

    const targetPlayer = player || game.players.find(p => p.id === playerId);
    if (!targetPlayer || targetPlayer.deck.length === 0) return false;

    const card = targetPlayer.deck.shift();
    if (card) {
      targetPlayer.hand.push(card);
      return true;
    }
    return false;
  }

  // Process game action
  static processAction(gameId: string, action: GameAction): { success: boolean; message?: string } {
    const game = this.games.get(gameId);
    if (!game || game.status !== 'playing') {
      return { success: false, message: 'Game not found or not in playing state' };
    }

    const currentPlayer = game.players[game.currentPlayerIndex];
    if (currentPlayer.id !== action.playerId) {
      return { success: false, message: 'Not your turn' };
    }

    switch (action.type) {
      case 'play_card':
        return this.playCard(game, action.playerId, action.cardId);
      case 'attack':
        return this.attack(game, action.attackerId, action.targetId);
      case 'use_ability':
        return this.useAbility(game, action.playerId, action.abilityId, action.targetId);
      case 'equip':
        return this.equipItem(game, action.playerId, action.equipmentId, action.targetCreatureId);
      case 'end_turn':
        return this.endTurn(game);
      default:
        return { success: false, message: 'Unknown action type' };
    }
  }

  // Play a card
  private static playCard(game: Game, playerId: string, cardId: string): { success: boolean; message?: string } {
    const player = game.players.find(p => p.id === playerId);
    if (!player) return { success: false, message: 'Player not found' };

    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return { success: false, message: 'Card not in hand' };

    const card = player.hand[cardIndex];
    if (player.mana < card.manaCost) {
      return { success: false, message: 'Not enough mana' };
    }

    // Remove card from hand
    player.hand.splice(cardIndex, 1);
    player.mana -= card.manaCost;

    // Handle based on card type
    if ('type' in card) {
      if (card.type === 'creature') {
        const creature = card as Creature;
        creature.canAttack = false; // Can't attack the turn it's summoned
        player.board.push(creature);
      } else if (card.type === 'spell') {
        // Apply spell effect (simplified)
        player.graveyard.push(card);
      } else if (card.type === 'equipment') {
        player.equipment.push(card as Equipment);
      }
    }

    return { success: true };
  }

  // Attack
  private static attack(game: Game, attackerId: string, targetId: string): { success: boolean; message?: string } {
    const attacker = this.findEntity(game, attackerId);
    const target = this.findEntity(game, targetId);

    if (!attacker || !target) {
      return { success: false, message: 'Attacker or target not found' };
    }

    // Check if creature can attack
    if ('canAttack' in attacker && !attacker.canAttack) {
      return { success: false, message: 'Creature cannot attack this turn' };
    }

    // Calculate damage
    const damage = this.calculateDamage(attacker, target);

    // Apply damage
    if ('hp' in target) {
      target.hp -= damage;
      if (target.hp <= 0) {
        this.handleDeath(game, target);
      }
    }

    // Counter-attack if both are creatures
    if ('hp' in attacker && 'attack' in target) {
      const counterDamage = this.calculateDamage(target, attacker);
      attacker.hp -= counterDamage;
      if (attacker.hp <= 0) {
        this.handleDeath(game, attacker);
      }
    }

    return { success: true };
  }

  // Calculate damage
  private static calculateDamage(attacker: Creature | Hero, target: Creature | Hero): number {
    const attackValue = 'attack' in attacker ? attacker.attack : 0;
    const defenseValue = 'defense' in target ? target.defense : 0;
    return Math.max(0, attackValue - defenseValue);
  }

  // Find entity (creature or hero)
  private static findEntity(game: Game, entityId: string): Creature | Hero | null {
    for (const player of game.players) {
      // Check if it's the hero
      if (player.hero.id === entityId) {
        return player.hero;
      }
      // Check creatures on board
      const creature = player.board.find(c => c.id === entityId);
      if (creature) return creature;
    }
    return null;
  }

  // Handle death
  private static handleDeath(game: Game, entity: Creature | Hero): void {
    for (const player of game.players) {
      // If it's a hero
      if (player.hero.id === entity.id) {
        player.isAlive = false;
        player.hp = 0;
        this.checkWinCondition(game);
        return;
      }

      // If it's a creature
      const creatureIndex = player.board.findIndex(c => c.id === entity.id);
      if (creatureIndex !== -1) {
        const creature = player.board.splice(creatureIndex, 1)[0];
        player.graveyard.push(creature);
        return;
      }
    }
  }

  // Use ability
  private static useAbility(game: Game, playerId: string, abilityId: string, targetId?: string): { success: boolean; message?: string } {
    const player = game.players.find(p => p.id === playerId);
    if (!player) return { success: false, message: 'Player not found' };

    if (player.usedAbilityThisTurn) {
      return { success: false, message: 'Already used ability this turn' };
    }

    if (player.mana < player.hero.ability.effect.length) {
      return { success: false, message: 'Not enough mana' };
    }

    player.usedAbilityThisTurn = true;
    // Ability logic would go here (simplified)

    return { success: true };
  }

  // Equip item
  private static equipItem(game: Game, playerId: string, equipmentId: string, targetCreatureId: string): { success: boolean; message?: string } {
    const player = game.players.find(p => p.id === playerId);
    if (!player) return { success: false, message: 'Player not found' };

    const equipmentIndex = player.equipment.findIndex(e => e.id === equipmentId);
    if (equipmentIndex === -1) return { success: false, message: 'Equipment not found' };

    const creature = player.board.find(c => c.id === targetCreatureId);
    if (!creature) return { success: false, message: 'Creature not found' };

    const eq = player.equipment.splice(equipmentIndex, 1)[0];
    creature.equipment = creature.equipment || [];
    creature.equipment.push(eq);

    // Apply bonuses
    if (eq.bonuses.attack) creature.attack += eq.bonuses.attack;
    if (eq.bonuses.defense) creature.defense += eq.bonuses.defense;
    if (eq.bonuses.hp) {
      creature.maxHp += eq.bonuses.hp;
      creature.hp += eq.bonuses.hp;
    }

    return { success: true };
  }

  // End turn
  private static endTurn(game: Game): { success: boolean; message?: string } {
    const currentPlayer = game.players[game.currentPlayerIndex];

    // Reset ability usage
    currentPlayer.usedAbilityThisTurn = false;

    // Enable creatures to attack
    currentPlayer.board.forEach(creature => {
      creature.canAttack = true;
    });

    // Move to next player
    do {
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    } while (!game.players[game.currentPlayerIndex].isAlive);

    // If we're back to player 0, increment turn
    if (game.currentPlayerIndex === 0) {
      game.turn++;
    }

    const nextPlayer = game.players[game.currentPlayerIndex];

    // Increment mana
    if (nextPlayer.maxMana < 10) {
      nextPlayer.maxMana++;
    }
    nextPlayer.mana = nextPlayer.maxMana;

    // Draw card
    this.drawCard(game.id, nextPlayer.id);

    // Apply passive abilities
    this.applyPassiveAbilities(game, nextPlayer);

    // Check win condition
    this.checkWinCondition(game);

    return { success: true };
  }

  // Apply passive abilities at start of turn
  private static applyPassiveAbilities(game: Game, player: Player): void {
    // Hero abilities
    if (player.hero.ability.effect === 'heal_self' && player.hero.ability.value) {
      player.hp = Math.min(player.hp + player.hero.ability.value, player.hero.maxHp);
    }

    // Creature abilities (regeneration, etc.)
    player.board.forEach(creature => {
      if (creature.abilities?.includes('Régénération: +1 HP par tour')) {
        creature.hp = Math.min(creature.hp + 1, creature.maxHp);
      }
    });
  }

  // Check win condition
  private static checkWinCondition(game: Game): boolean {
    const alivePlayers = game.players.filter(p => p.isAlive);

    if (alivePlayers.length === 1) {
      game.winner = alivePlayers[0];
      game.status = 'finished';
      return true;
    }

    // Check turn limit (30 turns)
    if (game.turn >= 30) {
      // Find player with most HP
      const winner = alivePlayers.reduce((prev, current) =>
        (prev.hp > current.hp) ? prev : current
      );
      game.winner = winner;
      game.status = 'finished';
      return true;
    }

    return false;
  }

  // Delete game
  static deleteGame(gameId: string): void {
    this.games.delete(gameId);
  }
}
