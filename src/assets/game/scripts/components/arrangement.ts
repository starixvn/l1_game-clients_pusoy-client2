import pusoy from "@rd/pusoy-rules";
import gc from "@sg/game-client-base";
import { _decorator, EventHandler, Node, Prefab } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { addRankSuit, isChangeSegment } from "../helpers/card-helper";
import { CardRank, CardSuit } from "./card";
import { Segment } from "./segment";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

const SuitMap = {
    spade: CardSuit.SPADE,
    heart: CardSuit.HEART,
    diamond: CardSuit.DIAMOND,
    club: CardSuit.CLUB,
};
const RankMap = [
    CardRank.TWO,
    CardRank.THREE,
    CardRank.FOUR,
    CardRank.FIVE,
    CardRank.SIX,
    CardRank.SEVEN,
    CardRank.EIGHT,
    CardRank.NINE,
    CardRank.TEN,
    CardRank.JACK,
    CardRank.QUEEN,
    CardRank.KING,
    CardRank.ACE,
];

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

    private _hand: pusoy.Hand<number[]> = {
        front: [],
        middle: [],
        back: [],
    };

    @render(gc.GamePusoy.Rounds.RoundStore, (store) => store.hand)
    renderHand(data: { hand: pusoy.Hand<number[]>; scoreConfig: any; suitConfig: { [key: number]: string } }) {
        if (!data?.suitConfig || !data?.hand) {
            return;
        }
        const { hand, suitConfig } = data;
        const suitMap: CardSuit[] = ["0", "1", "2", "3"].map((i) => {
            return SuitMap[suitConfig[i]];
        });

        this._hand = hand;

        const handData = {
            front: addRankSuit(hand.front, RankMap, suitMap),
            middle: addRankSuit(hand.middle, RankMap, suitMap),
            back: addRankSuit(hand.back, RankMap, suitMap),
        };
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

        this.checkType(
            hand.front.map((c) => c.value),
            hand.middle.map((c) => c.value),
            hand.back.map((c) => c.value),
            false
        );
    }

    fillCards(container: Node, cardData: { value: number; rank: number; suit: number }[]) {
        const segmentComponent = container.getComponent(Segment);
        segmentComponent.fillCards(cardData);
    }

    changePosition() {
        [this.middle, this.back] = [this.back, this.middle];
        //[this._hand.middle, this._hand.back] = [this._hand.back, this._hand.middle];

        this.recalculate();
    }

    @handle(gc.GamePusoy.Arrangement.ArrangementHandler, (handler, payload: { hand: pusoy.Hand<number[]>; isChangeSegment: boolean }) => {
        handler.sendArrangementToServer(payload.hand, false);
    })
    recalculate() {
        const frontSegment = this.front.getComponent(Segment);
        const middleSegment = this.middle.getComponent(Segment);
        const backSegment = this.back.getComponent(Segment);

        const frontCards = frontSegment.getCards();
        const middleCards = middleSegment.getCards();
        const backCards = backSegment.getCards();

        const changeSegment = isChangeSegment(this._hand, {
            front: frontCards,
            middle: middleCards,
            back: backCards,
        });

        this.checkType(frontCards, middleCards, backCards, true);

        this._hand = {
            front: frontCards,
            middle: middleCards,
            back: backCards,
        };

        if (!changeSegment) {
            console.log("no change segment");
            return {
                hand: undefined,
                isChangeSegment: false,
            };
        }

        return {
            hand: {
                front: frontCards,
                middle: middleCards,
                back: backCards,
            },
            isChangeSegment: changeSegment,
        };
    }

    private checkType(frontCards: number[], middleCards: number[], backCards: number[], playAnimation = false) {
        const frontScore = pusoy.calculateSegmentScore(frontCards);
        const middleScore = pusoy.calculateSegmentScore(middleCards);
        const backScore = pusoy.calculateSegmentScore(backCards);

        const highlightFrontValues = this.getValuesHighlight(frontCards, frontScore.type);
        const highlightMiddleValues = this.getValuesHighlight(middleCards, middleScore.type);
        const highlightBackValues = this.getValuesHighlight(backCards, backScore.type);

        const crackFrontAndMiddle = pusoy.isLarger(frontScore, middleScore);
        const crackMiddleAndBack = pusoy.isLarger(middleScore, backScore);

        this.changeType(this.front, frontScore.type, crackFrontAndMiddle, highlightFrontValues, playAnimation);
        this.changeType(this.middle, middleScore.type, crackFrontAndMiddle && crackMiddleAndBack, highlightMiddleValues, playAnimation);
        this.changeType(this.back, backScore.type, crackMiddleAndBack, highlightBackValues, playAnimation);
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

    changeType(container: Node, type: pusoy.HandTypeRank, isCrack: boolean, highlightValues: number[], playAnimation = false) {
        const segmentComponent = container.getComponent(Segment);
        segmentComponent.segmentType = type;
        segmentComponent.isRightPosition = !isCrack;
        segmentComponent.highlightCards(highlightValues, playAnimation);
    }

    @render(gc.GamePusoy.Rounds.RoundTimeStore, (store) => store.isInArrangementTime)
    setVisibility(isInArrangementTime: boolean) {
        this.node.active = isInArrangementTime;
    }

    @render(gc.GamePusoy.Arrangement.ArrangementStore, (store) => store.isShowArrangement)
    hideArrangement(submittedPlayers: boolean) {
        if (submittedPlayers) {
            this.node.active = false;
        }
    }

    @handle(gc.GamePusoy.Arrangement.ArrangementHandler, (handler, hand: pusoy.Hand<number[]>) =>
        handler.sendArrangementToServer(hand, true)
    )
    submitHand() {
        this.node.active = false;
        return this._hand;
    }
}
