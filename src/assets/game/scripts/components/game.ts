import type { GamePusoy } from "@sg/game-client-base";

import gc from "@sg/game-client-base";
import { Label, _decorator } from "cc";
import GameComponent from "db://shared-components/game/scripts/components/game-component";
import { startGame } from "db://shared-components/shared/scripts/startup";
import Observer from "observer";
import { siteConfigs } from "../../../scripts/site-configs";
import { containerOptions, settings } from "../game-settings";
import { sortSegment } from "../helpers/card-helper";
import "./../../../resources/i18n";
import { CardConverter } from "./card-converter";
import { Hand } from "./hand";

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
            hand.activeCards(true);
        }
    }

    @render(gc.GamePusoy.Rounds.RoundTimeStore, (store) => store.remaining && store.in("animation"))
    inSettlement(shouldShowAnimation: boolean) {
        if (shouldShowAnimation) {
            const handsComponent = this.getComponentsInChildren(Hand);

            for (const component of handsComponent) {
                component.playSettleAnimation({
                    back: { name: "back", win: false },
                    front: { name: "back", win: false },
                    middle: { name: "middle", win: true },
                });
            }
        }
    }

    @render(gc.GamePusoy.Settlement.SettlementStore, (store) => store.result)
    settlmentData(result: Record<string, GamePusoy.PlayerHand>) {
        if (!result) {
            return;
        }
        const handsData = Object.values(result).sort((a, b) => a.slot - b.slot);
        const handsComponent = this.getComponentsInChildren(Hand);
        const converter = this.getComponent(CardConverter);
        handsData.forEach((data, index) => {
            const hand = {
                front: sortSegment(data.hand.front),
                middle: sortSegment(data.hand.middle),
                back: sortSegment(data.hand.back),
            };
            const cards = converter.convertHand(hand);

            handsComponent[index].renderCards(cards);
        });
    }

    @render(gc.GamePusoy.Rounds.RoundTimeStore, (store) => store.isInTransitionTime)
    inTransitionTime(value: boolean) {
        if (value) {
            const hands = this.getComponentsInChildren(Hand);

            for (const hand of hands) {
                hand.activeCards(false);
            }
        }
    }

    @render(gc.GamePusoy.Arrangement.ArrangementStore, (store) => store.mainPlayerSubmitted)
    showHandMainPlayer(mainPlayerSubmitted: boolean) {
        if (mainPlayerSubmitted) {
            const hands = this.getComponentsInChildren(Hand);
            for (const hand of hands) {
                if (hand.mine) {
                    hand.activeCards(true, true);
                }
            }
        }
    }
}
