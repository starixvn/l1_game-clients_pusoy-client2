import { _decorator, Component, instantiate, Node, Prefab } from "cc";
import { Card } from "./card";
import { sortIntegers } from "../helpers/number-helper";
import { idToRankSuit } from "../helpers/card-helper";
import { Segment } from "./segment";
import { Draggable } from "./draggable";
const { ccclass, property } = _decorator;

@ccclass("Arrangement")
export class arrangement extends Component {
    @property({ type: Node })
    front: Node = null;

    @property({ type: Node })
    middle: Node = null;

    @property({ type: Node })
    back: Node = null;

    @property({ type: Prefab })
    cardPrefab: Prefab = null;

    start() {
        const cards: number[] = [];
        for (let i = 0; i < 13; i++) cards.push(Math.floor(Math.random() * 52));
        const hand = {
            front: cards.slice(0, 3),
            middle: cards.slice(3, 8),
            back: cards.slice(8, 13),
        };
        console.log(hand);

        this.loadHand(hand);
    }

    update(deltaTime: number) {}

    loadHand(hand: { front: number[]; middle: number[]; back: number[] }) {
        this.fillCards(this.front, hand.front);
        this.fillCards(this.middle, hand.middle);
        this.fillCards(this.back, hand.back);
    }

    fillCards(container: Node, cards: number[]) {
        cards = sortIntegers(cards);
        console.log(cards);
        const nodes = cards.map((card) => {
            const cardNode = instantiate(this.cardPrefab);
            const { rank, suit } = idToRankSuit(card);
            const cardComponent = cardNode.getComponent(Card);
            cardNode.addComponent(Draggable);
            cardComponent.rank = rank;
            cardComponent.suit = suit;
            cardComponent.back = false;

            return cardNode;
        });

        const segmentComponent = container.getComponent(Segment);
        segmentComponent.fillCards(nodes);
    }
}
