import React, { useState, useEffect } from 'react';
import { Game } from '../../types';
import { socketService } from '../../services/socketService';

interface LobbyProps {
  pseudo: string;
  heroId: string;
  onGameJoined: (gameId: string) => void;
  onGameCreated: (gameId: string) => void;
  onShowLeaderboard: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ pseudo, heroId, onGameJoined, onGameCreated, onShowLeaderboard }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Join lobby
    socketService.joinLobby();

    // Listen for lobby updates
    socketService.onLobbyGames((receivedGames: Game[]) => {
      setGames(receivedGames);
    });

    socketService.onGameCreated((game: Game) => {
      setGames(prev => [...prev, game]);
    });

    socketService.onGameUpdated((game: Game) => {
      setGames(prev => {
        const index = prev.findIndex(g => g.id === game.id);
        if (index !== -1) {
          const newGames = [...prev];
          // Remove game if it started or finished
          if (game.status !== 'waiting') {
            newGames.splice(index, 1);
          } else {
            newGames[index] = game;
          }
          return newGames;
        }
        return prev;
      });
    });

    socketService.onGameCreatedSuccess((game: Game) => {
      onGameCreated(game.id);
    });

    socketService.onPlayerJoined(({ game }) => {
      onGameJoined(game.id);
    });

    socketService.onCreateGameError((err: string) => {
      setError(err);
      setTimeout(() => setError(''), 3000);
    });

    socketService.onJoinGameError((err: string) => {
      setError(err);
      setTimeout(() => setError(''), 3000);
    });

    return () => {
      socketService.off('lobby_games');
      socketService.off('game_created');
      socketService.off('game_updated');
      socketService.off('game_created_success');
      socketService.off('player_joined');
      socketService.off('create_game_error');
      socketService.off('join_game_error');
    };
  }, [onGameJoined, onGameCreated]);

  const handleCreateGame = () => {
    socketService.createGame(pseudo, heroId);
  };

  const handleJoinGame = (gameId: string) => {
    socketService.joinGame(gameId, pseudo, heroId);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Bienvenue, {pseudo} !
          </h1>
          <p className="text-gray-400">Rejoignez une partie existante ou créez la vôtre</p>
        </div>

        {error && (
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg mb-6 text-center font-semibold">
            ❌ {error}
          </div>
        )}

        <div className="mb-8 flex justify-center gap-4">
          <button
            onClick={handleCreateGame}
            className="px-8 py-4 bg-gradient-primary rounded-xl text-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-purple-500/50"
          >
            ➕ Créer une Nouvelle Partie
          </button>
          <button
            onClick={onShowLeaderboard}
            className="px-8 py-4 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-yellow-500/50"
          >
            🏆 Classement
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Parties Disponibles ({games.length})</h2>

          {games.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-12 text-center">
              <p className="text-gray-400 text-lg mb-4">Aucune partie disponible pour le moment</p>
              <p className="text-gray-500">Créez une nouvelle partie pour commencer !</p>
            </div>
          ) : (
            games.map((game) => (
              <div
                key={game.id}
                className="bg-gray-800 rounded-xl p-6 border-2 border-purple-500/30 hover:border-purple-500 transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">Partie #{game.id.substring(0, 8)}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        game.players.length >= 9 ? 'bg-red-600' : 'bg-green-600'
                      }`}>
                        {game.players.length}/9 joueurs
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {game.players.map((player, index) => (
                        <div
                          key={index}
                          className="bg-purple-900/50 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          <span className="font-semibold">{player.pseudo}</span>
                          <span className="text-gray-400">({player.hero.name})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinGame(game.id)}
                    disabled={game.players.length >= 9}
                    className={`px-6 py-3 rounded-lg font-bold transition-all ${
                      game.players.length >= 9
                        ? 'bg-gray-600 cursor-not-allowed opacity-50'
                        : 'bg-green-600 hover:bg-green-700 hover:scale-105'
                    }`}
                  >
                    {game.players.length >= 9 ? '🔒 Complet' : '🎮 Rejoindre'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
