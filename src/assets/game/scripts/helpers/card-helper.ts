import pusoy from "@rd/pusoy-rules";

export const idToRankSuit = (id: number, rankMap: number[], suitMap: number[]) => {
    const rank = Math.floor(id / 4);
    const suit = id % 4;

    return { rank: rankMap[rank], suit: suitMap[suit] };
};

export const addRankSuit = (cards: number[], rankMap: number[], suitMap: number[]) => {
    return cards.map((card) => {
        return { value: card, ...idToRankSuit(card, rankMap, suitMap) };
    });
};

export const isChangeSegment = (hand: pusoy.Hand<number[]>, currentHand: pusoy.Hand<number[]>) => {
    console.log("changeSegment: ", hand, currentHand);
    const isDifferent = (newSegment: number[], currentSegment: number[]) => {
        if (newSegment.length !== currentSegment.length) {
            return true;
        }
        const segmentSet = new Set(newSegment);

        for (let i = 0; i < newSegment.length; i++) {
            if (!segmentSet.has(currentSegment[i])) {
                return true;
            }
        }

        return false;
    };

    return (
        isDifferent(hand.front, currentHand.front) ||
        isDifferent(hand.middle, currentHand.middle) ||
        isDifferent(hand.back, currentHand.back)
    );
};
