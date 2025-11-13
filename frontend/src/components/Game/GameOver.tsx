import React from 'react';
import { Game, Player } from '../../types';

interface GameOverProps {
  game: Game;
  myPlayer: Player | null;
  onReturnToLobby: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ game, myPlayer, onReturnToLobby }) => {
  const winner = game.winner;
  const isWinner = myPlayer?.id === winner?.id;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Winner announcement */}
        <div className="text-center mb-8">
          {isWinner ? (
            <>
              <h1 className="text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent animate-pulse">
                🏆 VICTOIRE! 🏆
              </h1>
              <p className="text-2xl text-green-400 font-semibold">
                Félicitations {winner?.pseudo}!
              </p>
            </>
          ) : (
            <>
              <h1 className="text-5xl font-bold mb-4 text-gray-300">
                Partie Terminée
              </h1>
              <p className="text-2xl text-yellow-400 font-semibold">
                🏆 Victoire de {winner?.pseudo}!
              </p>
            </>
          )}
        </div>

        {/* Winner hero card */}
        {winner && (
          <div className="bg-gradient-primary rounded-xl p-8 mb-8 shadow-2xl">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold text-white">Héros Gagnant</h2>
            </div>
            <div className="bg-white/10 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-center mb-2">{winner.hero.name}</h3>
              <p className="text-center text-gray-200 mb-4">{winner.hero.description}</p>
              <div className="flex justify-around mb-4">
                <div className="text-center">
                  <div className="text-red-300 font-bold text-3xl">{winner.hp}</div>
                  <div className="text-sm text-gray-300">HP Restants</div>
                </div>
                <div className="text-center">
                  <div className="text-orange-300 font-bold text-3xl">{winner.hero.attack}</div>
                  <div className="text-sm text-gray-300">Attaque</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-300 font-bold text-3xl">{winner.hero.defense}</div>
                  <div className="text-sm text-gray-300">Défense</div>
                </div>
              </div>
              <div className="bg-purple-800/50 rounded-lg p-3">
                <div className="text-yellow-300 font-semibold mb-1">
                  ⚡ {winner.hero.ability.name}
                </div>
                <div className="text-sm text-gray-200">
                  {winner.hero.ability.description}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Final standings */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Classement Final</h2>
          <div className="space-y-3">
            {game.players
              .sort((a, b) => {
                // Winner first
                if (a.id === winner?.id) return -1;
                if (b.id === winner?.id) return 1;
                // Then by alive status
                if (a.isAlive && !b.isAlive) return -1;
                if (!a.isAlive && b.isAlive) return 1;
                // Then by HP
                return b.hp - a.hp;
              })
              .map((player, index) => (
                <div
                  key={player.id}
                  className={`
                    flex items-center justify-between p-4 rounded-lg
                    ${player.id === winner?.id ? 'bg-gradient-primary' : 'bg-gray-700'}
                    ${player.id === myPlayer?.id ? 'ring-2 ring-purple-400' : ''}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold w-12 text-center">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div>
                      <div className="font-bold text-lg flex items-center gap-2">
                        {player.pseudo}
                        {player.id === myPlayer?.id && (
                          <span className="text-xs bg-purple-600 px-2 py-1 rounded">Vous</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-300">{player.hero.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${player.isAlive ? 'text-green-400' : 'text-red-400'}`}>
                      {player.isAlive ? '✓ Vivant' : '✗ Éliminé'}
                    </div>
                    <div className="text-sm text-gray-300">
                      {player.hp} HP | {player.board.length} créatures
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Game statistics */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Statistiques de la Partie</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-400">{game.turn}</div>
              <div className="text-sm text-gray-400">Tours joués</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-400">{game.players.length}</div>
              <div className="text-sm text-gray-400">Joueurs total</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-400">
                {Math.floor((Date.now() - new Date(game.createdAt).getTime()) / 60000)}
              </div>
              <div className="text-sm text-gray-400">Minutes de jeu</div>
            </div>
          </div>
        </div>

        {/* Return button */}
        <div className="text-center">
          <button
            onClick={onReturnToLobby}
            className="px-8 py-4 bg-gradient-primary rounded-xl text-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-purple-500/50"
          >
            🏠 Retour au Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
