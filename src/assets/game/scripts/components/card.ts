import { _decorator, Color, Component, Enum, Node, Sprite, UITransform } from "cc";

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
    const suitMap = {
        [CardSuit.CLUB]: "club",
        [CardSuit.DIAMOND]: "diamond",
        [CardSuit.HEART]: "heart",
        [CardSuit.SPADE]: "spade"
    };
    return suitMap[suit];
}

function rankToString(rank: CardRank): string {
    const rankMap = {
        [CardRank.ACE]: "A",
        [CardRank.TWO]: "2",
        [CardRank.THREE]: "3",
        [CardRank.FOUR]: "4",
        [CardRank.FIVE]: "5",
        [CardRank.SIX]: "6",
        [CardRank.SEVEN]: "7",
        [CardRank.EIGHT]: "8",
        [CardRank.NINE]: "9",
        [CardRank.TEN]: "10",
        [CardRank.JACK]: "J",
        [CardRank.QUEEN]: "Q",
        [CardRank.KING]: "K"
    };
    return rankMap[rank];
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

    @property(Node)
    protected disableNode: Node = null;

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

    @property
    public get disable() {
        return this.disableNode.active;
    }

    public set disable(value: boolean) {
        this.disableNode.active = value;
    }

    @property
    public get size() {
        const ui = this.node.getComponent(UITransform);

        return ui.width;
    }

    public set size(value: number) {
        const ui = this.node.getComponent(UITransform);
        const height = (value * 177) / 134;

        ui.setContentSize(value, height);
    }

    protected render(): void {
        this.suitImage.spriteFrame = this.getSuitSpriteFrame();
        this.rankImage.spriteFrame = this.getRankSpriteFrame();

        this.updateColor();
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
