import { Server, Socket } from 'socket.io';
import { GameService } from '../services/gameService';
import { PlayerService } from '../services/playerService';
import { GameHistoryService } from '../services/gameHistoryService';
import { heroes } from '../data/heroes';
import { GameAction } from '../models/Card';

export function setupGameSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join lobby
    socket.on('join_lobby', () => {
      socket.join('lobby');
      const games = GameService.getAvailableGames();
      socket.emit('lobby_games', games);
    });

    // Get heroes
    socket.on('get_heroes', () => {
      socket.emit('heroes_list', heroes);
    });

    // Get leaderboard
    socket.on('get_leaderboard', async (data?: { limit?: number }) => {
      try {
        const limit = data?.limit || 10;
        const topPlayers = await PlayerService.getTopPlayers(limit);
        socket.emit('leaderboard_data', topPlayers);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        socket.emit('leaderboard_error', 'Failed to fetch leaderboard');
      }
    });

    // Get recent games
    socket.on('get_recent_games', async (data?: { limit?: number }) => {
      try {
        const limit = data?.limit || 10;
        const recentGames = await GameHistoryService.getRecentGames(limit);
        socket.emit('recent_games_data', recentGames);
      } catch (error) {
        console.error('Error fetching recent games:', error);
        socket.emit('recent_games_error', 'Failed to fetch recent games');
      }
    });

    // Create game
    socket.on('create_game', (data: { pseudo: string; heroId: string }) => {
      try {
        const { pseudo, heroId } = data;

        if (!pseudo || pseudo.length > 20) {
          socket.emit('create_game_error', 'Invalid pseudo');
          return;
        }

        const hero = heroes.find(h => h.id === heroId);
        if (!hero) {
          socket.emit('create_game_error', 'Invalid hero');
          return;
        }

        // Create game
        const game = GameService.createGame(socket.id);

        // Create player
        const player = PlayerService.createPlayer(socket.id, pseudo, hero);

        // Add player to game
        GameService.addPlayerToGame(game.id, player);

        // Join socket room for this game
        socket.join(game.id);

        // Notify
        socket.emit('game_created_success', game);
        io.to('lobby').emit('game_created', game);

        console.log(`Game created: ${game.id} by ${pseudo}`);
      } catch (error) {
        console.error('Error creating game:', error);
        socket.emit('create_game_error', 'Failed to create game');
      }
    });

    // Join game
    socket.on('join_game', (data: { gameId: string; pseudo: string; heroId: string }) => {
      try {
        const { gameId, pseudo, heroId } = data;

        if (!pseudo || pseudo.length > 20) {
          socket.emit('join_game_error', 'Invalid pseudo');
          return;
        }

        const hero = heroes.find(h => h.id === heroId);
        if (!hero) {
          socket.emit('join_game_error', 'Invalid hero');
          return;
        }

        const game = GameService.getGame(gameId);
        if (!game) {
          socket.emit('join_game_error', 'Game not found');
          return;
        }

        if (game.status !== 'waiting') {
          socket.emit('join_game_error', 'Game already started');
          return;
        }

        if (game.players.length >= 9) {
          socket.emit('join_game_error', 'Game is full');
          return;
        }

        // Create player
        const player = PlayerService.createPlayer(socket.id, pseudo, hero);

        // Add player to game
        const success = GameService.addPlayerToGame(gameId, player);
        if (!success) {
          socket.emit('join_game_error', 'Failed to join game');
          return;
        }

        // Join socket room
        socket.join(gameId);

        // Notify all players in game
        io.to(gameId).emit('player_joined', { game, player });

        // Check if can start (2+ players)
        if (game.players.length >= 2) {
          io.to(gameId).emit('can_start_game', true);
        }

        // Update lobby
        io.to('lobby').emit('game_updated', game);

        console.log(`${pseudo} joined game ${gameId}`);
      } catch (error) {
        console.error('Error joining game:', error);
        socket.emit('join_game_error', 'Failed to join game');
      }
    });

    // Leave game
    socket.on('leave_game', (data: { gameId: string }) => {
      try {
        const { gameId } = data;
        const game = GameService.getGame(gameId);
        if (!game) return;

        // Find player by socket ID
        const player = game.players.find(p => p.socketId === socket.id);
        if (!player) return;

        // Remove player
        GameService.removePlayerFromGame(gameId, player.id);

        // Leave socket room
        socket.leave(gameId);

        // Notify
        io.to(gameId).emit('player_left', { gameId, playerId: player.id });
        io.to('lobby').emit('game_updated', game);

        console.log(`${player.pseudo} left game ${gameId}`);
      } catch (error) {
        console.error('Error leaving game:', error);
      }
    });

    // Start game
    socket.on('start_game', (data: { gameId: string }) => {
      try {
        const { gameId } = data;
        const game = GameService.getGame(gameId);

        if (!game) {
          socket.emit('start_game_error', 'Game not found');
          return;
        }

        if (game.creatorId !== socket.id) {
          socket.emit('start_game_error', 'Only creator can start game');
          return;
        }

        if (game.players.length < 2) {
          socket.emit('start_game_error', 'Need at least 2 players');
          return;
        }

        const success = GameService.startGame(gameId);
        if (!success) {
          socket.emit('start_game_error', 'Failed to start game');
          return;
        }

        // Notify all players
        io.to(gameId).emit('game_started', game);

        // Remove from lobby
        io.to('lobby').emit('game_updated', game);

        console.log(`Game ${gameId} started with ${game.players.length} players`);
      } catch (error) {
        console.error('Error starting game:', error);
        socket.emit('start_game_error', 'Failed to start game');
      }
    });

    // Game action
    socket.on('game_action', async (data: { gameId: string; action: GameAction }) => {
      try {
        const { gameId, action } = data;
        const game = GameService.getGame(gameId);

        if (!game) {
          socket.emit('action_error', 'Game not found');
          return;
        }

        // Verify player
        const player = game.players.find(p => p.socketId === socket.id);
        if (!player) {
          socket.emit('action_error', 'Player not in game');
          return;
        }

        // Process action
        const result = GameService.processAction(gameId, action);

        if (!result.success) {
          socket.emit('action_error', result.message || 'Action failed');
          return;
        }

        // Broadcast updated game state
        io.to(gameId).emit('game_state_updated', game);

        // Handle specific action types
        if (action.type === 'end_turn') {
          const currentPlayer = game.players[game.currentPlayerIndex];
          io.to(gameId).emit('turn_changed', {
            currentPlayerId: currentPlayer.id,
            turnNumber: game.turn
          });
        }

        // Check if game ended
        if (game.status === 'finished' && game.winner) {
          io.to(gameId).emit('game_ended', game);

          // Save game to history
          await GameHistoryService.saveGameToHistory(game);

          // Update stats for all players
          for (const p of game.players) {
            const won = p.id === game.winner?.id;
            await PlayerService.updatePlayerStats(p.pseudo, won, 0, p.hero.id);
          }

          console.log(`Game ${gameId} ended. Winner: ${game.winner.pseudo}`);

          // Clean up game after 5 minutes
          setTimeout(() => {
            GameService.deleteGame(gameId);
          }, 5 * 60 * 1000);
        }
      } catch (error) {
        console.error('Error processing action:', error);
        socket.emit('action_error', 'Failed to process action');
      }
    });

    // Get player stats
    socket.on('get_stats', async (data: { pseudo: string }) => {
      try {
        const { pseudo } = data;
        const stats = await PlayerService.getPlayerStats(pseudo);
        socket.emit('player_stats', stats);
      } catch (error) {
        console.error('Error getting stats:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);

      // Remove player from any games they're in
      const games = GameService.getAllGames();
      games.forEach(game => {
        const player = game.players.find(p => p.socketId === socket.id);
        if (player) {
          GameService.removePlayerFromGame(game.id, player.id);
          io.to(game.id).emit('player_left', { gameId: game.id, playerId: player.id });
          io.to('lobby').emit('game_updated', game);
        }
      });
    });
  });
}
