import React from "react";

export const Timer=props=>{
    const timer = props.timer;
    const min=timer.timerAllGame.minuets;
    const sec=timer.timerAllGame.seconds;

    return(
        <div className={"clock"}>
            <span>Time: </span>
            <span>{(min > 9) ? min + ":" : "0" + min + ":"}</span>
            <span>{(sec > 9) ? sec : "0" + sec}</span>
        </div>
    )
};