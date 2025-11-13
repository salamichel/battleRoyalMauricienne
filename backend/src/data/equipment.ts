import { Equipment } from '../models/Card';

export const equipment: Equipment[] = [
  {
    id: 'equipment_1',
    name: 'Épée Rouillée',
    type: 'equipment',
    manaCost: 2,
    bonuses: {
      attack: 2
    },
    description: '+2 Attaque'
  },
  {
    id: 'equipment_2',
    name: 'Armure Légère',
    type: 'equipment',
    manaCost: 2,
    bonuses: {
      defense: 2
    },
    description: '+2 Défense'
  },
  {
    id: 'equipment_3',
    name: 'Bouclier Robuste',
    type: 'equipment',
    manaCost: 3,
    bonuses: {
      defense: 4
    },
    description: '+4 Défense'
  },
  {
    id: 'equipment_4',
    name: 'Lame Enchantée',
    type: 'equipment',
    manaCost: 4,
    bonuses: {
      attack: 3
    },
    ability: 'Ignore 1 point de défense',
    description: '+3 Attaque, ignore 1 défense'
  },
  {
    id: 'equipment_5',
    name: 'Heaume du Sage',
    type: 'equipment',
    manaCost: 3,
    bonuses: {
      attack: 1,
      defense: 2
    },
    description: '+1 Attaque, +2 Défense'
  },
  {
    id: 'equipment_6',
    name: 'Botte de Sept Lieues',
    type: 'equipment',
    manaCost: 4,
    bonuses: {
      attack: 2
    },
    ability: 'Peut attaquer immédiatement',
    description: '+2 Attaque, peut attaquer immédiatement'
  },
  {
    id: 'equipment_7',
    name: 'Collier de Vie',
    type: 'equipment',
    manaCost: 3,
    bonuses: {
      hp: 5
    },
    description: '+5 HP max'
  },
  {
    id: 'equipment_8',
    name: 'Cape d\'Invisibilité',
    type: 'equipment',
    manaCost: 5,
    bonuses: {},
    ability: 'Ne peut être ciblé pendant 1 tour',
    description: 'Protection contre les ciblages'
  },
  {
    id: 'equipment_9',
    name: 'Marteau Titan',
    type: 'equipment',
    manaCost: 6,
    bonuses: {
      attack: 5,
      defense: -1
    },
    description: '+5 Attaque, -1 Défense'
  },
  {
    id: 'equipment_10',
    name: 'Amulette Mystique',
    type: 'equipment',
    manaCost: 4,
    bonuses: {
      attack: 1,
      defense: 1,
      hp: 3
    },
    description: '+1 Attaque, +1 Défense, +3 HP'
  }
];
