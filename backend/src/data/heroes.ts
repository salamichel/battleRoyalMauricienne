import { Hero } from '../models/Card';

export const heroes: Hero[] = [
  {
    id: 'hero_1',
    name: 'Sylvanus',
    type: 'hero',
    manaCost: 3,
    maxHp: 35,
    attack: 3,
    defense: 4,
    ability: {
      name: 'Regain Naturel',
      description: 'Récupère 2 PV par tour automatiquement',
      effect: 'heal_self',
      value: 2,
      cooldown: 0
    },
    description: 'Gardien de la forêt mauricienne'
  },
  {
    id: 'hero_2',
    name: 'Purbhoo',
    type: 'hero',
    manaCost: 5,
    maxHp: 42,
    attack: 4,
    defense: 2,
    ability: {
      name: 'Illusion Cosmique',
      description: 'Peut annuler la première attaque subie par tour',
      effect: 'block_attack',
      value: 1,
      cooldown: 0
    },
    description: 'Maître des illusions'
  },
  {
    id: 'hero_3',
    name: 'Rughoobin',
    type: 'hero',
    manaCost: 7,
    maxHp: 86,
    attack: 8,
    defense: 6,
    ability: {
      name: 'Peau de Pierre',
      description: 'Réduit tous les dégâts subis de 2',
      effect: 'reduce_damage',
      value: 2,
      cooldown: 0
    },
    description: 'Colosse invincible'
  },
  {
    id: 'hero_4',
    name: 'Narasimlu',
    type: 'hero',
    manaCost: 6,
    maxHp: 67,
    attack: 6,
    defense: 7,
    ability: {
      name: 'Griffes Féroces',
      description: 'Attaque deux fois par tour',
      effect: 'double_attack',
      value: 2,
      cooldown: 0
    },
    description: 'Guerrier aux griffes mortelles'
  },
  {
    id: 'hero_5',
    name: 'Beerachee',
    type: 'hero',
    manaCost: 4,
    maxHp: 44,
    attack: 4,
    defense: 4,
    ability: {
      name: 'Éclair Rapide',
      description: 'Ignore la défense adverse une fois par tour',
      effect: 'ignore_defense',
      value: 1,
      cooldown: 0
    },
    description: 'Rapide comme l\'éclair'
  },
  {
    id: 'hero_6',
    name: 'Gangaram',
    type: 'hero',
    manaCost: 5,
    maxHp: 53,
    attack: 5,
    defense: 3,
    ability: {
      name: 'Vague Purifiante',
      description: 'Soigne un allié de 3 PV par tour',
      effect: 'heal_ally',
      value: 3,
      cooldown: 0
    },
    description: 'Guérisseur des eaux sacrées'
  },
  {
    id: 'hero_7',
    name: 'Bagelloo',
    type: 'hero',
    manaCost: 3,
    maxHp: 33,
    attack: 3,
    defense: 2,
    ability: {
      name: 'Tour de Passe-Passe',
      description: 'Peut échanger position avec une créature une fois par tour',
      effect: 'swap_position',
      value: 1,
      cooldown: 1
    },
    description: 'Magicien illusionniste'
  },
  {
    id: 'hero_8',
    name: 'Gopee',
    type: 'hero',
    manaCost: 4,
    maxHp: 43,
    attack: 4,
    defense: 3,
    ability: {
      name: 'Infiltrateur',
      description: 'Ne peut pas être ciblé le premier tour après invocation',
      effect: 'stealth',
      value: 1,
      cooldown: 2
    },
    description: 'Espion furtif'
  },
  {
    id: 'hero_9',
    name: 'Bonne',
    type: 'hero',
    manaCost: 7,
    maxHp: 61,
    attack: 6,
    defense: 1,
    ability: {
      name: 'Bénédiction Céleste',
      description: 'Augmente la Défense d\'un allié de 3 par tour',
      effect: 'buff_defense',
      value: 3,
      cooldown: 0
    },
    description: 'Prêtresse divine'
  },
  {
    id: 'villain_1',
    name: 'Lagrosse',
    type: 'villain',
    manaCost: 9,
    maxHp: 108,
    attack: 10,
    defense: 8,
    ability: {
      name: 'Écrasement Mondial',
      description: 'Dégâts ignorent la défense ennemie',
      effect: 'true_damage',
      value: 0,
      cooldown: 0
    },
    description: 'Le tyran indestructible'
  }
];
