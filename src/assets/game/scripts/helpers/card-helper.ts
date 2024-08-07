import pusoy from "@rd/pusoy-rules";
import { sortIntegers } from "./number-helper";

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

export const sortSegment = (cards: number[], increase = true) => {
    const statistic = pusoy.statisticCardByCountSameRank(cards);
    const kind: number[] = sortIntegers(Array.from(statistic.keys()), increase);
    const result: number[] = [];
    for (let i = 0; i < kind.length; i++) {
        result.push(...sortIntegers(statistic.get(kind[i])));
    }
    return result;
};
