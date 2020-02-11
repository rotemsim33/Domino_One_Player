import React from "react";

export const Statistics=props=>{
    const  playerStatistics=props.playerStatistics;
    return(
        <div className={"statistics"}>
            <span className={"titleStatistics"}>This Are Your Statistics:</span>
            <span> Turns: {playerStatistics.amountOfTurns}</span>
            <span> Average time for turn: {playerStatistics.averageMoveTime}  </span>
            <span> Pull from the packet: {playerStatistics.pullFromPacket}</span>
            <span> Score: {playerStatistics.score} </span>
        </div>
    )
};
