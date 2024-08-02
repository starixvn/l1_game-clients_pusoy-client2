import pusoy from "@rd/pusoy-rules";
import { _decorator, EventHandler, Node, Prefab } from "cc";
import { Segment } from "./segment";
import gc from "@sg/game-client-base";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { CardRank, CardSuit } from "./card";
import { addRankSuit, isChangeSegment } from "../helpers/card-helper";

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

    start() {}

    update(deltaTime: number) {}

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
        console.log(this.renderHand.name, handData);
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

        console.log("load", hand);

        this.checkType(
            hand.front.map((c) => c.value),
            hand.middle.map((c) => c.value),
            hand.back.map((c) => c.value)
        );
    }

    fillCards(container: Node, cardData: { value: number; rank: number; suit: number }[]) {
        const segmentComponent = container.getComponent(Segment);
        segmentComponent.fillCards(cardData);
    }

    changePosition() {
        [this.middle, this.back] = [this.back, this.middle];
        [this._hand.middle, this._hand.back] = [this._hand.back, this._hand.middle];

        this.recalculate();
    }

    @handle(gc.GamePusoy.Arrangement.ArrangementHandler, (handler, payload: { hand: pusoy.Hand<number[]>; isChangeSegment: boolean }) => {
        if (payload.isChangeSegment) {
            handler.sendArrangementToServer(payload.hand, false);
        }
    })
    recalculate() {
        const frontSegment = this.front.getComponent(Segment);
        const middleSegment = this.middle.getComponent(Segment);
        const backSegment = this.back.getComponent(Segment);

        const frontCards = frontSegment.getCards();
        const middleCards = middleSegment.getCards();
        const backCards = backSegment.getCards();

        console.log("render after change", frontCards, middleCards, backCards);

        const changeSegment = isChangeSegment(this._hand, {
            front: frontCards,
            middle: middleCards,
            back: backCards,
        });

        this.checkType(frontCards, middleCards, backCards);

        return {
            hand: {
                front: frontCards,
                middle: middleCards,
                back: backCards,
            },
            isChangeSegment: changeSegment,
        };
    }

    private checkType(frontCards: number[], middleCards: number[], backCards: number[]) {
        const frontScore = pusoy.calculateSegmentScore(frontCards);
        const middleScore = pusoy.calculateSegmentScore(middleCards);
        const backScore = pusoy.calculateSegmentScore(backCards);

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

    @render(gc.GamePusoy.Rounds.RoundTimeStore, (store) => store.isInArrangementTime)
    setVisibility(isInArrangementTime: boolean) {
        this.node.active = isInArrangementTime;
    }

    @render(gc.GamePusoy.Rounds.RoundStore, (store) => store.mainPlayerSubmitted)
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
