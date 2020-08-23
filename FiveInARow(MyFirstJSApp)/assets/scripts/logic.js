/**
 * Created by Admin on 2020.05.04..
 */

const Player = function(name, score=0, isOnTurn=false) {
    this.name = name;
    this.score = score;
    this.isOnTurn = isOnTurn;
};


const Piece = function(row, column, symbol) {
    this.row = row;
    this.column = column;
    this.symbol = symbol;
    this.id = `${this.row}_${this.column}`;
    // this.serialId = (this.row - 1) * 19 + this.column - 1;
    // this.boardPiece = document.getElementById(`${this.row}_${this.column}`);


};


// only applied to the first game
function gameStart() {
    setTimeout(function () {
        player1.name = prompt("Player 1 will have \"Blue Circle\" and will start the first round\n" +
            "Starting players will alternate each round\n" +
            "Player 1 please enter your name: ", "PLAYER 1");
        player1Name.innerHTML = player1.name;
        player2.name = prompt("Player 2 will have \"Red X\"\n" +
            "Player 2 please enter your name: ", "PLAYER 2");
        player2Name.innerHTML = player2.name;
    }, 1000);
}


function gameOver() {
    newGameButton.style.display = "inline-block";
    boardBlocker.style.display = "block";
}


// applied to all consecutive games but not the first
function gameReset() {
    newGameButton.style.display = "none";
    boardBlocker.style.display = "none";

    player1ResignButton.addEventListener("click", player1Resign);
    player2ResignButton.addEventListener("click", player2Resign);

    for (let id = 0; id < imageIdCounter; id++) {
        let symbolImage = document.getElementById(`symbol${id}`);
        symbolImage.parentNode.removeChild(symbolImage);
    }

    imageIdCounter = 0;
    pieces = [];
    p1Pieces = [];
    p2Pieces = [];

    if (Boolean((player1.score + player2.score) % 2)) {
        player1.isOnTurn = false;
        player2.isOnTurn = true;
        playersTurnHighlight();
    } else {
        player1.isOnTurn = true;
        player2.isOnTurn = false;
        playersTurnHighlight();
    }
}


// highlighting the box of player on turn
function playersTurnHighlight () {
        if (player1.isOnTurn === true){
            player1Box.style.border = "2px solid red";
            player2Box.style.border = "2px solid #ffb366";
        }
        if (player2.isOnTurn === true){
            player2Box.style.border = "2px solid red";
            player1Box.style.border = "2px solid #ffb366";
        }
}


// all the events that happen when a board piece is clicked
function clickFunc(row, column){
    let occupied = false;

    for (let i = 0; i < pieces.length; i++){
        if ((pieces[i].row === row) && pieces[i].column === column){
            occupied = true;
        }
    }

    if ((row === undefined) || (column === undefined)) {
        alert("ERROR!\nPOSITIONS UNDEFINED!");
    } else if(occupied) {
        alert("ILLEGAL MOVE!\nCHOOSE ANOTHER PLACE!");
    } else {
        let symbol = document.createElement("img");
        symbol.setAttribute("id", `symbol${imageIdCounter}`);
        imageIdCounter++;
        let boardPiece = document.getElementById(`${row}_${column}`);

        if (player1.isOnTurn) {
            symbol.setAttribute("src", "images/blueCircle.png");
            symbol.setAttribute("alt", "blueCircle");
            boardPiece.appendChild(symbol);

            let piece = new Piece(row, column, "p1symbol");
            pieces.push(piece);

            checkP1Pieces();

            player1.isOnTurn = false;
            player2.isOnTurn = true;
            playersTurnHighlight();
        } else if (player2.isOnTurn) {
            symbol.setAttribute("src", "images/redX.png");
            symbol.setAttribute("alt", "redX");
            boardPiece.appendChild(symbol);

            let piece = new Piece(row, column, "p2symbol");
            pieces.push(piece);

            checkP2Pieces();

            player1.isOnTurn = true;
            player2.isOnTurn = false;
            playersTurnHighlight();
        } else {
            alert(`ERROR!\nNONE OF THE PLAYERS ARE ON TURN!\nClicked row: ${row} col: ${column}`);
        }
    }
}


// check all 'player 1' pieces for victory evaluation
function checkP1Pieces() {
    for (let i = 0; i < pieces.length; i++){
        if (pieces[i].symbol === "p1symbol") {
            p1Pieces.push(pieces[i]);
        }
    }
    checkVictory(p1Pieces);
}


// check all 'player 2' pieces for victory evaluation
function checkP2Pieces() {
    for (let i = 0; i < pieces.length; i++){
        if (pieces[i].symbol === "p2symbol") {
            p2Pieces.push(pieces[i]);
        }
    }
    checkVictory(p2Pieces);
}


// check for victory on ALL pieces in ALL directions
function checkVictory(playerPieces){
    for (let i = 0; i < playerPieces.length; i++) {
        let player;
        if (playerPieces[i].symbol === "p1symbol"){
            player = player1;
        } else {
            player = player2;
        }

        let victory = false;

        if (checkDirection1(playerPieces, playerPieces[i], victory) ||
            checkDirection2(playerPieces, playerPieces[i], victory) ||
            checkDirection3(playerPieces, playerPieces[i], victory) ||
            checkDirection4(playerPieces, playerPieces[i], victory))
        {
            victory = true;
        }


        if (victory){
            if (player === player1){
                player1ResignButton.removeEventListener("click", player1Resign);
                player2ResignButton.removeEventListener("click", player2Resign);

                player1.score++;
                player1Score.innerHTML = player1.score;
                setTimeout(function () {
                    alert(`GAME OVER!\n${player1.name} HAS WON!`);
                }, 50);
                gameOver();
                break;
            } else {
                player1ResignButton.removeEventListener("click", player1Resign);
                player2ResignButton.removeEventListener("click", player2Resign);

                player2.score++;
                player2Score.innerHTML = player2.score;
                setTimeout(function () {
                    alert(`GAME OVER!\n${player2.name} HAS WON!`);
                }, 50);
                gameOver();
                break;
            }
        }
    }
}


// horizontal
function checkDirection1(playersPieces, piece, victory) {
    const row = piece.row;
    const column = piece.column;
    let gameOver = victory;
    let foundStreak = [false, false, false, false];

    for (let distance = 1; distance < 5; distance++){
        for (let i = 0; i < playersPieces.length; i++){
            if ((playersPieces[i].row === row) && (playersPieces[i].column === column + distance)){
                foundStreak[distance - 1] = true;
            } else {
                // continue;
            }
        }
    }
    if (foundStreak[0] && foundStreak[1] && foundStreak[2] && foundStreak[3]){
        gameOver = true;
    }
    return gameOver;
}


// downwards diagonal
function checkDirection2(playersPieces, piece, victory) {
    const row = piece.row;
    const column = piece.column;
    let gameOver = victory;
    let foundStreak = [false, false, false, false];

    for (let distance = 1; distance < 5; distance++){
        for (let i = 0; i < playersPieces.length; i++){
            if ((playersPieces[i].row === row + distance) && (playersPieces[i].column === column + distance)){
                foundStreak[distance - 1] = true;
            } else {
                // continue;
            }
        }
    }
    if (foundStreak[0] && foundStreak[1] && foundStreak[2] && foundStreak[3]){
        gameOver = true;
    }
    return gameOver;
}


// vertical
function checkDirection3(playersPieces, piece, victory) {
    const row = piece.row;
    const column = piece.column;
    let gameOver = victory;
    let foundStreak = [false, false, false, false];

    for (let distance = 1; distance < 5; distance++){
        for (let i = 0; i < playersPieces.length; i++){
            if ((playersPieces[i].row === row + distance) && (playersPieces[i].column === column)){
                foundStreak[distance - 1] = true;
            } else {
                // continue;
            }
        }
    }
    if (foundStreak[0] && foundStreak[1] && foundStreak[2] && foundStreak[3]){
        gameOver = true;
    }
    return gameOver;
}


// upwards diagonal
function checkDirection4(playersPieces, piece, victory) {
    const row = piece.row;
    const column = piece.column;
    let gameOver = victory;
    let foundStreak = [false, false, false, false];

    for (let distance = 1; distance < 5; distance++){
        for (let i = 0; i < playersPieces.length; i++){
            if ((playersPieces[i].row === row + distance) && (playersPieces[i].column === column - distance)){
                foundStreak[distance - 1] = true;
            } else {
                // continue;
            }
        }
    }
    if (foundStreak[0] && foundStreak[1] && foundStreak[2] && foundStreak[3]){
        gameOver = true;
    }
    return gameOver;
}


function player1Resign(){
    player1ResignButton.removeEventListener("click", player1Resign);
    player2ResignButton.removeEventListener("click", player2Resign);

    player2.score++;
    player2Score.innerHTML = player2.score;
    setTimeout(function () {
        alert(`GAME OVER!\n${player1.name}GAVE UP!\n${player2.name} HAS WON!`);
    }, 50);
    gameOver();
}


function player2Resign(){
    player1ResignButton.removeEventListener("click", player1Resign);
    player2ResignButton.removeEventListener("click", player2Resign);

    player1.score++;
    player1Score.innerHTML = player1.score;
    setTimeout(function () {
        alert(`GAME OVER!\n${player2.name}GAVE UP!\n${player1.name} HAS WON!`);
    }, 50);
    gameOver();
}


const nrOfRows = 19;
const nrOfColumns = 19;
let pieces = [];
let p1Pieces = [];
let p2Pieces = [];
let boardPieces = [];
let imageIdCounter = 0;

let player1 = new Player("PLAYER 1");
let player2 = new Player("PLAYER 2");

newGameButton.addEventListener("click", gameReset);
player1ResignButton.addEventListener("click", player1Resign);
player2ResignButton.addEventListener("click", player2Resign);

player1.isOnTurn = true;
playersTurnHighlight();

for (let rowCounter = 1; rowCounter <= nrOfRows; rowCounter++){
    for (let columnCounter = 1; columnCounter <= nrOfColumns; columnCounter++) {

        let boardPiece = document.createElement("div");

        boardPiece.setAttribute("id", `${rowCounter}_${columnCounter}`);
        board.appendChild(boardPiece);
        boardPiece.addEventListener("click", clickFunc.bind(this, rowCounter, columnCounter));
        boardPieces.push(boardPiece);
    }
}
