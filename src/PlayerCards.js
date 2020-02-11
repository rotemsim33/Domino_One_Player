import React from "react";

export const PlayerCards = props => {
    const durationPlayer="vertical";
    const playerCards = props.playerCards;
    const endGame= props.endGame;
    return (
        <ul className={"containerPlayerCards"}>
            {playerCards.map(card =>
                <div key={card.side1 + card.side2} className={`${durationPlayer} ${(card.canChose && card.canChose ==="true") ? "canChoose": " "}`} onClick={() => !endGame && card.canChose==="true"? props.chosenCard(card): " "}>
                    <div className={durationPlayer + 'Side1'}
                         style={{backgroundImage: 'url(' + card.imgSide1 + ')'}}> </div>
                    <div className={durationPlayer + 'Side2'}
                         style={{backgroundImage: 'url(' + card.imgSide2 + ')'}}> </div>
                </div>
            )
            }
        </ul>
    )
};