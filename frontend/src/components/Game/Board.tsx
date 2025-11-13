import React, { useState, useEffect } from 'react';
import { Game, Player, GameAction } from '../../types';
import { socketService } from '../../services/socketService';
import Card from '../Cards/Card';

interface BoardProps {
  game: Game;
  onGameEnded: () => void;
}

const Board: React.FC<BoardProps> = ({ game: initialGame, onGameEnded }) => {
  const [game, setGame] = useState<Game>(initialGame);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedAttacker, setSelectedAttacker] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);

  useEffect(() => {
    // Find my player
    const socketId = socketService.getSocketId();
    const player = game.players.find(p => p.socketId === socketId);
    setMyPlayer(player || null);
    setCurrentPlayer(game.players[game.currentPlayerIndex]);

    // Listen for game updates
    socketService.onGameStateUpdated((updatedGame: Game) => {
      setGame(updatedGame);
      setCurrentPlayer(updatedGame.players[updatedGame.currentPlayerIndex]);
      setSelectedCard(null);
      setSelectedAttacker(null);
    });

    socketService.onTurnChanged(({ currentPlayerId, turnNumber }) => {
      const player = game.players.find(p => p.id === currentPlayerId);
      setCurrentPlayer(player || null);
      setError(`Tour ${turnNumber} - C'est au tour de ${player?.pseudo || 'inconnu'}`);
      setTimeout(() => setError(''), 3000);
    });

    socketService.onGameEnded((endedGame: Game) => {
      setGame(endedGame);
      setTimeout(() => onGameEnded(), 3000);
    });

    socketService.onActionError((err: string) => {
      setError(err);
      setTimeout(() => setError(''), 3000);
    });

    return () => {
      socketService.off('game_state_updated');
      socketService.off('turn_changed');
      socketService.off('game_ended');
      socketService.off('action_error');
    };
  }, [game.players, game.currentPlayerIndex, onGameEnded]);

  const isMyTurn = () => {
    return currentPlayer?.id === myPlayer?.id;
  };

  const canPlayCard = (card: any) => {
    return isMyTurn() && myPlayer && myPlayer.mana >= card.manaCost;
  };

  const handlePlayCard = (cardId: string) => {
    if (!isMyTurn() || !myPlayer) return;

    const action: GameAction = {
      type: 'play_card',
      playerId: myPlayer.id,
      cardId
    };

    socketService.sendGameAction(game.id, action);
    setSelectedCard(null);
  };

  const handleSelectAttacker = (entityId: string) => {
    if (!isMyTurn()) return;
    setSelectedAttacker(selectedAttacker === entityId ? null : entityId);
  };

  const handleAttack = (targetId: string) => {
    if (!isMyTurn() || !myPlayer || !selectedAttacker) return;

    const action: GameAction = {
      type: 'attack',
      playerId: myPlayer.id,
      attackerId: selectedAttacker,
      targetId
    };

    socketService.sendGameAction(game.id, action);
    setSelectedAttacker(null);
  };

  const handleEndTurn = () => {
    if (!isMyTurn() || !myPlayer) return;

    const action: GameAction = {
      type: 'end_turn',
      playerId: myPlayer.id
    };

    socketService.sendGameAction(game.id, action);
  };

  if (!myPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-400">Erreur: Joueur non trouvé</p>
      </div>
    );
  }

  const opponents = game.players.filter(p => p.id !== myPlayer.id && p.isAlive);

  return (
    <div className="min-h-screen p-4 flex flex-col">
      {/* Error/Info message */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg font-semibold">
          {error}
        </div>
      )}

      {/* Game info header */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Tour {game.turn}</h2>
          <p className="text-sm text-gray-400">
            {isMyTurn() ? (
              <span className="text-green-400 font-semibold">🎮 C'est votre tour!</span>
            ) : (
              <span className="text-yellow-400">⏳ Tour de {currentPlayer?.pseudo}</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Joueurs restants</p>
          <p className="text-2xl font-bold text-green-400">{game.players.filter(p => p.isAlive).length}/{game.players.length}</p>
        </div>
      </div>

      {/* Opponents area */}
      <div className="bg-gray-900 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-bold mb-3">Adversaires</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {opponents.map((opponent) => (
            <div
              key={opponent.id}
              onClick={() => selectedAttacker && handleAttack(opponent.hero.id)}
              className={`
                bg-gray-800 rounded-lg p-3 border-2
                ${currentPlayer?.id === opponent.id ? 'border-yellow-400' : 'border-gray-600'}
                ${selectedAttacker ? 'cursor-crosshair hover:border-red-400' : ''}
                transition-colors
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold truncate">{opponent.pseudo}</span>
                {currentPlayer?.id === opponent.id && (
                  <span className="text-yellow-400 text-xs">▶</span>
                )}
              </div>
              <div className="text-sm text-gray-400 mb-2">{opponent.hero.name}</div>
              <div className="flex gap-2 text-xs">
                <span className="bg-red-900 px-2 py-1 rounded">❤️ {opponent.hp}</span>
                <span className="bg-blue-900 px-2 py-1 rounded">💎 {opponent.mana}/{opponent.maxMana}</span>
              </div>
              {opponent.board.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  {opponent.board.length} créature(s)
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Battle field */}
      <div className="flex-1 bg-gray-900 rounded-lg p-4 mb-4 min-h-[200px]">
        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Opponent creatures */}
          <div className="border-2 border-red-500/30 rounded-lg p-2">
            <h4 className="text-sm font-bold mb-2 text-red-400">Créatures adverses</h4>
            <div className="flex flex-wrap gap-2">
              {opponents.flatMap(opp =>
                opp.board.map(creature => (
                  <div
                    key={creature.id}
                    onClick={() => selectedAttacker && handleAttack(creature.id)}
                    className={`cursor-pointer ${selectedAttacker ? 'ring-2 ring-red-400' : ''}`}
                  >
                    <Card card={creature} size="small" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My creatures */}
          <div className="border-2 border-green-500/30 rounded-lg p-2">
            <h4 className="text-sm font-bold mb-2 text-green-400">Vos créatures</h4>
            <div className="flex flex-wrap gap-2">
              {myPlayer.board.map(creature => (
                <div
                  key={creature.id}
                  onClick={() => handleSelectAttacker(creature.id)}
                  className={selectedAttacker === creature.id ? 'ring-4 ring-yellow-400' : ''}
                >
                  <Card
                    card={creature}
                    size="small"
                    isSelected={selectedAttacker === creature.id}
                    onClick={() => handleSelectAttacker(creature.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* My area */}
      <div className="bg-gray-800 rounded-lg p-4">
        {/* Hero and stats */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-purple-900 rounded-lg p-3">
              <div className="font-bold text-lg">{myPlayer.hero.name}</div>
              <div className="text-sm text-gray-400">{myPlayer.pseudo}</div>
            </div>
            <div className="flex gap-3">
              <div className="bg-red-900 px-4 py-2 rounded-lg">
                <div className="text-xs text-gray-400">HP</div>
                <div className="text-xl font-bold">{myPlayer.hp}/{myPlayer.hero.maxHp}</div>
              </div>
              <div className="bg-blue-900 px-4 py-2 rounded-lg">
                <div className="text-xs text-gray-400">Mana</div>
                <div className="text-xl font-bold">{myPlayer.mana}/{myPlayer.maxMana}</div>
              </div>
              <div className="bg-purple-900 px-4 py-2 rounded-lg">
                <div className="text-xs text-gray-400">Deck</div>
                <div className="text-xl font-bold">{myPlayer.deck.length}</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleEndTurn}
            disabled={!isMyTurn()}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              isMyTurn()
                ? 'bg-gradient-primary hover:scale-105'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            {isMyTurn() ? '✅ Fin du Tour' : '⏳ Attendre'}
          </button>
        </div>

        {/* Hand */}
        <div>
          <h3 className="text-sm font-bold mb-2">Main ({myPlayer.hand.length} cartes)</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {myPlayer.hand.map(card => (
              <Card
                key={card.id}
                card={card}
                onClick={() => handlePlayCard(card.id)}
                isPlayable={canPlayCard(card)}
                isSelected={selectedCard === card.id}
              />
            ))}
            {myPlayer.hand.length === 0 && (
              <div className="text-gray-500 italic py-4">Main vide</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Board;
