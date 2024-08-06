import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { idToRankSuit } from "../helpers/card-helper";
import { CardRank, CardSuit } from "./card";

const { ccclass } = _decorator;
const { render } = Observer;

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
export class CardConverter extends ObserverComponent {
    suitMap: CardSuit[] = [];

    convert(card: number): { value: number; rank: CardRank; suit: CardSuit } {
        return { value: card, ...idToRankSuit(card, RankMap, this.suitMap) };
    }

    convertHand(hand: gc.GamePusoy.Hand<number[]>): gc.GamePusoy.Hand<{ value: number; rank: CardRank; suit: CardSuit }[]> {
        return {
            back: hand.back.map(this.convert.bind(this)),
            middle: hand.middle.map(this.convert.bind(this)),
            front: hand.front.map(this.convert.bind(this)),
        };
    }

    @render(gc.GamePusoy.GameConfigs.GameConfigStore, (store) => store.suitesMapper)
    setSuitMapper(mapper: Record<string, string>) {
        this.suitMap = ["0", "1", "2", "3"].map((i) => {
            return SuitMap[mapper[i]];
        });
    }
}
