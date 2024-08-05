import { _decorator, Component, EventHandler, instantiate, Node, Prefab, tween, Vec3 } from "cc";
import { DragCardEvent } from "../custom-event";
import { CardValue } from "./card-value";
import { Collision } from "./collision";
const { ccclass, property } = _decorator;

@ccclass("CardContainer")
export class CardContainer extends Component {
    @property([EventHandler])
    changeArrangementHandlers: EventHandler[] = [];

    @property(Node)
    draggableCardNode: Node = null;

    @property(Prefab)
    draggableCard: Prefab = null;

    getCardValue() {
        return this.draggableCardNode.getComponent(CardValue).value;
    }

    loadValue(rank: number, suit: number, value: number) {
        if (this.draggableCardNode) {
            this.draggableCardNode.destroy();
        }

        const draggableCard = instantiate(this.draggableCard);
        this.node.insertChild(draggableCard, 0);
        this.draggableCardNode = draggableCard;
        const cardValue = this.draggableCardNode.getComponent(CardValue);
        cardValue.value = value;
        cardValue.changeFront(rank, suit);
    }

    start() {
        this.node.on(DragCardEvent.SwapCard, this.swapCard, this);
    }

    swapCard(newCard: Node, parentOfNewCard: Node) {
        const cardContainer = parentOfNewCard.getComponent(CardContainer);
        replaceCard(this.draggableCardNode, parentOfNewCard, cardContainer, this.node, true);
        replaceCard(newCard, this.node, this, parentOfNewCard);

        this.changeArrangementHandlers.forEach((handler) => {
            handler.emit([]);
        });
    }
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
            .to(
                0.05,
                { position: new Vec3(0, 0, 0) },
                {
                    easing: "smooth",
                    onStart: () => {
                        const draggable = currentCard.getComponent(Collision);
                        draggable.enabled = false;
                    },
                    onComplete: () => {
                        const draggable = currentCard.getComponent(Collision);
                        draggable.enabled = true;
                    },
                }
            )
            .start();
    } else {
        currentCard.setPosition(0, 0);
    }
    newContainerComponent.draggableCardNode = currentCard;
};
