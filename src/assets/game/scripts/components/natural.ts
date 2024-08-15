import { _decorator, Node, tween, v3 } from "cc";
import gc from "@sg/game-client-base";
import Observer from "observer";
import { LocalizedLabel } from "db://i18n/LocalizedLabel";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { Card } from "./card";
import { Hand } from "./hand";
import { AudioIds } from "../constanst/audio-ids";

const { ccclass, property } = _decorator;

const { handle } = Observer;

@ccclass
export class Natural extends ObserverComponent {
    @property(LocalizedLabel)
    protected label: LocalizedLabel = null;

    @property(Node)
    protected cardsNode: Node = null;

    @property([Node])
    protected withoutCardsNode: Node[] = [];

    set type(value: string) {
        this.label!.key = `Pusoy.${value}`;
        this.label?.updateLabel();
    }

    set cards(cards: { rank: number; suit: number }[]) {
        for (const [index, node] of this.cardsNode.children.entries()) {
            const { rank, suit } = cards[index];
            const card = node.getComponent(Card);

            card.rank = rank;
            card.suit = suit;
        }
    }

    protected start(): void {
        this.node.active = false;
    }

    async playAnimation(hand: Hand) {
        if (!hand.natural) {
            return;
        }

        this.withoutCardsNode.forEach((node) => (node.active = true));
        this.node.active = true;
        this.playSound(AudioIds.NATURAL_CONGRATS);

        const duration = 2;
        const cardFlyingDuration = 0.05;
        const cards = hand.cards;

        const originalWorldPosition = cards.map((card) => card.node.getWorldPosition());
        const originalPosition = cards.map((card) => card.node.getPosition());
        const originalRotation = cards.map((card) => card.node.getRotation());
        const originalParent = cards.map((card) => card.node.parent);

        const naturalPosition = this.cardsNode.children.map((node) => node.getWorldPosition());

        this.type = hand.natural.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();

        const animation = tween(this.node)
            .call(() => {
                for (const [index, card] of cards.entries()) {
                    card.back = false;

                    card.node.setParent(this.cardsNode.children[index]);
                    card.node.setWorldPosition(naturalPosition[index]);
                    card.node.setRotationFromEuler(v3(0, 0, 0));
                }
            })
            .delay(duration / 2)
            .call(async () => {
                this.playSound(AudioIds.COLLECT_CARDS);

                this.withoutCardsNode.forEach((node) => (node.active = false));

                for (const [index, card] of cards.entries()) {
                    await new Promise((resolve) => {
                        tween(card.node)
                            .to(cardFlyingDuration, {
                                worldPosition: originalWorldPosition[index],
                                rotation: originalRotation[index],
                                scale: v3(1, 1, 1),
                            })
                            .call(() => {
                                card.node.parent = originalParent[index];
                                card.node.setPosition(originalPosition[index]);
                                resolve(true);
                            })
                            .start();
                    });
                }
            })
            .delay(duration / 2);

        return new Promise((resolve) => animation.call(resolve).start());
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playSound(soundId: string) {
        return soundId;
    }
}
