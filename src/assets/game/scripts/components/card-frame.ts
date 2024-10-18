import { _decorator, Enum, Node, Size, sp, Sprite, SpriteAtlas, UITransform } from "cc";
import { DragCardEvent } from "../custom-event";
import gc from "@sg/game-client-base";
import Observer from "observer";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";

import { AudioIds } from "../constanst/audio-ids";

const { ccclass, property } = _decorator;

const { handle } = Observer;

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
    [CardState.Selected]: {
        name: "changecard-bg-blue",
        transform: {
            x: 130,
            y: 173,
        },
    },
    [CardState.Highlight]: {
        name: "changecard-bg-yellow",
        transform: {
            x: 122,
            y: 166,
        },
    },
};

@ccclass("CardFrame")
export class CardFrame extends ObserverComponent {
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
            const info = CardStateMap[value];
            const sprite = this.atlas.getSpriteFrame(CardStateMap[value].name);
            this.frame.getComponent(Sprite).spriteFrame = sprite;
            this.frame.getComponent(UITransform).setContentSize(new Size(info.transform.x, info.transform.y));
        }
    }

    private _highlightFrameTimeout: NodeJS.Timeout = null;
    private _highlightStarTimeout: NodeJS.Timeout = null;

    playHighlight() {
        if (this._highlightFrameTimeout) {
            clearTimeout(this._highlightFrameTimeout);
            this.highlightFrame.active = false;
        }
        if (this._highlightStarTimeout) {
            clearTimeout(this._highlightStarTimeout);
            this.highlighStar.active = false;
        }
        this.highlightFrame.active = true;
        this.highlighStar.active = true;

        this.playArrangeComboSound();

        if (this.highlighStar.active) {
            const star = this.highlighStar.getComponent(sp.Skeleton);
            star.setAnimation(0, ANIMATION.star[Math.floor(Math.random() * 5)], false);
        }
        if (this.highlightFrame.active) {
            const frame = this.highlightFrame.getComponent(sp.Skeleton);
            frame.setAnimation(0, ANIMATION.frame[0], false);
        }

        this._highlightFrameTimeout = setTimeout(() => {
            this.highlightFrame && (this.highlightFrame.active = false);
        }, 1000);
        this._highlightStarTimeout = setTimeout(() => {
            this.highlighStar && (this.highlighStar.active = false);
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

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playArrangeComboSound() {
        return AudioIds.MATCH_COMBINATION;
    }
}
