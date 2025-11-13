// Base Card Interface
export interface BaseCard {
  id: string;
  name: string;
  manaCost: number;
  description: string;
}

// Hero Interface
export interface Hero extends BaseCard {
  type: 'hero' | 'villain';
  maxHp: number;
  attack: number;
  defense: number;
  ability: {
    name: string;
    description: string;
    effect: string;
    value?: number;
    cooldown?: number;
  };
}

// Creature Interface
export interface Creature extends BaseCard {
  type: 'creature';
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  abilities?: string[];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  tribe?: string;
  canAttack: boolean; // False on the turn it's summoned
  equipment?: Equipment[]; // Equipped items
}

// Spell Interface
export interface Spell extends BaseCard {
  type: 'spell';
  effect: {
    type: 'damage' | 'heal' | 'buff' | 'debuff' | 'draw' | 'destroy' | 'control';
    target: 'single' | 'all_enemies' | 'all_allies' | 'self' | 'all';
    value: number;
  };
}

// Equipment Interface
export interface Equipment extends BaseCard {
  type: 'equipment';
  bonuses: {
    attack?: number;
    defense?: number;
    hp?: number;
  };
  ability?: string;
}

// Union type for all card types
export type Card = Hero | Creature | Spell | Equipment;

// Player Interface
export interface Player {
  id: string;
  socketId: string;
  pseudo: string;
  hero: Hero;
  deck: Card[];
  hand: Card[];
  board: Creature[];
  graveyard: Card[];
  equipment: Equipment[];
  mana: number;
  maxMana: number;
  hp: number;
  isAlive: boolean;
  usedAbilityThisTurn: boolean;
}

// Game Interface
export interface Game {
  id: string;
  status: 'waiting' | 'playing' | 'finished';
  players: Player[];
  currentPlayerIndex: number;
  turn: number;
  winner: Player | null;
  createdAt: Date;
  creatorId: string;
}

// Game Action Types
export type GameAction = {
  type: 'play_card';
  playerId: string;
  cardId: string;
  position?: number;
} | {
  type: 'attack';
  playerId: string;
  attackerId: string;
  targetId: string;
} | {
  type: 'use_ability';
  playerId: string;
  abilityId: string;
  targetId?: string;
} | {
  type: 'equip';
  playerId: string;
  equipmentId: string;
  targetCreatureId: string;
} | {
  type: 'end_turn';
  playerId: string;
};

// Player Stats Interface
export interface PlayerStats {
  pseudo: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  totalDamageDealt: number;
  favoriteHero: string;
  lastPlayed: Date;
}
