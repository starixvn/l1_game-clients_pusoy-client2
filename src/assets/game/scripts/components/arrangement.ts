import pusoy from "@rd/pusoy-rules";
import gc from "@sg/game-client-base";
import { _decorator, EventHandler, Node, Prefab } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { isChangeSegment, sortSegment } from "../helpers/card-helper";
import { CardConverter } from "./card-converter";
import { Segment } from "./segment";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass
export class Arrangement extends ObserverComponent {
    @property(Node)
    front: Node = null;

    @property(Node)
    middle: Node = null;

    @property(Node)
    back: Node = null;

    @property(Prefab)
    cardPrefab: Prefab = null;

    @property([EventHandler])
    renderHandHandler: EventHandler[] = [];

    @property([EventHandler])
    submitHandler: EventHandler[] = [];

    private _hand: pusoy.Hand<number[]> = {
        front: [],
        middle: [],
        back: [],
    };

    @render(gc.GamePusoy.Rounds.RoundStore, (store) => store.initPlayerHand)
    renderHand(data: { hand: pusoy.Hand<number[]> }) {
        if (!data?.hand) {
            return;
        }
        const cardConverter = this.getComponent(CardConverter);
        const { hand } = data;
        this._hand = hand;
        const handData = cardConverter.convertHand(hand);
        this.renderHandHandler.forEach((handler) => {
            if (handData.front.length === 3 && handData.middle.length === 5 && handData.back.length === 5) {
                handler.emit([handData]);
            }
        });

        this.loadHand(handData);
    }

    loadHand(hand: {
        front: { value: number; rank: number; suit: number }[];
        middle: { value: number; rank: number; suit: number }[];
        back: { value: number; rank: number; suit: number }[];
    }) {
        const { front, middle, back } = hand;
        if (front.length !== 3 || middle.length !== 5 || back.length !== 5) {
            return;
        }
        this.fillCards(this.front, hand.front);
        this.fillCards(this.middle, hand.middle);
        this.fillCards(this.back, hand.back);

        this.renderType(
            {
                front: hand.front.map((c) => c.value),
                middle: hand.middle.map((c) => c.value),
                back: hand.back.map((c) => c.value),
            },
            false
        );
    }

    fillCards(container: Node, cardData: { value: number; rank: number; suit: number }[]) {
        const segmentComponent = container.getComponent(Segment);
        segmentComponent.fillCards(cardData);
    }

    changePosition() {
        [this.middle, this.back] = [this.back, this.middle];

        this.recalculate();
    }

    @handle(gc.GamePusoy.Arrangement.ArrangementHandler, (handler, payload: { hand: pusoy.Hand<number[]>; isChangeSegment: boolean }) => {
        handler.sendArrangementToServer(payload.hand, false);
    })
    recalculate() {
        const frontSegment = this.front.getComponent(Segment);
        const middleSegment = this.middle.getComponent(Segment);
        const backSegment = this.back.getComponent(Segment);

        const newHand = {
            front: frontSegment.getCards(),
            middle: middleSegment.getCards(),
            back: backSegment.getCards(),
        };

        const changeSegment = this.renderType(newHand, true);

        this._hand = newHand;

        if (!changeSegment) {
            return {
                hand: undefined,
                isChangeSegment: false,
            };
        }

        return {
            hand: {
                ...newHand,
            },
            isChangeSegment: changeSegment,
        };
    }

    private renderType(newHand: { front: number[]; middle: number[]; back: number[] }, isPlayAnimation = false) {
        const changeSegment = isChangeSegment(this._hand, newHand);
        const handScore = this.getScoreHand(newHand);

        this.checkType(handScore);

        const oldHandScore = this.getScoreHand(this._hand);
        const playAnimation = {
            front: pusoy.isLarger(handScore.front, oldHandScore.front),
            middle: pusoy.isLarger(handScore.middle, oldHandScore.middle),
            back: pusoy.isLarger(handScore.back, oldHandScore.back),
        };
        const highlightValues = this.getHighLightValuesInHand(newHand, handScore);

        if (isPlayAnimation) {
            this.highlightCards(highlightValues, playAnimation);
        } else {
            this.highlightCards(highlightValues);
        }

        return changeSegment;
    }

    private getScoreHand({ front, middle, back }: pusoy.Hand<number[]>) {
        const frontScore = pusoy.calculateSegmentScore(front);
        const middleScore = pusoy.calculateSegmentScore(middle);
        const backScore = pusoy.calculateSegmentScore(back);

        return {
            front: frontScore,
            middle: middleScore,
            back: backScore,
        };
    }

    private checkType({ front, middle, back }: pusoy.Hand<pusoy.SegmentScore>) {
        const crackFrontAndMiddle = pusoy.isLarger(front, middle);
        const crackMiddleAndBack = pusoy.isLarger(middle, back);

        this.changeType(this.front, front.type, crackFrontAndMiddle);
        this.changeType(this.middle, middle.type, crackFrontAndMiddle && crackMiddleAndBack);
        this.changeType(this.back, back.type, crackMiddleAndBack);
    }

    private getHighLightValuesInHand(newHand: pusoy.Hand<number[]>, newHandScore: pusoy.Hand<pusoy.SegmentScore>) {
        const highlightFrontValues = this.getValuesHighlight(newHand.front, newHandScore.front.type);
        const highlightMiddleValues = this.getValuesHighlight(newHand.middle, newHandScore.middle.type);
        const highlightBackValues = this.getValuesHighlight(newHand.back, newHandScore.back.type);

        return {
            front: highlightFrontValues,
            middle: highlightMiddleValues,
            back: highlightBackValues,
        };
    }

    private getValuesHighlight(cards: number[], type: pusoy.HandTypeRank) {
        if (type === pusoy.HandTypeRank.HighCard) {
            return [];
        }

        if (
            [
                pusoy.HandTypeRank.OnePair,
                pusoy.HandTypeRank.TwoPairs,
                pusoy.HandTypeRank.ThreeOfAKind,
                pusoy.HandTypeRank.FourOfAKind,
            ].includes(type)
        ) {
            const statisticCardByCountSameRank = pusoy.statisticCardByCountSameRank(cards);
            const maxCountSameRank = Math.max(...Array.from(statisticCardByCountSameRank.keys()));
            return maxCountSameRank > 1 ? statisticCardByCountSameRank.get(maxCountSameRank) : [];
        }

        return cards;
    }

    changeType(container: Node, type: pusoy.HandTypeRank, isCrack: boolean) {
        const segmentComponent = container.getComponent(Segment);
        segmentComponent.segmentType = type;
        segmentComponent.isRightPosition = !isCrack;
    }

    highlightCards({ front, middle, back }: pusoy.Hand<number[]>, playAnimation = { front: false, middle: false, back: false }) {
        this.front.getComponent(Segment).changeState(front, playAnimation.front);
        this.middle.getComponent(Segment).changeState(middle, playAnimation.middle);
        this.back.getComponent(Segment).changeState(back, playAnimation.back);
    }

    @render(gc.GamePusoy.Arrangement.ArrangementStore, (store) => store.isShowArrangement)
    setVisibility(isShowArrangement: boolean) {
        this.node.active = isShowArrangement;
    }

    @handle(gc.GamePusoy.Arrangement.ArrangementHandler, (handler, hand: pusoy.Hand<number[]>) =>
        handler.sendArrangementToServer(hand, true)
    )
    submitHand() {
        const cardConverter = this.getComponent(CardConverter);
        const hand = {
            front: sortSegment(this._hand.front),
            middle: sortSegment(this._hand.middle),
            back: sortSegment(this._hand.back),
        };
        this.submitHandler.forEach((handler) => handler.emit([cardConverter.convertHand(hand)]));
        return this._hand;
    }
}
