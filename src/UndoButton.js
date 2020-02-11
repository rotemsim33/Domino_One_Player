import React from "react";

export const UndoButton=props=>{
    return(
        <div>
            <button className={"undoButton"} onClick={()=> props.undoMove()}> Undo </button>
        </div>
    )
};