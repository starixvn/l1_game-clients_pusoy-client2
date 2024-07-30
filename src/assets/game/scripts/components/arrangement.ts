import pusoy from "@rd/pusoy-rules";
import { _decorator, Component, Node, Prefab } from "cc";
import { Segment } from "./segment";

const { ccclass, property } = _decorator;

@ccclass("Arrangement")
export class Arrangement extends Component {
    @property(Node)
    front: Node = null;

    @property(Node)
    middle: Node = null;

    @property(Node)
    back: Node = null;

    @property(Prefab)
    cardPrefab: Prefab = null;

    start() {
        const cards: number[] = [];
        while (cards.length < 13) {
            const card = Math.floor(Math.random() * 52);
            if (!cards.includes(card)) {
                cards.push(card);
            }
        }
        const cardData = cards.map((card, index) => ({ value: card, index }));

        const hand = {
            front: cardData.slice(0, 3),
            middle: cardData.slice(3, 8),
            back: cardData.slice(8, 13),
        };

        this.loadHand(hand);
    }

    update(deltaTime: number) {}

    loadHand(hand: {
        front: { value: number; index: number }[];
        middle: { value: number; index: number }[];
        back: { value: number; index: number }[];
    }) {
        this.fillCards(this.front, hand.front);
        this.fillCards(this.middle, hand.middle);
        this.fillCards(this.back, hand.back);

        this.recalculate();
    }

    fillCards(container: Node, cardData: { value: number; index: number }[]) {
        const segmentComponent = container.getComponent(Segment);
        segmentComponent.fillCards(cardData);
    }

    changePosition() {
        [this.middle, this.back] = [this.back, this.middle];

        const middle = this.middle.getComponent(Segment);
        middle.swapPosition(this.back);
        this.recalculate();
    }

    recalculate() {
        const frontSegment = this.front.getComponent(Segment);
        const middleSegment = this.middle.getComponent(Segment);
        const backSegment = this.back.getComponent(Segment);

        const frontScore = pusoy.calculateSegmentScore(frontSegment.getCards());
        const middleScore = pusoy.calculateSegmentScore(middleSegment.getCards());
        const backScore = pusoy.calculateSegmentScore(backSegment.getCards());
        console.log(frontSegment.getCardValues(), middleSegment.getCardValues(), backSegment.getCardValues());
        console.log(frontScore, middleScore, backScore);

        const crackFrontAndMiddle = pusoy.isLarger(frontScore, middleScore);
        const crackMiddleAndBack = pusoy.isLarger(middleScore, backScore);

        this.changeType(this.front, frontScore.type, crackFrontAndMiddle);
        this.changeType(this.middle, middleScore.type, crackFrontAndMiddle && crackMiddleAndBack);
        this.changeType(this.back, backScore.type, crackMiddleAndBack);
    }

    changeType(container: Node, type: pusoy.HandTypeRank, isCrack: boolean) {
        const segmentComponent = container.getComponent(Segment);
        segmentComponent.segmentType = type;
        segmentComponent.isRightPosition = !isCrack;
    }
}
