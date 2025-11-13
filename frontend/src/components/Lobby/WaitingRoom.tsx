import React, { useState, useEffect } from 'react';
import { Game } from '../../types';
import { socketService } from '../../services/socketService';

interface WaitingRoomProps {
  gameId: string;
  onGameStarted: (game: Game) => void;
  onLeave: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ gameId, onGameStarted, onLeave }) => {
  const [game, setGame] = useState<Game | null>(null);
  const [canStart, setCanStart] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    socketService.onPlayerJoined(({ game: updatedGame }) => {
      setGame(updatedGame);
    });

    socketService.onPlayerLeft(({ gameId: leftGameId }) => {
      if (leftGameId === gameId) {
        // Refresh game state or handle player leaving
      }
    });

    socketService.onCanStartGame((can: boolean) => {
      setCanStart(can);
    });

    socketService.onGameStarted((startedGame: Game) => {
      onGameStarted(startedGame);
    });

    socketService.onGameUpdated((updatedGame: Game) => {
      if (updatedGame.id === gameId) {
        setGame(updatedGame);
      }
    });

    return () => {
      socketService.off('player_joined');
      socketService.off('player_left');
      socketService.off('can_start_game');
      socketService.off('game_started');
      socketService.off('game_updated');
    };
  }, [gameId, onGameStarted]);

  useEffect(() => {
    if (game) {
      const socketId = socketService.getSocketId();
      setIsCreator(game.creatorId === socketId);
      setCanStart(game.players.length >= 2);
    }
  }, [game]);

  const handleStartGame = () => {
    socketService.startGame(gameId);
  };

  const handleLeave = () => {
    socketService.leaveGame(gameId);
    onLeave();
  };

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Salle d'Attente
          </h1>
          <p className="text-gray-400">Partie #{game.id.substring(0, 8)}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-8 mb-6 border-2 border-purple-500/30">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Joueurs connectés</h2>
              <p className="text-gray-400">
                {game.players.length}/9 joueurs
                {canStart && <span className="text-green-400 ml-2">✓ Prêt à démarrer</span>}
              </p>
            </div>
            <div className="text-right">
              {isCreator && (
                <span className="bg-yellow-600 px-3 py-1 rounded-full text-sm font-semibold">
                  👑 Créateur
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {game.players.map((player, index) => (
              <div
                key={player.id}
                className="bg-purple-900/30 rounded-lg p-4 border-2 border-purple-500/50"
              >
                <div className="flex items-center gap-3 mb-2">
                  {game.creatorId === player.socketId && (
                    <span className="text-yellow-400 text-xl">👑</span>
                  )}
                  <span className="font-bold text-lg">{player.pseudo}</span>
                </div>
                <div className="text-sm text-gray-300 mb-2">{player.hero.name}</div>
                <div className="flex gap-2 text-xs">
                  <span className="bg-red-900/50 px-2 py-1 rounded">
                    ❤️ {player.hero.maxHp}
                  </span>
                  <span className="bg-orange-900/50 px-2 py-1 rounded">
                    ⚔️ {player.hero.attack}
                  </span>
                  <span className="bg-blue-900/50 px-2 py-1 rounded">
                    🛡️ {player.hero.defense}
                  </span>
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: 9 - game.players.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="bg-gray-700/30 rounded-lg p-4 border-2 border-dashed border-gray-600 flex items-center justify-center"
              >
                <span className="text-gray-500 text-lg">En attente...</span>
              </div>
            ))}
          </div>

          {!canStart && (
            <div className="bg-yellow-900/30 border-2 border-yellow-600 rounded-lg p-4 text-center">
              <p className="text-yellow-300 font-semibold">
                ⏳ En attente d'au moins 2 joueurs pour démarrer la partie
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleLeave}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
          >
            ❌ Quitter
          </button>

          {isCreator && (
            <button
              onClick={handleStartGame}
              disabled={!canStart}
              className={`px-8 py-3 rounded-lg font-bold text-lg transition-all ${
                canStart
                  ? 'bg-gradient-primary hover:scale-105 shadow-lg shadow-purple-500/50 btn-pulse'
                  : 'bg-gray-600 cursor-not-allowed opacity-50'
              }`}
            >
              {canStart ? '🚀 Démarrer la Partie' : '🔒 Pas assez de joueurs'}
            </button>
          )}

          {!isCreator && canStart && (
            <div className="px-8 py-3 bg-purple-900/50 rounded-lg text-center">
              <p className="text-purple-300 font-semibold">
                ⏳ En attente du démarrage par le créateur...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
