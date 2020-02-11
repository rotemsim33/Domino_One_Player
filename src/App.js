import React, {Component} from "react";
import './App.css';
import _cloneDeep from 'lodash/cloneDeep';
import {Board} from './Board';
import {PlayerCards} from './PlayerCards';
import {Packet} from './Packet';
import {EndGame} from './EndGame';
import {Statistics} from './Statis';
import {Timer} from './Timer';
import {ButtonsGame} from './ButtonsGame';
import {UndoButton} from './UndoButton';

const SIZE_GRID_COL=9;
const SIZE_GRID_ROW=7;
const AMOUNT_CARD_OF_PLAYER=6;
const AMOUNT_CARDS=6;
const MIDDLE_ROW=3;
const MIDDLE_COL=4;


class App extends Component {

    constructor(props) {
        super(props);
        const allCards = this.createPacketGame();
        let playerCards = [];
        let score = 0;
        for (let i = 0; i < AMOUNT_CARD_OF_PLAYER; i++) {
            const randomIndex = Math.floor(Math.random() * allCards.length);
            playerCards = playerCards.concat(allCards.splice(randomIndex, 1));
            score += Number(playerCards[i].side1) + Number(playerCards[i].side2);
        }

        let array = new Array(SIZE_GRID_ROW);
        for (let i = 0; i < SIZE_GRID_ROW; i++) {
            array[i] = new Array(SIZE_GRID_COL);
            array[i].fill(null);
        }

        this.state = {
            packetCards: allCards,
            board: array,
            playerCards,
            statistics: {
                amountOfTurns: 0,
                averageMoveTime: 0,
                amountTimeInSec: 0,
                pullFromPacket: 0,
                score
            },

            timer: {
                timerAllGame: {
                    timerElem: 0,
                    seconds: 0,
                    minuets: 0,
                    stopTime: '',
                },

                timerForTurn: {
                    seconds: 0,
                    minuets: 0,
                }

            }
        };

        this.optionalMove = [];
        this.prevStates = [];
        this.undoStates = [];
        this.currentIndex = 0;
        this.initialState=[];
        this.indexOfChoseCard=-1;
        this.resultGame="";
        this.endGame=false;
        this.take=0;
        this.clock;
    }

    startOverNewGame() {
        this.resultGame = "";
        this.endGame = false;
        this.take = 0;
        this.optionalMove = [];
        this.prevStates = [];
        this.undoStates = [];
        this.currentIndex = 0;
        this.indexOfChoseCard=-1;
        this.state.lightBox=false;
        this.startClock()
        this.setState({
            packetCards: this.initialState.packetCards,
            board: this.initialState.board,
            playerCards: this.initialState.playerCards,
            statistics: this.initialState.statistics,
            timer: this.initialState.timer
        }, ()=>this.saveStates(_cloneDeep( this.optionalMove)));
    }

    createPacketGame() {
        let cards = [];
        for (let i = 0; i <= AMOUNT_CARDS; i++) {
            for (let j = i; j <= AMOUNT_CARDS; j++) {
                const card = {
                    side1: i.toString(),
                    side2: j.toString(),
                    imgSide1: `images/${i}.png`,//'images/' + i + '.png'
                    imgSide2: `images/${j}.png`,//images/' + j + '.png'
                    duration: "horizontal",
                    canChose: "true"
                };
                cards.push(card);
            }
        }
        return cards;
    }

    addTick() {
        let minAll = this.state.timer.timerAllGame.minuets;
        let secAll = this.state.timer.timerAllGame.seconds;
        let minTurn = this.state.timer.timerForTurn.minuets;
        let secTurn = this.state.timer.timerForTurn.seconds;

        secTurn++;
        secAll++;
        if (secAll >= 60) {
            secAll = 0;
            minAll++;
        }
        if (secTurn >= 60) {
            secTurn = 0;
            minTurn++;
        }

        let timerAllGame = Object.assign({}, this.state.timer.timerAllGame);
        let timerForTurn = Object.assign({}, this.state.timer.timerForTurn);
        timerAllGame.minuets = minAll;
        timerAllGame.seconds = secAll;
        timerForTurn.minuets = minTurn;
        timerForTurn.seconds = secTurn;
        let timer = {timerAllGame, timerForTurn};
        this.setState({timer: timer});

    }

    startClock() {
        this.clock = setInterval(() => this.addTick(), 1000);
    }

    chosenCard(chosenCard) {
        this.indexOfChoseCard = this.state.playerCards.findIndex(card => card.side1 === chosenCard.side1 && card.side2 === chosenCard.side2);
        this.state.board[MIDDLE_ROW][MIDDLE_COL] === null ? this.renderAllStates() : "";
    }

    putFirstCardOnBoard(board, chooseCard) {
        board[MIDDLE_ROW][MIDDLE_COL] = chooseCard;
        this.pushNewItemToOptionalMoveArray(MIDDLE_ROW, MIDDLE_COL-1, "left", board[MIDDLE_ROW][MIDDLE_COL].side1, board[MIDDLE_ROW][MIDDLE_COL].duration);
        this.pushNewItemToOptionalMoveArray(MIDDLE_ROW, MIDDLE_COL+1, "right", board[MIDDLE_ROW][MIDDLE_COL].side2, board[MIDDLE_ROW][MIDDLE_COL].duration);

        if (board[MIDDLE_ROW][MIDDLE_COL].side1 === board[MIDDLE_ROW][MIDDLE_COL].side2) {
            this.pushNewItemToOptionalMoveArray(MIDDLE_ROW-1, MIDDLE_COL, "up", board[MIDDLE_ROW][MIDDLE_COL].side1,board[MIDDLE_ROW][MIDDLE_COL].duration);
            this.pushNewItemToOptionalMoveArray(MIDDLE_ROW+1, MIDDLE_COL, "down", board[MIDDLE_ROW][MIDDLE_COL].side2, board[MIDDLE_ROW][MIDDLE_COL].duration);
        }
        return board;
    }

    renderAllStates(row, col) {
        let board = this.putNewCardOnBoard(row, col);
        if (this.indexOfChoseCard>=0 && board !== null) { // 1-if you choose a card 2-if you choose a match card
            let playerCards = this.getStatusPLayerCard(board);
            let statistics = this.updateStatistics(playerCards);
            let timer = this.updateTime();
            this.checkEndGame(playerCards, this.state.packetCards);
            this.setState({
                board: board,
                playerCards: playerCards,
                statistics: statistics,
                timer: timer
            }, () => this.saveStates(_cloneDeep(this.optionalMove)));

            this.indexOfChoseCard=-1;
        }

    }

    updateTime() {
        let timer = this.state.timer;
        timer.timerForTurn.minuets = 0;
        timer.timerForTurn.seconds = 0;
        return timer;
    }

    putCardOnleft(chooseCard, num, durationOfCardNextToMe, indexOfOptionalArray, colOFEmptyPlace, rowOfEmptyPlace) {
        chooseCard.side1 === num ? this.replaceImagesSides(chooseCard) : "";
        if (chooseCard.side1 === chooseCard.side2) {
            if (this.state.board[rowOfEmptyPlace][colOFEmptyPlace + 1].duration === durationOfCardNextToMe) {
                durationOfCardNextToMe === "vertical" ? chooseCard.duration = "horizontal" : chooseCard.duration = "vertical";
            } else {
                chooseCard.duration = durationOfCardNextToMe;
            }
            this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace - 1, colOFEmptyPlace, "up", chooseCard.side1, chooseCard.duration);
            this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace + 1, colOFEmptyPlace, "down", chooseCard.side1, chooseCard.duration);
            this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace, colOFEmptyPlace - 1, "left", chooseCard.side1, chooseCard.duration);
        } else {
            chooseCard.duration = "horizontal";
            if (colOFEmptyPlace - 1 < 0) {
                if (rowOfEmptyPlace + 1 > SIZE_GRID_ROW - 1) {
                    this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace - 1, colOFEmptyPlace, "up", chooseCard.side1, "vertical")
                } else {
                    this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace + 1, colOFEmptyPlace, "down", chooseCard.side1, "vertical")

                    if (rowOfEmptyPlace - 1 >= 0) { //let the player option to decide in which direction he wish to go
                        this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace - 1, colOFEmptyPlace, "up", chooseCard.side1, "vertical");
                    }
                }
            } else {
                this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace, colOFEmptyPlace - 1, "left", chooseCard.side1, chooseCard.duration);
            }
        }
        this.optionalMove.splice(indexOfOptionalArray, 1);
    }

    putCardOnRight(chooseCard, num, durationOfCardNextToMe, indexOfOptionalArray, colOFEmptyPlace, rowOfEmptyPlace) {
        chooseCard.side2 === num ? this.replaceImagesSides(chooseCard) : "";

        if (chooseCard.side1 === chooseCard.side2) {
            if (this.state.board[rowOfEmptyPlace][colOFEmptyPlace - 1].duration === durationOfCardNextToMe) {
                durationOfCardNextToMe === "vertical" ? chooseCard.duration = "horizontal" : chooseCard.duration = "vertical";
            } else {
                chooseCard.duration = durationOfCardNextToMe;
            }
            this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace - 1, colOFEmptyPlace, "up", chooseCard.side1, chooseCard.duration);
            this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace + 1, colOFEmptyPlace, "down", chooseCard.side1, chooseCard.duration);
            this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace, colOFEmptyPlace + 1, "right", chooseCard.side1, chooseCard.duration);
        } else {

            if (colOFEmptyPlace + 1 > SIZE_GRID_COL - 1) {
                if (rowOfEmptyPlace + 1 > SIZE_GRID_ROW - 1) {
                    chooseCard.duration = "horizontal";
                    this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace - 1, colOFEmptyPlace, "up", chooseCard.side2, "vertical")

                } else {
                    chooseCard.duration = "horizontal";
                    this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace + 1, colOFEmptyPlace, "down", chooseCard.side2, "vertical")


                    if (rowOfEmptyPlace - 1 >= 0) { //let the player option to decide in which direction he wish to go
                        chooseCard.duration = "horizontal";
                        this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace - 1, colOFEmptyPlace, "up", chooseCard.side2, "vertical");
                    }
                }

            } else {
                chooseCard.duration = "horizontal";
                this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace, colOFEmptyPlace + 1, "right", chooseCard.side2, chooseCard.duration);
            }
        }
        this.optionalMove.splice(indexOfOptionalArray, 1)
    }

    putCardOnUp(chooseCard, num, durationOfCardNextToMe, indexOfOptionalArray, colOFEmptyPlace, rowOfEmptyPlace) {
        chooseCard.side1 === num ? this.replaceImagesSides(chooseCard) : "";

        if (chooseCard.side1 === chooseCard.side2) {
            if (this.state.board[rowOfEmptyPlace + 1][colOFEmptyPlace].duration === durationOfCardNextToMe) {
                durationOfCardNextToMe === "vertical" ? chooseCard.duration = "horizontal" : chooseCard.duration = "vertical";
            } else {
                chooseCard.duration = durationOfCardNextToMe;
            }
            this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace - 1, colOFEmptyPlace, "up", chooseCard.side1, chooseCard.duration);
            this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace, colOFEmptyPlace - 1, "left", chooseCard.side1, chooseCard.duration);
            this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace, colOFEmptyPlace + 1, "right", chooseCard.side1, chooseCard.duration);

        } else {

            if (rowOfEmptyPlace - 1 < 0) {
                if (colOFEmptyPlace + 1 > SIZE_GRID_COL - 1) {
                    chooseCard.duration = "vertical";
                    this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace, colOFEmptyPlace - 1, "left", chooseCard.side1, "horizontal");

                } else {
                    chooseCard.duration = "vertical";
                    this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace, colOFEmptyPlace + 1, "right", chooseCard.side1, "horizontal");

                    if (colOFEmptyPlace - 1 >= 0) { //let the player option to decide in which direction he wish to go
                        chooseCard.duration = "vertical";
                        this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace, colOFEmptyPlace - 1, "left", chooseCard.side1, "horizontal");
                    }
                }
            } else {
                chooseCard.duration = "vertical";
                this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace - 1, colOFEmptyPlace, "up", chooseCard.side1, chooseCard.duration);
            }
        }
        this.optionalMove.splice(indexOfOptionalArray, 1);
    }

    putCardOnDown(chooseCard, num, durationOfCardNextToMe, indexOfOptionalArray, colOFEmptyPlace, rowOfEmptyPlace) {
        chooseCard.side2 === num ? this.replaceImagesSides(chooseCard) : "";

        if (chooseCard.side1 === chooseCard.side2) {
            if (this.state.board[rowOfEmptyPlace - 1][colOFEmptyPlace].duration === durationOfCardNextToMe) {
                durationOfCardNextToMe === "vertical" ? chooseCard.duration = "horizontal" : chooseCard.duration = "vertical";
            } else {
                chooseCard.duration = durationOfCardNextToMe;
            }
            this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace + 1, colOFEmptyPlace, "down", chooseCard.side1, chooseCard.duration);
            this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace, colOFEmptyPlace - 1, "left", chooseCard.side1, chooseCard.duration);
            this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace, colOFEmptyPlace + 1, "right", chooseCard.side1, chooseCard.duration);
        } else {
            if (rowOfEmptyPlace + 1 > SIZE_GRID_ROW - 1) {
                if (colOFEmptyPlace + 1 > SIZE_GRID_COL - 1) {
                    chooseCard.duration = "vertical";
                    this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace, colOFEmptyPlace - 1, "left", chooseCard.side2, "horizontal");

                } else {
                    chooseCard.duration = "vertical";
                    this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace, colOFEmptyPlace + 1, "right", chooseCard.side2, "horizontal");

                    if (colOFEmptyPlace - 1 >= 0) { //let the player option to decide in which direction he wish to go
                        chooseCard.duration = "vertical";
                        this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace, colOFEmptyPlace - 1, "left", chooseCard.side2, "horizontal");
                    }
                }
            } else {
                chooseCard.duration = "vertical";
                this.pushNewItemToOptionalMoveArray(rowOfEmptyPlace + 1, colOFEmptyPlace, "down", chooseCard.side2, chooseCard.duration);
            }
        }
        this.optionalMove.splice(indexOfOptionalArray, 1);
    }

    pushNewItemToOptionalMoveArray(row, col, side, num, duration) {
        if (row >= 0 && row <= SIZE_GRID_ROW - 1 && col >= 0 && col <= SIZE_GRID_COL - 1) {
            this.optionalMove.push({
                row: row,
                col: col,
                side: side,
                num: num,
                duration: duration
            });
        }
    }

    replaceImagesSides(playerCard) {
        let temp = playerCard.side1;
        playerCard.side1 = playerCard.side2;
        playerCard.side2 = temp;
        temp = playerCard.imgSide1;
        playerCard.imgSide1 = playerCard.imgSide2;
        playerCard.imgSide2 = temp;
    }

    putNewCardOnBoard(row, col) {
        if (this.indexOfChoseCard >= 0) {
            let board = _cloneDeep(this.state.board);
            let chooseCard = this.state.playerCards[this.indexOfChoseCard];
            if (chooseCard.side1 === chooseCard.side2) {
                chooseCard.duration === "vertical" ? chooseCard.duration = "horizontal" : chooseCard.duration = "vertical";
            }

            if (this.state.board[MIDDLE_ROW][MIDDLE_COL] === null) {
                return this.putFirstCardOnBoard(board, chooseCard);
            }

            if (row !== undefined && col !== undefined) {
                let indexOfOptionalArray = this.optionalMove.findIndex(item => item.col === col && item.row === row && item.able==="true");
                let objectEmptyPlaceForCard = this.optionalMove[indexOfOptionalArray];
                let durationOfCardNextToMe = objectEmptyPlaceForCard.duration;
                let chosenSideByPlayer = objectEmptyPlaceForCard.side;
                let rowOfEmptyPlace = objectEmptyPlaceForCard.row;
                let colOFEmptyPlace = objectEmptyPlaceForCard.col;
                let num = objectEmptyPlaceForCard.num;

                if (num === chooseCard.side1 || num === chooseCard.side2) {
                    if (chosenSideByPlayer === "left") {
                        this.putCardOnleft(chooseCard, num, durationOfCardNextToMe, indexOfOptionalArray, colOFEmptyPlace, rowOfEmptyPlace);
                    }

                    if (chosenSideByPlayer === "right") {
                        this.putCardOnRight(chooseCard, num, durationOfCardNextToMe, indexOfOptionalArray, colOFEmptyPlace, rowOfEmptyPlace);
                    }

                    if (chosenSideByPlayer === "up") {
                        this.putCardOnUp(chooseCard, num, durationOfCardNextToMe, indexOfOptionalArray, colOFEmptyPlace, rowOfEmptyPlace);
                    }

                    if (chosenSideByPlayer === "down") {
                        this.putCardOnDown(chooseCard, num, durationOfCardNextToMe, indexOfOptionalArray, colOFEmptyPlace, rowOfEmptyPlace);
                    }
                    board[row][col] = chooseCard;
                }else{
                    return null;
                }
            }
            return board
        }
        return this.state.board;
    }

    getStatusPLayerCard(board) {
        let playerCards = _cloneDeep(this.state.playerCards);
        playerCards.splice(this.indexOfChoseCard, 1);
        this.initPLayerCard(playerCards);
        this.checkMoveOnBoard(playerCards, board);
        return playerCards;
    }

    initPLayerCard(playerCards) {
        playerCards.forEach(item => {
            item.canChose = "false";
        });
    }

    checkMoveOnBoard(playerCards, board) {
        this.optionalMove.forEach(item => {
            let check = true;
            playerCards.forEach(card => {
                if ((item.num === card.side1 || item.num === card.side2) && board[item.row][item.col] === null) {
                    check = false;
                    item.able = "true";
                    card.canChose = "true";
                }
            });
            check === true ? item.able = "false" : null;
        });
    }

    takeFromPacket() {
        this.take = 0;
        const card = this.state.playerCards.find(card => card.canChose === "true");
        if (!card) {
            this.take = 1;
            let playerCards = _cloneDeep(this.state.playerCards);
            let packetCards = _cloneDeep(this.state.packetCards);
            const randomIndex = Math.floor(Math.random() * packetCards.length);
            packetCards[randomIndex].canChose = "false";
            playerCards = playerCards.concat(packetCards.splice(randomIndex, 1));
            this.checkMoveOnBoard(playerCards, this.state.board);
            let statistics= this.updateStatistics(playerCards);
            let timer = this.updateTime();
            this.checkEndGame(playerCards,packetCards);
            this.setState({packetCards: packetCards, playerCards: playerCards, statistics:statistics, timer:timer} ,()=>  this.saveStates(_cloneDeep(this.optionalMove)));
        }
    }

    checkEndGame(playerCards,packetCards) {
        const card = playerCards.find(card => card.canChose === "true");
        if (card===undefined) {
            if (packetCards.length === 0) {
                if (playerCards.length === 0) {
                    this.resultGame = "win";
                } else {
                    this.resultGame = "lose";
                }
                this.endGame = true;
                clearInterval(this.clock);
            }
        }

    }

    updateStatistics(playerCards) {
        let statistics = _cloneDeep(this.state.statistics);
        statistics.amountOfTurns++;
        statistics.pullFromPacket += this.take;
        this.calculateScore(statistics, playerCards);
        this.calculateAvgTimeForTurn(statistics);
        return statistics;
    }

    calculateScore(statistics, playerCards) {
        statistics.score = 0;
        playerCards.forEach(card => {
            statistics.score += Number(card.side1) + Number(card.side2);
        })
    }

    calculateAvgTimeForTurn(statistics) {
        statistics.amountTimeInSec += this.state.timer.timerForTurn.seconds + (this.state.timer.timerForTurn.minuets * 60);
        let avgPlayTime = (statistics.amountTimeInSec / statistics.amountOfTurns);
        let m = Math.floor(avgPlayTime % 3600 / 60);
        let s = Math.floor(avgPlayTime % 3600 % 60);
        statistics.averageMoveTime = ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
    }

    saveStates(optionalMove) {
        let state = _cloneDeep(this.state);
        this.prevStates.push({optionalMove: optionalMove, states: state});
        this.undoStates.push({optionalMove: optionalMove, states: state});
        this.currentIndex++;
    }

    saveStatesAfterUndo(optionalMove) {
        let state = _cloneDeep(this.state);
        this.prevStates.push({optionalMove: optionalMove, states: state});
        this.currentIndex++;
    }

    restoreMoves(typeMove) {
        let restoreObject;
        if (typeMove === "prev") {
            if (this.currentIndex > 0) {
                restoreObject = this.prevStates[--this.currentIndex];
            }
        }

        if (typeMove === "next") {
            if (this.currentIndex < this.prevStates.length - 1) {
                restoreObject = this.prevStates[++this.currentIndex];
            }
        }

        if (restoreObject) {
            this.optionalMove = restoreObject.optionalMove;
            this.setState({
                board: restoreObject.states.board,
                packetCards: restoreObject.states.packetCards,
                playerCards: restoreObject.states.playerCards,
                statistics: restoreObject.states.statistics,
                timer: restoreObject.states.timer,
            });
        }
    }

    undoMove() {
        this.undoStates.pop();
        let restoreObject = this.undoStates[this.undoStates.length - 1];
        this.optionalMove = _cloneDeep(restoreObject.optionalMove);
        this.setState({
            board: _cloneDeep(restoreObject.states.board),
            packetCards: _cloneDeep(restoreObject.states.packetCards),
            playerCards: _cloneDeep(restoreObject.states.playerCards),
            statistics: _cloneDeep(restoreObject.states.statistics),
            timer: _cloneDeep(restoreObject.states.timer),
        }, () => this.saveStatesAfterUndo(_cloneDeep(this.optionalMove)));
    }

    removeLightBox() {
        this.setState({lightBox: true});
    }

    componentDidMount() {
        this.startClock();
        this.saveStates(_cloneDeep(this.optionalMove));
        this.initialState = _cloneDeep(this.state);
    }

    render() {
        return (
            <div className="starts">
                <div className={"board"}><Board board={this.state.board} endGame={this.endGame}
                                                optionalMove={this.optionalMove}
                                                renderAllStates={(row, col) => this.renderAllStates(row, col)}/>
                    <div className={"allPacket"}><Packet Packet={this.state.packetCards} endGame={this.endGame}  canTakeCard={this.canTakeCard} takeFromPacket={() => this.takeFromPacket()}/></div>
                    {this.endGame && !this.state.lightBox ? <div><EndGame resultGame={this.resultGame} removeLightBox={() => this.removeLightBox()}/> </div> : null}
                    {this.endGame ? <div><ButtonsGame startOverNewGame={() => this.startOverNewGame()} restoreMoves={(type) => this.restoreMoves(type)}/></div> : null}
                    {this.state.board[MIDDLE_ROW][MIDDLE_COL] !== null && !this.endGame ? <div><UndoButton undoMove={() => this.undoMove()}/></div> : null}
                </div>
                <div><PlayerCards playerCards={this.state.playerCards} endGame={this.endGame} chosenCard={(card) => this.chosenCard(card)}/></div>
                <div className={"static"}><Statistics playerStatistics={this.state.statistics}/></div>
                <Timer timer={this.state.timer}/>
            </div>
        )
    }
}


export default App;





























