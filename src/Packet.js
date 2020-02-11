import React from "react";

export const Packet = props => {
    const packet = props.Packet;
    const endGame= props.endGame;
    const canTakeCard=props.canTakeCard;
    return (
        <div className={(packet.length>0)? "under": "nonePacket"} onClick={()=> !endGame && packet.length===1? props.takeFromPacket():null} >
            <div className={(packet.length>1)? "under": "nonePacket"} onClick={()=> !endGame && packet.length===2? props.takeFromPacket():null} >
                <div className={(packet.length>2)? "under": "nonePacket"} onClick={()=> !endGame && packet.length>2? props.takeFromPacket():null} > Packet </div>
            </div>
        </div>

    )
};

