// ChessGameState.js

/**
 * ChessGameState Implementation.
 * @module Chess/ChessGameState
 */

import { useState, useEffect } from 'react';
import { getValidMoves, makeMove, kingUnderAttack } from './PieceMovement';
import { makeAIMove } from './ChessAI';

/**
 * Create the initial chessboard.
 * @function createInitialBoard
 * @param {boolean} isWhiteOnBottom - If true, the white pieces are on the bottom of the board.
 * @returns {Object} The initial chessboard.
 */
export const createInitialBoard = (isWhiteOnBottom) => {
  /**
   * The order of the pieces on the chessboard.
   * @type {Array}
   */
  const piecesOrder = isWhiteOnBottom ?
                      ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'] :
                      ['rook', 'knight', 'bishop', 'king', 'queen', 'bishop', 'knight', 'rook'];

  /**
   * The white pieces on the chessboard.
   * @type {Array}
   */
  const whitePieces = piecesOrder.map((type) => `w${type}`);

  /**
   * The black pieces on the chessboard.
   * @type {Array}
   */
  const blackPieces = piecesOrder.map((type) => `b${type}`);

  /**
   * The white pawns on the chessboard.
   * @type {Array}
   */
  const whitePawns = Array(8).fill('wpawn');

  /**
   * The black pawns on the chessboard.
   * @type {Array}
   */
  const blackPawns = Array(8).fill('bpawn');

  /**
   * A blank row on the chessboard.
   * @type {Array}
   */
  const blankRow = Array(8).fill('');

  /**
   * The rows of pieces on the chessboard.
   * @type {Array}
   */
  const piecesRows = [blackPieces, blackPawns, blankRow, blankRow, blankRow, blankRow, whitePawns, whitePieces];

  /**
   * The oriented rows on the chessboard.
   * @type {Array}
   */
  const orientedRows = isWhiteOnBottom ? piecesRows : piecesRows.slice().reverse();

  /**
   * The initial game state.
   * @type {Object}
   */
  let initialGameState = {
    board: orientedRows,
    blackCapturedPieces: [],
    whiteCapturedPieces: [],
    currentPlayer: 'w',
    whiteOnBottom: isWhiteOnBottom,
    lastMove: {},
    specialRequirements: {
      whiteShortCastle: true,
      whiteLongCastle: true,
      blackShortCastle: true,
      blackLongCastle: true,
    }
  };

  /**
   * Return the initial game state.
   * @returns {Object} The initial game state.
   */
  return initialGameState
};

/**
 * Custom hook to manage the chess game state.
 * @function useChessGameState
 * @returns {Array} The state and setters for game type, time limit, player color, message, and seconds.
 */
export const useChessGameState = () => {
  /**
   * State variable for game type.
   * @type {number}
   */
  const [gameType, setGameType] = useState(0);

  /**
   * State variable for time limit.
   * @type {number}
   */
  const [timeLimit, setTimeLimit] = useState(0);

  /**
   * State variable for player color.
   * @type {number}
   */
  const [playerColor, setPlayerColor] = useState(1);

  /**
   * State variable for message.
   * @type {string}
   */
  const [message, setMessage] = useState("");

  /**
   * State variable for seconds.
   * @type {Object}
   */
  const [seconds, setSeconds] = useState({ white: 0, black: 0 });

  /**
   * The initial game state.
   * @type {Object}
   */
  const initialGameState = createInitialBoard(playerColor);

  /**
   * State variable for game state.
   * @type {Object}
   */
  const [gameState, setGameState] = useState(initialGameState);

  /**
   * State variable for game over.
   * @type {boolean}
   */
  const [gameOver, setGameOver] = useState(false);

  /**
   * Map game type to difficulty.
   * @function mapGameTypeToDifficulty
   * @param {string} gameType - The type of the game.
   * @returns {number} The difficulty level.
   */
  const mapGameTypeToDifficulty = (gameType) => {
    /**
     * The difficulty map.
     * @type {Object}
     */
    const difficultyMap = {
      'Free Play': 0,
      'Easy': 1,
      'Medium': 2,
      'Hard': 3
    };
    return difficultyMap[gameType];
  };
  /**
   * Map time limit to seconds.
   * @function mapTimeLimitToSeconds
   * @param {string} timeLimit - The time limit of the game.
   * @returns {number} The time limit in seconds.
   */
  const mapTimeLimitToSeconds = (timeLimit) => {
    /**
     * The time map.
     * @type {Object}
     */
    const timeMap = {
      'No Time Limit': 0,
      '10 Minutes': 600,
      '5 Minutes': 300,
      '1 Minute': 60
    };
    return timeMap[timeLimit];
  };
  /**
   * Map color to number.
   * @function mapColorToNumber
   * @param {string} color - The color of the player.
   * @returns {number} The color number.
   */
  const mapColorToNumber = (color) => {
    /**
     * The color map.
     * @type {Object}
     */
    const colorMap = {
      'Black': 0,
      'White': 1,
      'Random': Math.round(Math.random())
    };
    return colorMap[color];
  };

  /**
   * Reset the game.
   * @function resetGame
   * @param {string} type - The type of the game.
   * @param {string} time - The time limit of the game.
   * @param {string} color - The color of the player.
   */
  const resetGame = (type, time, color) => {
    setGameOver(false);
    setMessage("");
    setSeconds({ white: 0, black: 0 });
    const difficulty = mapGameTypeToDifficulty(type);
    const timeInSeconds = mapTimeLimitToSeconds(time);
    const colorNumber = mapColorToNumber(color);
    setGameType(difficulty);
    setTimeLimit(timeInSeconds);
    setPlayerColor(colorNumber);
    const initialGameState = createInitialBoard(colorNumber);
    if (difficulty && !colorNumber) {
      setGameState(makeAIMove(initialGameState, difficulty));
    } else {
      setGameState(initialGameState);
    }
  };

  /**
   * Sleep for a specified number of milliseconds.
   * @function sleep
   * @param {number} ms - The number of milliseconds to sleep.
   * @returns {Promise} A promise that resolves after the specified number of milliseconds.
   */
  const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Update the game state.
   * @async
   * @function updateGameState
   * @param {Object} gameState - The current game state.
   * @param {Object} move - The move to make.
   */
  const updateGameState = async (gameState, move) => {
    /**
     * The game state after the player's move.
     * @type {Object}
     */
    const playerGameState = makeMove(gameState, move);
    console.log(timeLimit)

    /**
     * Check the game state after the player's move.
     * @function checkGameState
     * @param {Object} playerGameState - The game state after the player's move.
     */
    checkGameState(playerGameState);

    /**
     * Update the game state with the player's move.
     * @function setGameState
     * @param {Object} playerGameState - The game state after the player's move.
     */
    setGameState(playerGameState);

    // If the game type is not 'Free Play' and the game is not over, make the AI's move.
    if (gameType && !gameOver) {
      // Wait for 500 milliseconds.
      await sleep(500);

      /**
       * The game state after the AI's move.
       * @type {Object}
       */
      const AIGameState = makeAIMove(playerGameState, gameType);

      /**
       * Check the game state after the AI's move.
       * @function checkGameState
       * @param {Object} AIGameState - The game state after the AI's move.
       */
      checkGameState(AIGameState);

      /**
       * Update the game state with the AI's move.
       * @function setGameState
       * @param {Object} AIGameState - The game state after the AI's move.
       */
      setGameState(AIGameState);
    }
  };

  /**
   * Check the game state.
   * @function checkGameState
   * @param {Object} gameState - The current game state.
   */
  const checkGameState = (gameState) => {
    // Check if there's any move that would not result in a check
    if (kingUnderAttack(gameState, gameState.currentPlayer)) {

      const validMoves = getValidMoves(gameState, gameState.currentPlayer);

      for (let move of validMoves) {
        if (!kingUnderAttack(makeMove(gameState, move), gameState.currentPlayer)) {
          setMessage(`${gameState.currentPlayer === 'w' ? 'White' : 'Black'} is in check!`);
          return;
        }
      }

      setMessage(`${gameState.currentPlayer === 'b' ? 'White' : 'Black'} wins by checkmate!`);
      setGameOver(true);
    } else {
      setMessage("");
    }
  };

  /**
   * React useEffect hook to handle time limit and game over conditions.
   */
  useEffect(() => {
    if (timeLimit && !gameOver) {
      // If the white player's time has reached the time limit, black wins by timeout.
      if (seconds.white >= timeLimit) {
        setMessage('Black wins by timeout!');
        setGameOver(true);
      } 
      // If the black player's time has reached the time limit, white wins by timeout.
      else if (seconds.black >= timeLimit) {
        setMessage('White wins by timeout!');
        setGameOver(true);
      }

      /**
       * Set an interval to update the time every second.
       * @type {number}
       */
      const interval = setInterval(() => {
        // Only update the time if the game is not over.
        if (!gameOver) {
          setSeconds(seconds => ({
            white: gameState.currentPlayer === 'w' ? seconds.white + 1 : seconds.white,
            black: gameState.currentPlayer === 'b' ? seconds.black + 1 : seconds.black
          }));
        }
      }, 1000);

      // Clear the interval when the component unmounts.
      return () => clearInterval(interval);
    }
  }, [seconds, message, gameState, timeLimit, gameOver]);

  /**
   * Return the game state, updateGameState function, resetGame function, message, and seconds.
   * @returns {Object} The game state, updateGameState function, resetGame function, message, and seconds.
   */
  return {
    gameState,
    updateGameState,
    resetGame,
    message,
    seconds,
    timeLimit,
    gameOver
  };
};