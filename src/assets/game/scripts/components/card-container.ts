import { _decorator, Component, easing, EventHandler, instantiate, Node, Prefab, tween, Vec3 } from "cc";
import gc from "@sg/game-client-base";
import Observer from "observer";
import { DragCardEvent } from "../custom-event";
import { CardValue } from "./card-value";
import { Draggable } from "./draggable";
import { AudioIds } from "../constanst/audio-ids";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";

const { ccclass, property } = _decorator;

const { handle } = Observer;

@ccclass("CardContainer")
export class CardContainer extends ObserverComponent {
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

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playDragCardStartSound() {
        return AudioIds.ARRANGE_CARD_START;
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playDragCardEndSound() {
        return AudioIds.ARRANGE_CARD_END;
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
                    easing: easing.smooth,
                    onStart: () => {
                        const draggable = currentCard.getComponent(Draggable);
                        draggable.enabled = false;
                    },
                    onComplete: () => {
                        newContainerComponent.playDragCardEndSound();
                        const draggable = currentCard.getComponent(Draggable);
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
