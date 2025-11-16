import React, { useState, useEffect } from 'react';
import { PlayerStats } from '../../types';
import { socketService } from '../../services/socketService';

interface LeaderboardProps {
  onBack: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const [leaderboard, setLeaderboard] = useState<PlayerStats[]>([]);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'recent'>('leaderboard');

  useEffect(() => {
    setLoading(true);

    // Request leaderboard
    socketService.getLeaderboard(50);

    // Request recent games
    socketService.getRecentGames(20);

    // Listen for leaderboard data
    socketService.onLeaderboardData((data: PlayerStats[]) => {
      setLeaderboard(data);
      setLoading(false);
    });

    // Listen for recent games data
    socketService.onRecentGamesData((games: any[]) => {
      setRecentGames(games);
      setLoading(false);
    });

    // Listen for errors
    socketService.onLeaderboardError((err: string) => {
      setError(err);
      setLoading(false);
    });

    return () => {
      socketService.off('leaderboard_data');
      socketService.off('recent_games_data');
      socketService.off('leaderboard_error');
    };
  }, []);

  const calculateWinRate = (stats: PlayerStats): number => {
    if (stats.gamesPlayed === 0) return 0;
    return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getMedalEmoji = (position: number): string => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${position}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-400">Chargement du classement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/30 border-2 border-red-600 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">❌ Erreur</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
            >
              ← Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            🏆 Classement
          </h1>
          <p className="text-gray-400">Les meilleurs joueurs de Battle Royale Mauricienne</p>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4 justify-between items-center mb-6">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors"
          >
            ← Retour au Lobby
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-gradient-primary'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              🏆 Top Joueurs
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === 'recent'
                  ? 'bg-gradient-primary'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              🎮 Parties Récentes
            </button>
          </div>
        </div>

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">🏆 Top 50 Joueurs</h2>

            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg mb-4">Aucun joueur dans le classement</p>
                <p className="text-gray-500">Soyez le premier à jouer une partie !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((player, index) => (
                  <div
                    key={player.pseudo}
                    className={`
                      flex items-center justify-between p-4 rounded-lg transition-all
                      ${
                        index < 3
                          ? 'bg-gradient-primary shadow-lg'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-3xl font-bold w-16 text-center">
                        {getMedalEmoji(index + 1)}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg">{player.pseudo}</div>
                        <div className="text-sm text-gray-300">
                          Héros favori: {player.favoriteHero || 'Aucun'}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-6 text-center">
                      <div className="bg-black/30 rounded-lg px-4 py-2">
                        <div className="text-2xl font-bold text-green-400">
                          {player.gamesWon}
                        </div>
                        <div className="text-xs text-gray-400">Victoires</div>
                      </div>
                      <div className="bg-black/30 rounded-lg px-4 py-2">
                        <div className="text-lg font-bold text-blue-400">
                          {player.gamesPlayed}
                        </div>
                        <div className="text-xs text-gray-400">Parties</div>
                      </div>
                      <div className="bg-black/30 rounded-lg px-4 py-2">
                        <div className="text-lg font-bold text-yellow-400">
                          {calculateWinRate(player)}%
                        </div>
                        <div className="text-xs text-gray-400">Taux victoire</div>
                      </div>
                      <div className="bg-black/30 rounded-lg px-4 py-2">
                        <div className="text-lg font-bold text-red-400">
                          {player.totalDamageDealt}
                        </div>
                        <div className="text-xs text-gray-400">Dégâts</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Games Tab */}
        {activeTab === 'recent' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">🎮 20 Dernières Parties</h2>

            {recentGames.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg mb-4">Aucune partie terminée</p>
                <p className="text-gray-500">Les parties récentes apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentGames.map((game) => (
                  <div
                    key={game.gameId}
                    className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg mb-1">
                          Partie #{game.gameId.substring(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {new Date(game.endedAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="bg-purple-900/50 px-3 py-1 rounded-full text-sm mb-1">
                          {game.totalTurns} tours
                        </div>
                        <div className="text-xs text-gray-400">
                          Durée: {formatDuration(game.duration)}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-primary rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">👑</span>
                        <div>
                          <div className="font-bold text-lg">{game.winner.pseudo}</div>
                          <div className="text-sm text-gray-200">{game.winner.heroName}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {game.players.map((player: any, index: number) => (
                        <div
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm ${
                            player.isWinner
                              ? 'bg-yellow-600 font-semibold'
                              : player.isAlive
                              ? 'bg-green-900/50'
                              : 'bg-gray-800'
                          }`}
                        >
                          {player.pseudo} ({player.heroName})
                          {!player.isAlive && ' ☠️'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
