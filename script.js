const mainBoard = document.getElementById('main-board');
const resetBtn = document.getElementById('reset-btn');
const winnerDisplay = document.createElement('div');
let currentPlayer = 'X';
let mainGameWon = false;
let scores = { X: 0, O: 0 };
let nextBoard = null; // Tracks the board the next player must play in

winnerDisplay.setAttribute('id', 'winner-display');
winnerDisplay.style.display = 'none';
document.body.insertBefore(winnerDisplay, resetBtn);

const smallBoards = Array.from(document.getElementsByClassName('board'));
const scoreXDisplay = document.getElementById('score-x');
const scoreODisplay = document.getElementById('score-o');

// Initialize small boards
smallBoards.forEach((board, boardIndex) => {
    for (let i = 0; i < 9; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.dataset.index = i;
        square.dataset.board = boardIndex;
        square.addEventListener('click', () => playMove(boardIndex, i));
        board.appendChild(square);
    }
});

resetBtn.addEventListener('click', resetGame);

function playMove(boardIndex, squareIndex) {
    if (mainGameWon) return;

    const board = smallBoards[boardIndex];
    const square = board.children[squareIndex];

    // Ensure no moves can be made in a board that has already been won
    if (board.dataset.won) {
        // Visual indication for invalid move in a won board
        board.classList.add('invalid');
        setTimeout(() => {
            board.classList.remove('invalid');
        }, 1500);
        return;
    }

    // Ensure the move is in the correct board
    if (nextBoard !== null && nextBoard !== boardIndex && !smallBoards[nextBoard].dataset.won) {
        // Visual indication for invalid board selection
        smallBoards[boardIndex].classList.add('invalid');
        setTimeout(() => {
            smallBoards[boardIndex].classList.remove('invalid');
        }, 1500);
        return;
    }

    // Ensure the square hasn't been played already
    if (square.dataset.player) return;

    // Mark the square
    square.dataset.player = currentPlayer;
    square.textContent = currentPlayer;

    // Check if this move wins the small board
    if (checkSmallBoardWin(board)) {
        board.dataset.won = currentPlayer;
        board.classList.add(currentPlayer === 'X' ? 'won-x' : 'won-o');
        if (checkMainBoardWin()) {
            displayWinner(`${currentPlayer} wins the game!`);
            scores[currentPlayer]++;
            updateScores();
            mainGameWon = true;
            triggerConfetti();
            return;
        }
    } else if (checkDraw(board)) {
        board.dataset.won = 'draw';
        board.classList.add('draw');
    }

    // Determine the next board to play in
    nextBoard = squareIndex;

    // If the next board is won or drawn, allow play on any board
    if (smallBoards[nextBoard].dataset.won) {
        nextBoard = null;
    }

    // Highlight the next board or all boards if the next one is won/drawn
    highlightNextBoard();

    // Switch players and update the scoreboard highlight
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator();
}

function checkSmallBoardWin(board) {
    const squares = Array.from(board.children);
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]              // Diagonals
    ];

    return winConditions.some(condition => {
        const [a, b, c] = condition;
        return squares[a].dataset.player === currentPlayer &&
               squares[a].dataset.player === squares[b].dataset.player &&
               squares[a].dataset.player === squares[c].dataset.player;
    });
}

function checkDraw(board) {
    return Array.from(board.children).every(square => square.dataset.player);
}

function checkMainBoardWin() {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]              // Diagonals
    ];

    return winConditions.some(condition => {
        const [a, b, c] = condition;
        return smallBoards[a].dataset.won === currentPlayer &&
               smallBoards[a].dataset.won === smallBoards[b].dataset.won &&
               smallBoards[a].dataset.won === smallBoards[c].dataset.won;
    });
}

function resetGame() {
    mainGameWon = false;
    nextBoard = null;
    winnerDisplay.style.display = 'none';
    smallBoards.forEach(board => {
        board.removeAttribute('data-won');
        board.classList.remove('won-x', 'won-o', 'draw', 'invalid', 'highlight', 'confetti');
        Array.from(board.children).forEach(square => {
            square.removeAttribute('data-player');
            square.textContent = ''; // Clear the square content
        });
    });
    currentPlayer = 'X';
    updateTurnIndicator();
    highlightNextBoard();
}

function updateScores() {
    scoreXDisplay.textContent = `Player X: ${scores.X}`;
    scoreODisplay.textContent = `Player O: ${scores.O}`;
}

function highlightNextBoard() {
    smallBoards.forEach((board, index) => {
        if (nextBoard === null || nextBoard === index) {
            board.classList.add('highlight');
        } else {
            board.classList.remove('highlight');
        }
    });
}

function updateTurnIndicator() {
    scoreXDisplay.classList.remove('active');
    scoreODisplay.classList.remove('active');
    if (currentPlayer === 'X') {
        scoreXDisplay.classList.add('active');
    } else {
        scoreODisplay.classList.add('active');
    }
}

function displayWinner(winnerText) {
    winnerDisplay.textContent = winnerText;
    winnerDisplay.style.display = 'block';
}

function triggerConfetti() {
    smallBoards.forEach(board => {
        board.classList.add('confetti');
    });
}