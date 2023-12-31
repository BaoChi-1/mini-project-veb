const gameBoard = document.querySelector('#gameboard-tic-tac-toe');
const infoDisplay = document.querySelector('#info');
const resetButton = document.querySelector('#reset-btn');

const startCells = [
    "", "", "", "", "", "", "", "", ""
]
let go = "circle"
infoDisplay.textContent = "Circle goes first"

function createBoard() {
    startCells.forEach((index) => {
        const cellElements = document.createElement('div')
        cellElements.classList.add('square1')
        cellElements.id = index;
        cellElements.addEventListener('click', addGo)
        gameBoard.append(cellElements)
    })
}
createBoard()


function addGo(e) {
    const goDisplay = document.createElement('div')
    goDisplay.classList.add(go)
    e.target.append(goDisplay)
    go = go === "circle" ? "cross" : "circle"
    infoDisplay.textContent = `It's now ${go}'s go`
    e.target.removeEventListener("click", addGo)
    checkScore()
}
function checkScore() {
    const allSquares = document.querySelectorAll(".square1")
    const winningCombo = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ]
    winningCombo.forEach(array => {
        let circleWins = array.every(cell =>
            allSquares[cell].firstChild?.classList.contains('circle'))
        let crossWins = array.every(cell =>
            allSquares[cell].firstChild?.classList.contains('cross'))
        if (circleWins) {
            infoDisplay.textContent = "Circle Wins!"
            allSquares.forEach(square => square.replaceWith(square.cloneNode(true)))
            alert("Circle wins!")
            resetBoard();
            return
        } else if (crossWins) {
            infoDisplay.textContent = "Cross Wins!"
            allSquares.forEach(square => square.replaceWith(square.cloneNode(true)))
            alert("Cross wins!")
            resetBoard();
            return
        }


    })
    if (checkDraw()) {
        infoDisplay.textContent = "It's a draw"
        allSquares.forEach(square => square.replaceWith(square.cloneNode(true)))
        alert("It's a draw")
        resetBoard();
        return
    }
}

resetButton.addEventListener('click', resetBoard);

function resetBoard() {
    const allSquares = document.querySelectorAll(".square1");
    allSquares.forEach(square => {
        square.innerHTML = ''; // Очищаем содержимое ячейки
        square.addEventListener('click', addGo); // Восстанавливаем обработчик клика
    });
    infoDisplay.textContent = "Circle goes first";
    go = "circle";
}
function checkDraw() {
    const allSquares = document.querySelectorAll(".square1");
    for (let square of allSquares) {
        if (!square.firstChild || (!square.firstChild.classList.contains('cross') && !square.firstChild.classList.contains('circle'))) {
            return false;
        }
    }
    return true;
}
