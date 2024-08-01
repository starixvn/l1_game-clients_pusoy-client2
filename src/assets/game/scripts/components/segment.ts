import pusoy from "@rd/pusoy-rules";
import { _decorator, CCBoolean, Component, Enum, Label, Node, Sprite, SpriteAtlas } from "cc";
import { CardContainer, CardState } from "./card-container";
const { ccclass, property } = _decorator;

Enum(pusoy.HandTypeRank);

const SegmentDict = {
    [pusoy.HandTypeRank.HighCard]: "High Card",
    [pusoy.HandTypeRank.OnePair]: "One Pair",
    [pusoy.HandTypeRank.TwoPairs]: "Two Pairs",
    [pusoy.HandTypeRank.ThreeOfAKind]: "Three Of A Kind",
    [pusoy.HandTypeRank.Straight]: "Straight",
    [pusoy.HandTypeRank.Flush]: "Flush",
    [pusoy.HandTypeRank.FullHouse]: "Full House",
    [pusoy.HandTypeRank.FourOfAKind]: "Four Of A Kind",
    [pusoy.HandTypeRank.StraightFlush]: "Straight Flush",
    [pusoy.HandTypeRank.RoyalFlush]: "Royal Flush",
};

const IconName = {
    right: "changecard-icon-right",
    wrong: "changecard-icon-wrong",
};

@ccclass("Segment")
export class Segment extends Component {
    @property({ type: SpriteAtlas })
    spriteAtlas: SpriteAtlas;

    @property(Node)
    segmentContainer: Node;

    @property(Node)
    segmentTypeIcon: Node;

    @property(Node)
    segmentTypeLabel: Node;

    private _isRightPosition: boolean;
    public get isRightPosition() {
        return this._isRightPosition;
    }

    @property(CCBoolean)
    public set isRightPosition(v: boolean) {
        this._isRightPosition = v;
        const sprite = this.segmentTypeIcon.getComponent(Sprite);
        if (v) {
            sprite.spriteFrame = this.spriteAtlas.getSpriteFrame(IconName.right);
        } else {
            sprite.spriteFrame = this.spriteAtlas.getSpriteFrame(IconName.wrong);
        }
    }

    private _segmentType: pusoy.HandTypeRank;
    public get segmentType() {
        return this._segmentType;
    }
    @property({ type: pusoy.HandTypeRank })
    public set segmentType(value: pusoy.HandTypeRank) {
        this._segmentType = value;
        const label = this.segmentTypeLabel.getComponent(Label);
        label.string = SegmentDict[value];
    }

    fillCards(cards: { value: number; rank: number; suit: number }[]) {
        for (let i = 0; i < this.segmentContainer.children.length; i++) {
            const card = this.segmentContainer.children[i].getComponent(CardContainer);
            card.cardValue = cards[i].value;
            card.changeValue(cards[i].rank, cards[i].suit);
        }
    }

    swapPosition(otherSegment: Node) {}

    getCards() {
        return this.segmentContainer.children.map((c) => c.getComponent(CardContainer).cardValue);
    }

    highlightCards() {
        for (let i = 0; i < this.segmentContainer.children.length; i++) {
            const card = this.segmentContainer.children[i].getComponent(CardContainer);
            card.state = CardState.Highlight;
        }
    }

    getCardValues() {
        return this.segmentContainer.children.map((c) => ({
            value: c.getComponent(CardContainer).cardValue,
        }));
    }

    start() {}

    update(deltaTime: number) {}
}
