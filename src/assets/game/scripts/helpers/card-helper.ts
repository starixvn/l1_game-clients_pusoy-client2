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
