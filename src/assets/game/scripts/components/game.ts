import { Label, Node, _decorator, sp } from "cc";
import { PokerCard } from "db://shared-components/game/poker-cards/scripts/poker-card";
import GameComponent from "db://shared-components/game/scripts/components/game-component";
import { WinningResult } from "db://shared-components/shared/common-components/winning-result/scripts/winning-result";
import { startGame } from "db://shared-components/shared/scripts/startup";
import Observer from "observer";
import { siteConfigs } from "../../../scripts/site-configs";
import { containerOptions, settings } from "../game-settings";
import gc from "@sg/game-client-base";
import "./../../../resources/i18n";
import { Hand } from "./hand";
import { CardRank, CardSuit } from "./card";
import { addRankSuit } from "../helpers/card-helper";

startGame(settings.name, containerOptions, siteConfigs);

const { ccclass, property } = _decorator;
const { observer, render } = Observer;

@ccclass
@observer(settings.name)
export default class Game extends GameComponent {
    @property({ type: Label, override: true, visible: false })
    lblMinBet: Label = null;

    @property({ type: Label, override: true, visible: false })
    lblMaxBet: Label = null;

    override namespace = settings.name;
    override containerOptions = containerOptions;

    suitMappings = {};

    @render(gc.GamePusoy.Rounds.RoundTimeStore, (store) => store.remaining && store.at("deal"))
    deals(shouldDeals: boolean) {
        if (shouldDeals) {
            const hands = this.getComponentsInChildren(Hand);

            for (const hand of hands) {
                hand.playDealsAnimation();
            }
        }
    }

    @render(gc.GamePusoy.Rounds.RoundTimeStore, (store) => store.isInArrangementTime)
    inArrangement(inArrangement: boolean) {
        const hands = this.getComponentsInChildren(Hand);

        for (const hand of hands) {
            if (hand.mine) {
                hand.activeCards(!inArrangement, true);
            } else {
                hand.activeCards(true);
            }
        }
    }

    @render(gc.GamePusoy.GameConfigs.GameConfigStore, (store) => store.suitesMapper)
    setSuitMapping(data: Record<string, string>) {
        this.suitMappings = data;
    }

    @render(gc.GamePusoy.Rounds.RoundStore, (store) => store.currentHand)
    renderHand(hand: Record<string, number[]>) {
        const suitMap = [0, 1, 2, 3].map((i) => {
            return {
                spade: CardSuit.SPADE,
                heart: CardSuit.HEART,
                diamond: CardSuit.DIAMOND,
                club: CardSuit.CLUB,
            }[this.suitMappings[i]];
        });
        const rankMap = [
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

        const handData = {
            front: addRankSuit(hand.front, rankMap, suitMap),
            middle: addRankSuit(hand.middle, rankMap, suitMap),
            back: addRankSuit(hand.back, rankMap, suitMap),
        };

        const handComponent = this.getComponentInChildren(Hand);

        handComponent.renderCards(handData);
    }
}
