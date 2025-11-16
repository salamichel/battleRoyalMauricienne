import { io, Socket } from 'socket.io-client';
import { Game, Hero, GameAction, PlayerStats } from '../types';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      this.socket = io(BACKEND_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('Connected to server:', this.socket?.id);
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Event emitters
  joinLobby() {
    this.socket?.emit('join_lobby');
  }

  getHeroes() {
    this.socket?.emit('get_heroes');
  }

  createGame(pseudo: string, heroId: string) {
    this.socket?.emit('create_game', { pseudo, heroId });
  }

  joinGame(gameId: string, pseudo: string, heroId: string) {
    this.socket?.emit('join_game', { gameId, pseudo, heroId });
  }

  leaveGame(gameId: string) {
    this.socket?.emit('leave_game', { gameId });
  }

  startGame(gameId: string) {
    this.socket?.emit('start_game', { gameId });
  }

  sendGameAction(gameId: string, action: GameAction) {
    this.socket?.emit('game_action', { gameId, action });
  }

  getPlayerStats(pseudo: string) {
    this.socket?.emit('get_stats', { pseudo });
  }

  // Event listeners
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
    this.socket?.on(event, callback as any);
  }

  off(event: string, callback?: Function) {
    if (callback) {
      this.socket?.off(event, callback as any);
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    } else {
      this.socket?.off(event);
      this.listeners.delete(event);
    }
  }

  // Typed event listeners
  onHeroesList(callback: (heroes: Hero[]) => void) {
    this.on('heroes_list', callback);
  }

  onLobbyGames(callback: (games: Game[]) => void) {
    this.on('lobby_games', callback);
  }

  onGameCreated(callback: (game: Game) => void) {
    this.on('game_created', callback);
  }

  onGameCreatedSuccess(callback: (game: Game) => void) {
    this.on('game_created_success', callback);
  }

  onGameUpdated(callback: (game: Game) => void) {
    this.on('game_updated', callback);
  }

  onPlayerJoined(callback: (data: { game: Game; player: any }) => void) {
    this.on('player_joined', callback);
  }

  onPlayerLeft(callback: (data: { gameId: string; playerId: string }) => void) {
    this.on('player_left', callback);
  }

  onCanStartGame(callback: (canStart: boolean) => void) {
    this.on('can_start_game', callback);
  }

  onGameStarted(callback: (game: Game) => void) {
    this.on('game_started', callback);
  }

  onGameStateUpdated(callback: (game: Game) => void) {
    this.on('game_state_updated', callback);
  }

  onTurnChanged(callback: (data: { currentPlayerId: string; turnNumber: number }) => void) {
    this.on('turn_changed', callback);
  }

  onGameEnded(callback: (game: Game) => void) {
    this.on('game_ended', callback);
  }

  onActionError(callback: (error: string) => void) {
    this.on('action_error', callback);
  }

  onJoinGameError(callback: (error: string) => void) {
    this.on('join_game_error', callback);
  }

  onCreateGameError(callback: (error: string) => void) {
    this.on('create_game_error', callback);
  }

  onPlayerStats(callback: (stats: PlayerStats | null) => void) {
    this.on('player_stats', callback);
  }

  // Leaderboard methods
  getLeaderboard(limit?: number) {
    this.socket?.emit('get_leaderboard', { limit });
  }

  onLeaderboardData(callback: (leaderboard: PlayerStats[]) => void) {
    this.on('leaderboard_data', callback);
  }

  onLeaderboardError(callback: (error: string) => void) {
    this.on('leaderboard_error', callback);
  }

  // Recent games methods
  getRecentGames(limit?: number) {
    this.socket?.emit('get_recent_games', { limit });
  }

  onRecentGamesData(callback: (games: any[]) => void) {
    this.on('recent_games_data', callback);
  }

  onRecentGamesError(callback: (error: string) => void) {
    this.on('recent_games_error', callback);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();
