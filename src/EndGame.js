import React from "react";

export const EndGame= props=>{
    const resultGame= props.resultGame;
    const textToPrint = resultGame==="win" ? 'Congratulations you won!!!' : 'Unfortunately you lose';
    return(
        <div className={"endGameModal"}>
            <div className={resultGame}>{textToPrint}
                <div className={"close"} onClick={()=> props.removeLightBox()}>close</div>
            </div>
        </div>
    )
};