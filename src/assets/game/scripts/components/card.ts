import { _decorator, Color, Component, Enum, Node, Sprite } from "cc";

const { ccclass, property } = _decorator;

export enum CardSuit {
    CLUB = 1,
    DIAMOND = 2,
    HEART = 3,
    SPADE = 4,
}

export enum CardRank {
    ACE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5,
    SIX = 6,
    SEVEN = 7,
    EIGHT = 8,
    NINE = 9,
    TEN = 10,
    JACK = 11,
    QUEEN = 12,
    KING = 13,
}

function suitToString(suit: CardSuit): string {
    switch (suit) {
        case CardSuit.CLUB:
            return "club";
        case CardSuit.DIAMOND:
            return "diamond";
        case CardSuit.HEART:
            return "heart";
        case CardSuit.SPADE:
            return "spade";
    }
}

function rankToString(rank: CardRank): string {
    switch (rank) {
        case CardRank.ACE:
            return "A";
        case CardRank.TWO:
            return "2";
        case CardRank.THREE:
            return "3";
        case CardRank.FOUR:
            return "4";
        case CardRank.FIVE:
            return "5";
        case CardRank.SIX:
            return "6";
        case CardRank.SEVEN:
            return "7";
        case CardRank.EIGHT:
            return "8";
        case CardRank.NINE:
            return "9";
        case CardRank.TEN:
            return "10";
        case CardRank.JACK:
            return "J";
        case CardRank.QUEEN:
            return "Q";
        case CardRank.KING:
            return "K";
    }
}

@ccclass
export class Card extends Component {
    private _rank = CardRank.ACE;
    private _suit = CardSuit.CLUB;

    @property(Node)
    protected backNode: Node = null;

    @property(Sprite)
    protected rankImage: Sprite = null;

    @property(Sprite)
    protected suitImage: Sprite = null;

    @property({ type: Enum(CardRank) })
    public get rank() {
        return this._rank;
    }

    public set rank(value: CardRank) {
        this._rank = value;
        this.render();
    }

    @property({ type: Enum(CardSuit) })
    public get suit() {
        return this._suit;
    }

    public set suit(value: CardSuit) {
        this._suit = value;
        this.render();
    }

    @property
    public get back() {
        return this.backNode.active;
    }

    public set back(value: boolean) {
        this.backNode.active = value;
    }

    protected render(): void {
        if (this.back) {
            this.backNode.active = true;
        } else {
            this.suitImage.spriteFrame = this.getSuitSpriteFrame();
            this.rankImage.spriteFrame = this.getRankSpriteFrame();

            this.updateColor();

            this.backNode.active = false;
        }
    }

    protected getSuitSpriteFrame() {
        const suit = suitToString(this.suit);

        return this.suitImage.spriteAtlas.getSpriteFrame(suit);
    }

    protected getRankSpriteFrame() {
        const rank = rankToString(this.rank);

        return this.rankImage.spriteAtlas.getSpriteFrame(rank);
    }

    protected updateColor() {
        const colorMapping = {
            [CardSuit.CLUB]: "#262626",
            [CardSuit.SPADE]: "#262626",
            [CardSuit.DIAMOND]: "#ef0909",
            [CardSuit.HEART]: "#ef0909",
        };

        this.rankImage.color = new Color(colorMapping[this.suit]);
    }

    protected isValidProperties() {
        return !!this.backNode && !!this.rankImage && !!this.suitImage;
    }
}
