import { _decorator, CCBoolean, Component, Enum, instantiate, Label, Node, Prefab, Sprite, SpriteAtlas, Widget } from "cc";
import { CardContainer } from "./card-container";
const { ccclass, property } = _decorator;

enum SegmentType {
    HighCard = 1,
    OnePair = 2,
    TwoPairs = 3,
    ThreeOfAKind = 4,
    Straight = 5,
    Flush = 6,
    FullHouse = 7,
    FourOfAKind = 8,
    StraightFlush = 9,
}

Enum(SegmentType);

const SegmentDict = {
    [SegmentType.HighCard]: "High Card",
    [SegmentType.OnePair]: "One Pair",
    [SegmentType.TwoPairs]: "Two Pairs",
    [SegmentType.ThreeOfAKind]: "Three Of A Kind",
    [SegmentType.Straight]: "Straight",
    [SegmentType.Flush]: "Flush",
    [SegmentType.FullHouse]: "Full House",
    [SegmentType.FourOfAKind]: "Four Of A Kind",
    [SegmentType.StraightFlush]: "Straight Flush",
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

    private _segmentType: SegmentType;
    public get segmentType() {
        return this._segmentType;
    }
    @property({ type: SegmentType })
    public set segmentType(v: SegmentType) {
        this._segmentType = v;
        const label = this.segmentTypeLabel.getComponent(Label);
        label.string = SegmentDict[v];
    }

    fillCards(cards: Node[]) {
        for (let i = 0; i < this.segmentContainer.children.length; i++) {
            const cardContainer = this.segmentContainer.children[i].getComponent(CardContainer);
            cardContainer.addCard(cards[i]);
        }
    }

    start() {}

    update(deltaTime: number) {}
}
