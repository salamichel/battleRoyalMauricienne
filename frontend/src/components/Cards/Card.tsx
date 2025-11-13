import React from 'react';
import { Card as CardType, Creature, Spell, Equipment } from '../../types';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isPlayable?: boolean;
  isSelected?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  card,
  onClick,
  isPlayable = false,
  isSelected = false,
  size = 'medium'
}) => {
  const getCardTypeColor = () => {
    if ('type' in card) {
      switch (card.type) {
        case 'creature':
          return 'border-green-500 bg-green-900/20';
        case 'spell':
          return 'border-orange-500 bg-orange-900/20';
        case 'equipment':
          return 'border-gray-400 bg-gray-800/20';
        default:
          return 'border-blue-500 bg-blue-900/20';
      }
    }
    return 'border-blue-500 bg-blue-900/20';
  };

  const getRarityColor = () => {
    if ('type' in card && card.type === 'creature') {
      const creature = card as Creature;
      switch (creature.rarity) {
        case 'common':
          return 'text-gray-400';
        case 'rare':
          return 'text-blue-400';
        case 'epic':
          return 'text-purple-400';
        case 'legendary':
          return 'text-yellow-400';
      }
    }
    return 'text-gray-400';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-24 h-32 text-xs';
      case 'large':
        return 'w-48 h-64 text-base';
      default:
        return 'w-32 h-44 text-sm';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${getSizeClasses()}
        ${getCardTypeColor()}
        ${isPlayable ? 'cursor-pointer hover:scale-110 hover:-translate-y-2 shadow-lg' : ''}
        ${isSelected ? 'ring-4 ring-yellow-400 scale-105' : ''}
        ${!isPlayable && onClick ? 'cursor-pointer' : ''}
        relative rounded-lg border-2 p-2 transition-all duration-300
        flex flex-col justify-between
      `}
    >
      {/* Mana cost */}
      <div className="absolute -top-2 -left-2 bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 border-white">
        {card.manaCost}
      </div>

      {/* Card name */}
      <div className="text-center font-bold mb-1 truncate" title={card.name}>
        {card.name}
      </div>

      {/* Card stats */}
      {'type' in card && card.type === 'creature' && (
        <div className="flex justify-around bg-black/30 rounded py-1 mb-1">
          <div className="text-center">
            <div className="text-red-400 font-bold">{(card as Creature).hp}</div>
            <div className="text-xs text-gray-400">HP</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 font-bold">{(card as Creature).attack}</div>
            <div className="text-xs text-gray-400">ATT</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-bold">{(card as Creature).defense}</div>
            <div className="text-xs text-gray-400">DEF</div>
          </div>
        </div>
      )}

      {/* Equipment stats */}
      {'type' in card && card.type === 'equipment' && (
        <div className="bg-black/30 rounded py-1 mb-1 text-center text-xs">
          {(card as Equipment).bonuses.attack && (
            <div className="text-orange-400">+{(card as Equipment).bonuses.attack} ATT</div>
          )}
          {(card as Equipment).bonuses.defense && (
            <div className="text-blue-400">+{(card as Equipment).bonuses.defense} DEF</div>
          )}
          {(card as Equipment).bonuses.hp && (
            <div className="text-red-400">+{(card as Equipment).bonuses.hp} HP</div>
          )}
        </div>
      )}

      {/* Spell effect */}
      {'type' in card && card.type === 'spell' && (
        <div className="bg-black/30 rounded py-1 mb-1 text-center text-xs">
          <div className="text-orange-400 font-semibold">{(card as Spell).effect.type}</div>
          <div className="text-yellow-400">{(card as Spell).effect.value}</div>
        </div>
      )}

      {/* Description */}
      <div className="text-xs text-gray-300 text-center line-clamp-2" title={card.description}>
        {card.description}
      </div>

      {/* Rarity indicator for creatures */}
      {'type' in card && card.type === 'creature' && (
        <div className={`text-xs ${getRarityColor()} text-center font-semibold mt-1`}>
          {(card as Creature).rarity.toUpperCase()}
        </div>
      )}

      {isPlayable && (
        <div className="absolute inset-0 border-2 border-green-400 rounded-lg animate-pulse pointer-events-none"></div>
      )}
    </div>
  );
};

export default Card;
