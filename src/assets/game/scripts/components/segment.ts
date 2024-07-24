import { _decorator, CCBoolean, Component, Enum, Label, Node, Sprite, SpriteAtlas, Widget } from "cc";
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

@ccclass("segment")
export class segment extends Component {
    private _spriteAtlas: SpriteAtlas;
    public get spriteAtlas(): SpriteAtlas {
        return this._spriteAtlas;
    }
    @property({ type: SpriteAtlas })
    public set spriteAtlas(value: SpriteAtlas) {
        this._spriteAtlas = value;
    }

    private _segmentTypeIcon: Node;
    public get segmentTypeIcon(): Node {
        return this._segmentTypeIcon;
    }
    @property(Node)
    public set segmentTypeIcon(value: Node) {
        this._segmentTypeIcon = value;
    }

    @property(Node)
    private _segmentTypeLabel: Node;
    public get segmentTypeLabel(): Node {
        return this._segmentTypeLabel;
    }
    @property(Node)
    public set segmentTypeLabel(value: Node) {
        this._segmentTypeLabel = value;
    }

    _isRightPosition: boolean;

    get isRightPosition() {
        return this._isRightPosition;
    }

    @property(CCBoolean)
    set isRightPosition(v: boolean) {
        this._isRightPosition = v;
        const sprite = this.segmentTypeIcon.getComponent(Sprite);
        if (v) {
            sprite.spriteFrame = this.spriteAtlas.getSpriteFrame(IconName.right);
        } else {
            sprite.spriteFrame = this.spriteAtlas.getSpriteFrame(IconName.wrong);
        }
    }

    _segmentType: SegmentType;
    get segmentType() {
        return this._segmentType;
    }

    @property({ type: SegmentType })
    set segmentType(v: SegmentType) {
        this._segmentType = v;
        const label = this.segmentTypeLabel.getComponent(Label);
        label.string = SegmentDict[v];
    }

    start() {}

    update(deltaTime: number) {}
}
