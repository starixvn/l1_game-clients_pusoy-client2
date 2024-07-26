export const idToRankSuit = (id: number) => {
    const cardValue = (id + 13) % 51;
    const rank = Math.floor(cardValue / 4) + 1;
    const suit = (cardValue % 4) + 1;

    return { rank: rank === 14 ? 1 : rank, suit };
};
