import React, { useState, useEffect } from 'react';
import { Hero } from '../../types';
import { socketService } from '../../services/socketService';

interface HeroSelectionProps {
  onHeroSelected: (pseudo: string, heroId: string) => void;
}

const HeroSelection: React.FC<HeroSelectionProps> = ({ onHeroSelected }) => {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [pseudo, setPseudo] = useState('');
  const [showVillains, setShowVillains] = useState(false);

  useEffect(() => {
    // Request heroes list
    socketService.getHeroes();

    // Listen for heroes list
    socketService.onHeroesList((receivedHeroes: Hero[]) => {
      setHeroes(receivedHeroes);
    });

    return () => {
      socketService.off('heroes_list');
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedHero && pseudo.trim()) {
      onHeroSelected(pseudo.trim(), selectedHero.id);
    }
  };

  const filteredHeroes = showVillains
    ? heroes
    : heroes.filter(h => h.type === 'hero');

  const getRarityColor = (hero: Hero) => {
    return hero.type === 'villain' ? 'border-red-600' : 'border-blue-500';
  };

  const getRarityBg = (hero: Hero) => {
    return hero.type === 'villain' ? 'bg-red-900/30' : 'bg-blue-900/30';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-primary bg-clip-text text-transparent">
          Battle Royale Mauricienne
        </h1>
        <p className="text-center text-gray-300 mb-8 text-lg">
          Choisissez votre héros et préparez-vous au combat !
        </p>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value.slice(0, 20))}
              placeholder="Entrez votre pseudo (max 20 caractères)"
              className="px-4 py-3 rounded-lg bg-gray-800 border-2 border-purple-500 focus:border-pink-500 outline-none text-white w-full sm:w-80 transition-colors"
              maxLength={20}
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showVillains}
                onChange={(e) => setShowVillains(e.target.checked)}
                className="w-5 h-5 rounded border-gray-600"
              />
              <span className="text-red-400 font-medium">Afficher les vilains</span>
            </label>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredHeroes.map((hero) => (
            <div
              key={hero.id}
              onClick={() => setSelectedHero(hero)}
              className={`
                relative cursor-pointer rounded-xl p-6 transition-all duration-300
                border-4 ${getRarityColor(hero)} ${getRarityBg(hero)}
                ${selectedHero?.id === hero.id ? 'scale-105 shadow-2xl shadow-purple-500/50' : 'hover:scale-102'}
                ${selectedHero?.id === hero.id ? 'ring-4 ring-purple-400' : ''}
              `}
            >
              <div className="absolute top-2 right-2 bg-purple-600 px-3 py-1 rounded-full text-sm font-bold">
                {hero.manaCost} 💎
              </div>

              <h3 className="text-2xl font-bold mb-2 text-center">{hero.name}</h3>
              <p className="text-sm text-gray-400 text-center mb-4 italic">
                {hero.description}
              </p>

              <div className="flex justify-around mb-4 bg-black/30 rounded-lg py-2">
                <div className="text-center">
                  <div className="text-red-400 font-bold text-xl">{hero.maxHp}</div>
                  <div className="text-xs text-gray-400">HP</div>
                </div>
                <div className="text-center">
                  <div className="text-orange-400 font-bold text-xl">{hero.attack}</div>
                  <div className="text-xs text-gray-400">ATT</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-bold text-xl">{hero.defense}</div>
                  <div className="text-xs text-gray-400">DEF</div>
                </div>
              </div>

              <div className="bg-purple-900/50 rounded-lg p-3">
                <div className="text-yellow-400 font-semibold mb-1 text-sm">
                  ⚡ {hero.ability.name}
                </div>
                <div className="text-xs text-gray-300">
                  {hero.ability.description}
                </div>
              </div>

              {selectedHero?.id === hero.id && (
                <div className="absolute inset-0 border-4 border-yellow-400 rounded-xl pointer-events-none animate-pulse"></div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!selectedHero || !pseudo.trim()}
            className={`
              px-8 py-4 rounded-xl text-xl font-bold transition-all duration-300
              ${selectedHero && pseudo.trim()
                ? 'bg-gradient-primary hover:scale-105 shadow-lg shadow-purple-500/50 cursor-pointer'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
              }
            `}
          >
            {selectedHero && pseudo.trim() ? '⚔️ Rejoindre la Bataille!' : '🔒 Sélectionnez un héros et entrez votre pseudo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSelection;
