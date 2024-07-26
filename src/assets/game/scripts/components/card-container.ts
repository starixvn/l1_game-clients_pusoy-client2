import { __private, _decorator, Component, Enum, Node, Sprite, SpriteAtlas, tween, Vec3 } from "cc";
import { CardContainerEvent } from "../custom-event";
const { ccclass, property } = _decorator;

export enum CardState {
    Normal = 0,
    Selected = 1,
    Highlight = 2,
}

Enum(CardState);

const CardStateMap = {
    [CardState.Normal]: "",
    [CardState.Selected]: "changecard-bg-blue",
    [CardState.Highlight]: "changecard-bg-yellow",
};

@ccclass("CardContainer")
export class CardContainer extends Component {
    @property(Node)
    frame: Node = null;

    @property(SpriteAtlas)
    atlas: SpriteAtlas = null;

    private _state: CardState = CardState.Normal;
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

    @property({ type: Node })
    card: Node = null;

    public addCard(value: Node) {
        if (!this.card) {
            this.node.removeChild(this.card);
        }
        this.node.insertChild(value, 0);
        this.node.setPosition(0, 0);
        this.card = value;
    }

    start() {
        this.node.on(CardContainerEvent.OnDragOver, this.onCardDragOver, this);
        this.node.on(CardContainerEvent.OnDragOverEnd, this.onCardDragOverEnd, this);
        this.node.on(CardContainerEvent.SwapCard, this.swapCard, this);
    }

    onCardDragOver(card: Node) {
        if (this.card?.uuid !== card?.uuid) {
            this.state = CardState.Selected;
        }
    }

    onCardDragOverEnd(card: Node) {
        this.state = CardState.Normal;
    }

    swapCard(newCard: Node, parentOfNewCard: Node) {
        const cardContainer = parentOfNewCard.getComponent(CardContainer);
        replaceCard(this.card, parentOfNewCard, cardContainer, this.node, true);
        replaceCard(newCard, this.node, this, parentOfNewCard, true);
    }

    update(deltaTime: number) {}
}

const replaceCard = (
    currentCard: Node,
    newContainer: Node,
    newContainerComponent: CardContainer,
    currentContainer: Node,
    isAnimation = false
) => {
    const worldPosition = currentCard.worldPosition;
    currentContainer.removeChild(currentCard);
    newContainer.insertChild(currentCard, 0);
    currentCard.setWorldPosition(worldPosition);
    if (isAnimation) {
        tween(currentCard)
            .to(0.05, { position: new Vec3(0, 0, 0) }, { easing: "smooth" })
            .start();
    } else {
        currentCard.setPosition(0, 0);
    }
    newContainerComponent.card = currentCard;
};
