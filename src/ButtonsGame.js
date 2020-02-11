import React from "react";

export const ButtonsGame=props=>{
    return(
        <div className={"buttonContainer"}>
            <button className={"actionButton"} onClick={()=>props.startOverNewGame()}>Start Over </button>
            <button className={"actionButton"} onClick={()=> props.restoreMoves("prev")}> Prev </button>
            <button className={"actionButton"} onClick={()=> props.restoreMoves("next")}> Next </button>
        </div>
    )
};