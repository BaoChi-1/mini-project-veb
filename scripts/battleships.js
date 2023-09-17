const flipBtn = document.querySelector('#flip-btn')
const gamesBoard = document.querySelector('#gameboard-battleships')
const container = document.querySelector('.option-container')
const startBTN = document.querySelector('#start-btn')
const infoDisplay = document.querySelector('#info')
const turnDisplay = document.querySelector('#turn-display')
const resetBtn = document.querySelector('#reset-btn');

let angle = 0

function flip() {
    const optionShips = Array.from(container.children)
    if (angle === 0) {
        angle = 90
    } else {
        angle = 0
    }
    optionShips.forEach(optionShip => optionShip.style.transform = `rotate(${angle}deg)`)
}

flipBtn.addEventListener('click', flip)

const width = 10
function createBoard(color, user) {
    const gameBoard = document.createElement('div')
    gameBoard.classList.add('game-board')
    gameBoard.style.backgroundColor = color
    gameBoard.id = user
    for (let i = 0; i < width * width; i++) {
        const block = document.createElement('div')
        block.classList.add('block')
        block.id = i
        gameBoard.append(block)
    }
    gamesBoard.append(gameBoard)
}
createBoard('beige', 'player')
createBoard('coral', 'computer')

class Ship {
    constructor(name, length) {
        this.name = name
        this.length = length
    }
}
const destroyer = new Ship('destroyer', 2)
const submarine = new Ship('submarine', 3)
const cruiser = new Ship('cruiser', 3)
const battleship = new Ship('battleship', 4)
const carrier = new Ship('carrier', 5)

const ships = [destroyer, submarine, cruiser, battleship, carrier]
let notDropped

function getValidity(allBoardBlocks, isHorizontal, startIndex, ship) {
    let validStart = isHorizontal ? startIndex <= width * width - ship.length ? startIndex :
        width * width - ship.length :
        startIndex <= width * width - width * ship.length ? startIndex :
            startIndex - ship.length * width + width


    let shipBlocks = []
    for (let i = 0; i < ship.length; i++) {
        if (isHorizontal) {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i])
        } else {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i * width])
        }
    }
    let valid
    if (isHorizontal) {
        shipBlocks.every(($shipBlock, index) =>
            valid = shipBlocks[0].id % width !== width - (shipBlocks.length - (index + 1)))
    } else {
        shipBlocks.every(($shipBlock, index) => {
            valid = shipBlocks[0].id < 90 + (width * index + 1)
        })
    }

    const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'))
    return { shipBlocks, valid, notTaken }
}


function addShipPiece(user, ship, startId) {
    const allBoardBlocks = document.querySelectorAll(`#${user} div`)
    let randomStartId = Math.floor(Math.random() * width * width)
    let randomBoolean = Math.random() < 0.5
    let isHorizontal = user === 'player' ? angle === 0 : randomBoolean

    let startIndex = startId ? startId : randomStartId

    const { shipBlocks, valid, notTaken } = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

    if (valid && notTaken) {
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add(ship.name)
            shipBlock.classList.add('taken')
        })
    } else {
        if (user === 'computer') addShipPiece(user, ship, startId)
        if (user === 'player') notDropped = true
    }


}
ships.forEach(ship => addShipPiece('computer', ship))

const optionShips = Array.from(container.children)
optionShips.forEach(optionShip => optionShip.addEventListener('dragstart', dragStart))

let draggedShip

const allPlayerBlocks = document.querySelectorAll('#player div')
allPlayerBlocks.forEach(playerBlock => {
    playerBlock.addEventListener('dragover', dragOver)
    playerBlock.addEventListener('drop', dragDrop)

})

let isShipPlaced = false;

function dragStart(e) {
    notDropped = false
    draggedShip = e.target
    isShipPlaced = false;
}
function dragOver(e) {
    e.preventDefault()
    const ship = ships[draggedShip.id]
    highlightArea(e.target.id, ship)
}
function dragDrop(e) {
    const startId = e.target.id
    const ship = ships[draggedShip.id]
    if (isShipPlaced) {
        return
    }
    isShipPlaced = true;
    addShipPiece('player', ship, startId)
    if (!notDropped) {
        draggedShip.remove()
    }
}

function highlightArea(startIndex, ship) {
    const allBoardBlocks = document.querySelectorAll('#player div')
    let isHorizontal = angle === 0

    const { shipBlocks, valid, notTaken } = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)
    if (valid && notTaken) {
        shipBlocks.forEach(shipBlocks => {
            shipBlocks.classList.add('hover')
            setTimeout(() => shipBlocks.classList.remove('hover'), 300)
        })
    }
}
let gameOver = false
let playerTurn

function startGame() {
    if (container.children.length != 0) {
        infoDisplay.textContent = 'Please, place all your pieces first!'
    } else {
        const allBoardBlocks = document.querySelectorAll('#computer div')
        allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
        playerTurn = true
        turnDisplay.textContent = "It's your turn"
        infoDisplay.textContent = 'The game has started'
    }

}
startBTN.addEventListener('click', startGame)

let playerHits = []
let computerHits = []
const playerSunkShips = []
const computerSunkShips = []

function handleClick(e) {
    if (!gameOver) {
        if (e.target.classList.contains('taken')) {
            e.target.classList.add('boom')
            infoDisplay.textContent = "U hit the enemy's ship!"
            let classes = Array.from(e.target.classList)
            classes = classes.filter(className => className !== 'block')
            classes = classes.filter(className => className !== 'boom')
            classes = classes.filter(className => className !== 'taken')
            playerHits.push(...classes)
            checkScore('player', playerHits, playerSunkShips)



        }
        if (!e.target.classList.contains('taken')) {
            infoDisplay.textContent = "U missed"
            e.target.classList.add('empty')
        }
        playerTurn = false
        const allBoardBlocks = document.querySelectorAll('#computer div')

        allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)))
        setTimeout(computerGo, 3000)
    }
}
function computerGo() {
    if (!gameOver) {
        turnDisplay.textContent = "It's the enemy's turn!"
        infoDisplay.textContent = 'The enemy is thinking'

        setTimeout(() => {
            let randomGo = Math.floor(Math.random() * width * width)
            const allBoardBloacks = document.querySelectorAll('#player div')

            if (allBoardBloacks[randomGo].classList.contains('taken') && allBoardBloacks[randomGo].classList.contains('boom')
            ) {
                computerGo()
                return
            } else if (allBoardBloacks[randomGo].classList.contains('taken') && !allBoardBloacks[randomGo].classList.contains('boom')) {
                allBoardBloacks[randomGo].classList.add('boom')
                infoDisplay.textContent = 'The enemy hit your ship!'
                let classes = Array.from(allBoardBloacks[randomGo].classList)
                classes = classes.filter(className => className !== 'block')
                classes = classes.filter(className => className !== 'boom')
                classes = classes.filter(className => className !== 'taken')
                computerHits.push(...classes)
                checkScore('computer', computerHits, computerSunkShips)
            } else {
                infoDisplay.textContent = 'Miss'
                allBoardBloacks[randomGo].classList.add('empty')
            }
        }, 3000)
        setTimeout(() => {
            playerTurn = true
            turnDisplay.textContent = "It's your turn"
            infoDisplay.textContent = 'Please, take your turn'
            const allBoardBlocks = document.querySelectorAll('#computer div')
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
        }, 5000)
    }
}
function checkScore(user, userHits, userSunkShips) {
    function checkShip(shipName, shipLength) {
        if (
            userHits.filter(storedShipName => storedShipName === shipName).length === shipLength
        ) {
            if (user === 'player') {
                infoDisplay.textContent = `U sank an enemy ${shipName}`
                playerHits = userHits.filter(storedShipName => storedShipName !== shipName)
            }
            if (user === 'computer') {
                infoDisplay.textContent = `The enemy sank the your ${shipName}`
                computerHits = userHits.filter(storedShipName => storedShipName !== shipName)
            }
            userSunkShips.push(shipName)
        }

    }
    checkShip('destroyer', 2)
    checkShip('submarine', 3)
    checkShip('cruiser', 3)
    checkShip('battleship', 4)
    checkShip('carrier', 5)

    console.log('playerHits ', playerHits)
    console.log('playerSunkShips ', playerSunkShips)

    if (playerSunkShips.length === 5) {
        infoDisplay.textContent = 'U won!'
        alert('U won!')
        gameOver = true
    }
    if (computerSunkShips.length === 5) {
        infoDisplay.textContent = 'U lost :('
        alert('U lost :(')
        gameOver = true
    }
}

resetBtn.addEventListener('click', resetGame);

function resetGame() {
    const playerBoard = document.getElementById('player');
    const playerBlocks = playerBoard.querySelectorAll('.block');
    playerBlocks.forEach(block => {
        block.classList.remove('destroyer', 'submarine', 'cruiser', 'battleship', 'carrier', 'taken');
    });

    playerHits = [];
    computerHits = [];
    playerSunkShips.length = 0;
    computerSunkShips.length = 0;
    gameOver = false;

    infoDisplay.textContent = '';
    const computerBoard = document.getElementById('computer');
    const computerBlocks = computerBoard.querySelectorAll('.block');
    computerBlocks.forEach(block => block.classList.remove('destroyer', 'submarine', 'cruiser', 'battleship', 'carrier', 'taken'));

    ships.forEach(ship => {
        let placed = false;
        while (!placed) {
            const randomStartId = Math.floor(Math.random() * width * width);
            const randomBoolean = Math.random() < 0.5;
            const isHorizontal = randomBoolean;

            const { valid, notTaken } = getValidity(computerBlocks, isHorizontal, randomStartId, ship);

            if (valid && notTaken) {
                addShipPiece('computer', ship, randomStartId);
                placed = true;
            }
        }
    });

    optionShips.forEach(optionShip => container.appendChild(optionShip));
    optionShips.forEach(optionShip => optionShip.addEventListener('dragstart', dragStart));
    startBTN.disabled = false;
    turnDisplay.textContent = '';
}
