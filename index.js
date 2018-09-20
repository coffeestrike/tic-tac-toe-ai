"use strict";
var pieces = ['X', 'O'];
var playerPiece = 'X';
var aiPiece = 'O';
var boardSize = 3;
var EMPTY_CELL = " ";
var chunk = function (array, size) { return (array.reduce(function (acc, curr, idx) {
    var i = Math.floor(idx / size);
    acc[i] = acc[i] ? acc[i] : [];
    acc[i].push(curr);
    return acc;
}, [])); };
var transpose = function (matrix) { return (matrix.reduce(function (prev, next) { return next.map(function (item, i) {
    return (prev[i] || []).concat(next[i]);
}); }, [])); };
var generateDiagonals = function (rowBoard) {
    var boardSize = rowBoard.length;
    var diagonals = [[], []];
    for (var idx = 0; idx < boardSize; idx++) {
        // @ts-ignore
        diagonals[0].push(rowBoard[idx][0 + idx]); // left diagonal
        // @ts-ignore
        diagonals[1].push(rowBoard[idx][boardSize - 1 - idx]); // right diagonal
    }
    return diagonals;
};
var checkWinner = function (board) {
    var rowBoard = chunk(board.state, board.size);
    var colBoard = transpose(rowBoard);
    var diagonals = generateDiagonals(rowBoard);
    var allResults = rowBoard.concat(colBoard).concat(diagonals);
    var winner = null;
    allResults.forEach(function (arr) {
        pieces.forEach(function (piece) {
            var winPattern = Array(board.size).fill(piece).join('');
            if (arr.join('') === winPattern) {
                winner = piece;
            }
        });
    });
    return winner;
};
var score = function (board) {
    var winner = checkWinner(board);
    if (winner === aiPiece) {
        return 10;
    }
    if (winner === playerPiece) {
        return -10;
    }
    return 0;
};
var getBestMove = function (board, depth, isAiPlayer, alpha, beta) {
    if (depth === void 0) { depth = 0; }
    if (isAiPlayer === void 0) { isAiPlayer = true; }
    if (alpha === void 0) { alpha = -Infinity; }
    if (beta === void 0) { beta = Infinity; }
    if (checkWinner(board) || board.state.filter(function (x) { return x === " "; }).length === 0) {
        return score(board);
    }
    var playedPiece = isAiPlayer ? "O" : "X";
    var bestMove = null;
    for (var idx = 0; idx < board.state.length; idx++) {
        var piece = board.state[idx];
        if (piece === " ") {
            var tempBoard = { state: board.state.slice(), size: board.size };
            tempBoard.state[idx] = playedPiece;
            var moveScore = getBestMove(tempBoard, depth + 1, !isAiPlayer, alpha, beta);
            if (isAiPlayer) {
                if (moveScore > alpha) {
                    bestMove = idx;
                }
                alpha = Math.max(moveScore, alpha);
            }
            else {
                if (moveScore < beta) {
                    bestMove = idx;
                }
                beta = Math.min(moveScore, beta);
            }
            if (beta <= alpha) {
                break;
            }
        }
    }
    if (depth === 0) {
        return bestMove;
    }
    return isAiPlayer ? alpha : beta;
};
var announce = function (message, callback) {
    var notification = document.getElementById("winner");
    var span = document.createElement("span");
    span.innerHTML = message;
    var action = document.createElement("a");
    action.setAttribute('href', '#');
    action.innerHTML = "Reset game";
    action.onclick = callback;
    notification.appendChild(span);
    notification.appendChild(document.createElement("br"));
    notification.appendChild(action);
};
var Game = /** @class */ (function () {
    function Game(boardSize) {
        var _this = this;
        this.gameOver = false;
        this.playerWinCount = 0;
        this.aiWinCount = 0;
        this.tieCount = 0;
        this.playMove = function (currentPiece, index) {
            var render = _this.render;
            _this.board.state[index] = currentPiece;
            _this.checkGameOver();
            render();
            if (!_this.gameOver && currentPiece === playerPiece) {
                // if (currentPlayer !== playerPiece) {
                // AI plays
                // }
                var bestMove = getBestMove(_this.board, 0);
                _this.playMove(aiPiece, bestMove);
            }
            else if (_this.gameOver && !_this.winner) {
                announce("Its a tie!", _this.reset);
            }
            else if (_this.gameOver) {
                announce("Game Over! Player " + _this.winner + " has won!", _this.reset);
            }
        };
        this.reset = function () {
            _this.board = {
                state: _this.board.state.map(function () { return EMPTY_CELL; }),
                size: _this.board.size
            };
            _this.gameOver = false;
            _this.winner = null;
            document.getElementById('winner').innerHTML = '';
            _this.render();
        };
        this.checkGameOver = function () {
            var board = _this.board;
            var winner = checkWinner(board);
            _this.gameOver = !!winner || board.state.filter(function (x) { return x === " "; }).length === 0;
            // @ts-ignore
            _this.winner = winner;
            if (winner === playerPiece) {
                _this.playerWinCount += 1;
            }
            if (winner === aiPiece) {
                _this.aiWinCount += 1;
            }
            if (!winner && _this.gameOver) {
                _this.tieCount += 1;
            }
        };
        this.render = function () {
            var _a = _this, board = _a.board, currentPlayer = _a.currentPlayer, playMove = _a.playMove;
            var tiles = document.querySelectorAll('.ttt_cell');
            document.getElementById('player-score').innerHTML = _this.playerWinCount;
            document.getElementById('opponent-score').innerHTML = _this.aiWinCount;
            document.getElementById('tie-score').innerHTML = _this.tieCount;
            board.state.forEach(function (piece, idx) {
                var tile = tiles[idx];
                tile.onclick = null;
                tile.onmouseenter = null;
                tile.onmouseleave = null;
                tile.innerHTML = "<div>" + piece + "</div>";
                if (piece === aiPiece) {
                    tile.setAttribute('class', 'ttt_cell opponent-piece');
                }
                else {
                    tile.setAttribute('class', 'ttt_cell player-piece');
                }
                if (!_this.gameOver && piece === ' ') {
                    tile.onmouseenter = function (e) {
                        tile.classList.add('simulated-move');
                        tile.innerHTML = "<div>" + currentPlayer + "</div>";
                    };
                    tile.onmouseleave = function () {
                        tile.classList.remove('simulated-move');
                        tile.innerHTML = '';
                    };
                    tile.onclick = function () { return playMove(currentPlayer, idx); };
                }
            });
        };
        this.board = {
            state: Array(boardSize * boardSize).fill(EMPTY_CELL),
            size: boardSize
        };
        this.currentPlayer = pieces[0];
    }
    return Game;
}());
document.addEventListener("DOMContentLoaded", function (e) {
    var game = new Game(3);
    game.render();
});
//# sourceMappingURL=index.js.map