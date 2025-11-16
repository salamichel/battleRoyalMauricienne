import React, { useState, useEffect } from 'react';
import { socketService } from './services/socketService';
import { Game } from './types';
import HeroSelection from './components/Lobby/HeroSelection';
import Lobby from './components/Lobby/Lobby';
import Leaderboard from './components/Lobby/Leaderboard';
import WaitingRoom from './components/Lobby/WaitingRoom';
import Board from './components/Game/Board';
import GameOver from './components/Game/GameOver';

type AppState = 'connecting' | 'hero_selection' | 'lobby' | 'leaderboard' | 'waiting_room' | 'playing' | 'game_over';

function App() {
  const [appState, setAppState] = useState<AppState>('connecting');
  const [pseudo, setPseudo] = useState<string>('');
  const [heroId, setHeroId] = useState<string>('');
  const [currentGameId, setCurrentGameId] = useState<string>('');
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [connectionError, setConnectionError] = useState<string>('');

  useEffect(() => {
    // Connect to server
    socketService.connect()
      .then(() => {
        console.log('Connected to server');
        setAppState('hero_selection');
      })
      .catch((error) => {
        console.error('Connection error:', error);
        setConnectionError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
      });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleHeroSelected = (selectedPseudo: string, selectedHeroId: string) => {
    setPseudo(selectedPseudo);
    setHeroId(selectedHeroId);
    setAppState('lobby');
  };

  const handleGameCreated = (gameId: string) => {
    setCurrentGameId(gameId);
    setAppState('waiting_room');
  };

  const handleGameJoined = (gameId: string) => {
    setCurrentGameId(gameId);
    setAppState('waiting_room');
  };

  const handleGameStarted = (game: Game) => {
    setCurrentGame(game);
    setAppState('playing');
  };

  const handleGameEnded = () => {
    setAppState('game_over');
  };

  const handleReturnToLobby = () => {
    setCurrentGameId('');
    setCurrentGame(null);
    setAppState('lobby');
  };

  const handleLeaveWaitingRoom = () => {
    setCurrentGameId('');
    setAppState('lobby');
  };

  const handleShowLeaderboard = () => {
    setAppState('leaderboard');
  };

  const handleBackFromLeaderboard = () => {
    setAppState('lobby');
  };

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-900/30 border-2 border-red-600 rounded-xl p-8 text-center">
          <h1 className="text-3xl font-bold text-red-400 mb-4">❌ Erreur de Connexion</h1>
          <p className="text-gray-300 mb-6">{connectionError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (appState === 'connecting') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Connexion au serveur...
          </h2>
        </div>
      </div>
    );
  }

  if (appState === 'hero_selection') {
    return <HeroSelection onHeroSelected={handleHeroSelected} />;
  }

  if (appState === 'lobby') {
    return (
      <Lobby
        pseudo={pseudo}
        heroId={heroId}
        onGameJoined={handleGameJoined}
        onGameCreated={handleGameCreated}
        onShowLeaderboard={handleShowLeaderboard}
      />
    );
  }

  if (appState === 'leaderboard') {
    return <Leaderboard onBack={handleBackFromLeaderboard} />;
  }

  if (appState === 'waiting_room') {
    return (
      <WaitingRoom
        gameId={currentGameId}
        onGameStarted={handleGameStarted}
        onLeave={handleLeaveWaitingRoom}
      />
    );
  }

  if (appState === 'playing' && currentGame) {
    return (
      <Board
        game={currentGame}
        onGameEnded={handleGameEnded}
      />
    );
  }

  if (appState === 'game_over' && currentGame) {
    const socketId = socketService.getSocketId();
    const myPlayer = currentGame.players.find(p => p.socketId === socketId) || null;

    return (
      <GameOver
        game={currentGame}
        myPlayer={myPlayer}
        onReturnToLobby={handleReturnToLobby}
      />
    );
  }

  return null;
}

export default App;
