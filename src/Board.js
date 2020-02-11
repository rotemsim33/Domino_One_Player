import React from "react";


const Row = props => {
    const indexRow= props.ch;
    const cells = props.cells;
    const endGame=props.endGame;

    const isIndexExist = (indexRow, indexCell) =>  props.optionalMove && props.optionalMove.find(item=> item.row===indexRow && item.col===indexCell && item.able==="true" );
    let item=(indexRow, indexCell)=> props.optionalMove.find(item=> item.row===indexRow && item.col===indexCell && item.able==="true" );

    return <ul className={"row"}>
        {cells.map((cell,indexCell) => (<li  className={"row"+ indexCell} key={`${indexRow}, ${indexCell}`}>
            {isIndexExist(indexRow, indexCell)? (<div className= {item(indexRow, indexCell).side ==="up" || item(indexRow, indexCell).side==="down"? "verticalEmptyPlace": "empty"} onClick={() => !endGame? props.renderAllStates(indexRow, indexCell): null}> </div>) :null}

            {(cell && cell.duration=== "vertical" || cell && cell.duration=== "horizontal") ?  (
                <div className={cell.duration}>
                    <div className={cell.duration + 'Side1'}
                         style={{backgroundImage: 'url(' + cell.imgSide1 + ')'}}>
                    </div>
                    <div className={cell.duration + 'Side2'}
                         style={{backgroundImage: 'url(' + cell.imgSide2 + ')'}}>
                    </div>

                </div>) : null}
            { cell===null && !isIndexExist(indexRow,indexCell)? <div className={"undefined"}> </div>: null}
        </li>))
        }

    </ul>
};



export const Board = props => {
    const renderAllStates=props.renderAllStates;
    const endGame= props.endGame;
    const board = props.board;
    const optionalMove=props.optionalMove;

    return (
        <ul className={"grid"}>
            {board.map((row,indexRow) => <li key={indexRow}><Row cells={row} ch={indexRow} endGame={endGame} optionalMove={optionalMove} renderAllStates={renderAllStates}/></li>)}
        </ul>
    )
};
