export const idToRankSuit = (id: number, rankMap: number[], suitMap: number[]) => {
    const rank = Math.floor(id / 4);
    const suit = id % 4;

    return { rank: rankMap[rank], suit: suitMap[suit] };
};
