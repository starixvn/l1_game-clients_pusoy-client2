import { _decorator, CCBoolean, CCString, Component, Node, Sprite, SpriteAtlas } from "cc";
import { CardContainer } from "./card-container";
import { CardFrame, CardState } from "./card-frame";
import { LocalizedLabel } from "../../../../extensions/i18n/assets/LocalizedLabel";
const { ccclass, property } = _decorator;

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

    private _segmentType: string;
    public get segmentType() {
        return this._segmentType;
    }
    @property(CCString)
    public set segmentType(value: string) {
        this._segmentType = value;
        const label = this.segmentTypeLabel.getComponent(LocalizedLabel);
        label._key = value;
    }

    fillCards(cards: { value: number; rank: number; suit: number }[]) {
        for (let i = 0; i < this.segmentContainer.children.length; i++) {
            const card = this.segmentContainer.children[i].getComponent(CardContainer);
            card.loadValue(cards[i].rank, cards[i].suit, cards[i].value);
        }
    }

    getCards() {
        return this.segmentContainer.children.map((c) => c.getComponent(CardContainer).getCardValue());
    }

    changeState(highlightValues: number[], playAnimation = false) {
        for (const child of this.segmentContainer.children) {
            const card = child.getComponent(CardContainer);
            const frame = card.draggableCardNode.getComponent(CardFrame);
            const value = card.getCardValue();
            const frames: CardFrame[] = [];

            if (highlightValues.includes(value)) {
                frame.state = CardState.Highlight;
                frames.push(frame);
            } else {
                frame.state = CardState.Normal;
            }

            if (playAnimation) {
                frames.forEach((f) => f.playHighlight());
            }
        }
    }

    start() {}

    update(deltaTime: number) {}
}
