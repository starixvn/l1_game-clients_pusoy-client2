import { _decorator, Component, Enum, Node, sp, Sprite, SpriteAtlas } from "cc";
import { DragCardEvent } from "../custom-event";
const { ccclass, property } = _decorator;

export enum CardState {
    Normal = 0,
    Selected = 1,
    Highlight = 2,
}

Enum(CardState);

const ANIMATION = {
    star: ["effect-a", "effect-b", "effect-c", "effect-d", "effect-e"],
    frame: ["active"],
};

const CardStateMap = {
    [CardState.Normal]: "",
    [CardState.Selected]: "changecard-bg-blue",
    [CardState.Highlight]: "changecard-bg-yellow",
};

@ccclass("CardFrame")
export class CardFrame extends Component {
    @property(Node)
    frame: Node = null;

    @property(SpriteAtlas)
    atlas: SpriteAtlas = null;

    @property(Node)
    highlightFrame: Node = null;

    @property(Node)
    highlighStar: Node = null;

    private _state: CardState = CardState.Normal;
    private _currentState: CardState;
    public get state(): CardState {
        return this._state;
    }
    @property({ type: CardState })
    public set state(value: CardState) {
        this._state = value;
        if (value === CardState.Normal) {
            this.frame.active = false;
        } else {
            this.frame.active = true;
            const sprite = this.atlas.getSpriteFrame(CardStateMap[value]);
            this.frame.getComponent(Sprite).spriteFrame = sprite;
        }
    }

    playHighlight() {
        this.highlightFrame.active = true;
        this.highlighStar.active = true;
        if (this.highlighStar.active) {
            const star = this.highlighStar.getComponent(sp.Skeleton);
            star.setAnimation(0, ANIMATION.star[Math.floor(Math.random() * 5)], false);
        }
        if (this.highlightFrame.active) {
            const frame = this.highlightFrame.getComponent(sp.Skeleton);
            frame.setAnimation(0, "active", false);
        }

        setTimeout(() => {
            this.highlightFrame.active = false;
        }, 1000);
        setTimeout(() => {
            this.highlighStar.active = false;
        }, 1200);
    }

    start() {
        this.node.on(DragCardEvent.OnDragStart, this.onCardDragStart, this);
        this.node.on(DragCardEvent.OnDragOverEnd, this.onCardDragOverEnd, this);
        this.node.on(DragCardEvent.OnDragOver, this.onCardDragOver, this);
        this.highlightFrame.active = false;
        this.highlighStar.active = false;
    }

    onCardDragStart() {
        this._currentState = this.state;
    }

    resetState() {
        this.state = this._currentState;
    }

    onCardDragOverEnd() {
        this.state = this._currentState;
    }

    onCardDragOver(card: Node) {
        if (this.node.uuid !== card?.uuid) {
            if (this.state !== CardState.Selected) {
                this._currentState = this.state;
            }
            this.state = CardState.Selected;
        }
    }

    update(deltaTime: number) {}
}
