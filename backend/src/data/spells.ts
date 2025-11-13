import { Spell } from '../models/Card';

export const spells: Spell[] = [
  {
    id: 'spell_1',
    name: 'Boule de Feu',
    type: 'spell',
    manaCost: 3,
    effect: {
      type: 'damage',
      target: 'single',
      value: 4
    },
    description: 'Inflige 4 dégâts à une cible'
  },
  {
    id: 'spell_2',
    name: 'Soin Rapide',
    type: 'spell',
    manaCost: 2,
    effect: {
      type: 'heal',
      target: 'single',
      value: 5
    },
    description: 'Restaure 5 HP à une cible'
  },
  {
    id: 'spell_3',
    name: 'Bouclier Magique',
    type: 'spell',
    manaCost: 4,
    effect: {
      type: 'buff',
      target: 'single',
      value: 3
    },
    description: '+3 Défense à un allié pour 2 tours'
  },
  {
    id: 'spell_4',
    name: 'Tempête de Sable',
    type: 'spell',
    manaCost: 6,
    effect: {
      type: 'damage',
      target: 'all_enemies',
      value: 2
    },
    description: '2 dégâts à tous les ennemis'
  },
  {
    id: 'spell_5',
    name: 'Piocher Cartes',
    type: 'spell',
    manaCost: 3,
    effect: {
      type: 'draw',
      target: 'self',
      value: 2
    },
    description: 'Piocher 2 cartes supplémentaires'
  },
  {
    id: 'spell_6',
    name: 'Confusion',
    type: 'spell',
    manaCost: 5,
    effect: {
      type: 'control',
      target: 'single',
      value: 1
    },
    description: 'Une créature adverse ne peut pas attaquer pendant 1 tour'
  },
  {
    id: 'spell_7',
    name: 'Rage',
    type: 'spell',
    manaCost: 4,
    effect: {
      type: 'buff',
      target: 'single',
      value: 4
    },
    description: '+4 Attaque à un allié pour 1 tour'
  },
  {
    id: 'spell_8',
    name: 'Destruction',
    type: 'spell',
    manaCost: 7,
    effect: {
      type: 'destroy',
      target: 'single',
      value: 1
    },
    description: 'Détruit une créature ciblée'
  },
  {
    id: 'spell_9',
    name: 'Vol de Vie',
    type: 'spell',
    manaCost: 5,
    effect: {
      type: 'damage',
      target: 'single',
      value: 3
    },
    description: 'Inflige 3 dégâts et soigne 3 HP'
  },
  {
    id: 'spell_10',
    name: 'Gel',
    type: 'spell',
    manaCost: 4,
    effect: {
      type: 'control',
      target: 'single',
      value: 1
    },
    description: 'Immobilise une créature pour 1 tour'
  },
  {
    id: 'spell_11',
    name: 'Renaissance',
    type: 'spell',
    manaCost: 8,
    effect: {
      type: 'control',
      target: 'self',
      value: 1
    },
    description: 'Ramène une créature du cimetière'
  },
  {
    id: 'spell_12',
    name: 'Pluie Curative',
    type: 'spell',
    manaCost: 6,
    effect: {
      type: 'heal',
      target: 'all_allies',
      value: 3
    },
    description: 'Soigne tous les alliés de 3 HP'
  },
  {
    id: 'spell_13',
    name: 'Éclair',
    type: 'spell',
    manaCost: 2,
    effect: {
      type: 'damage',
      target: 'single',
      value: 3
    },
    description: 'Inflige 3 dégâts à une créature'
  },
  {
    id: 'spell_14',
    name: 'Malédiction',
    type: 'spell',
    manaCost: 5,
    effect: {
      type: 'debuff',
      target: 'all_enemies',
      value: 3
    },
    description: '-3 Attaque à tous les ennemis'
  },
  {
    id: 'spell_15',
    name: 'Sacrifice',
    type: 'spell',
    manaCost: 3,
    effect: {
      type: 'destroy',
      target: 'single',
      value: 2
    },
    description: 'Détruit une créature alliée, gagne 2 mana'
  }
];
