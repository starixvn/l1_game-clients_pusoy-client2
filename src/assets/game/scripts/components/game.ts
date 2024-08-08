import type { GamePusoy } from "@sg/game-client-base";

import gc from "@sg/game-client-base";
import { Label, _decorator, js } from "cc";
import GameComponent from "db://shared-components/game/scripts/components/game-component";
import { startGame } from "db://shared-components/shared/scripts/startup";
import Observer from "observer";
import { siteConfigs } from "../../../scripts/site-configs";
import { containerOptions, settings } from "../game-settings";
import { sortSegment } from "../helpers/card-helper";
import "./../../../resources/i18n";
import { CardConverter } from "./card-converter";
import { Hand } from "./hand";
import { AnimationStage } from "@sg/game-client-base/dist/game-pusoy/settlements";

startGame(settings.name, containerOptions, siteConfigs);

const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;
const { ANIMATION_STAGES, SettlementHandlers } = gc.GamePusoy.Settlement;
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
        if (inArrangement) {
            const hands = this.getComponentsInChildren(Hand);

            for (const hand of hands) {
                hand.activeCards(true);
            }
        }
    }

    @render(gc.GamePusoy.Settlement.SettlementStore, (store) => store.showAnimation[ANIMATION_STAGES.crack])
    updateAnimationCrack(showAnimation: boolean) {
        if (showAnimation) {
            console.log("show animation crack", showAnimation);

            this.finishSettleAnimation(ANIMATION_STAGES.crack as AnimationStage);
        }
    }

    @render(gc.GamePusoy.Settlement.SettlementStore, (store) => store.showAnimation[ANIMATION_STAGES.natural])
    updateAnimationNatural(showAnimation: boolean) {
        if (showAnimation) {
            console.log("show animation natural", showAnimation);

            this.finishSettleAnimation(ANIMATION_STAGES.natural as AnimationStage);
        }
    }

    @render(gc.GamePusoy.Settlement.SettlementStore, (store) => store.showAnimation[ANIMATION_STAGES.mini])
    updateAnimationMiniPusoy(showAnimation: boolean) {
        if (showAnimation) {
            console.log("show animation mini pusoy", showAnimation);

            this.finishSettleAnimation(ANIMATION_STAGES.mini as AnimationStage);
        }
    }

    @render(gc.GamePusoy.Settlement.SettlementStore, (store) => store.showAnimation[ANIMATION_STAGES.fullPusoy])
    updateAnimationFullPusoy(showAnimation: boolean) {
        if (showAnimation) {
            console.log("show animation full pusoy", showAnimation);

            this.finishSettleAnimation(ANIMATION_STAGES.fullPusoy as AnimationStage);
        }
    }

    @render(gc.GamePusoy.Settlement.SettlementStore, (store) => store.showAnimation[ANIMATION_STAGES.normal])
    async inSettlement(shouldShowAnimation: boolean) {
        if (shouldShowAnimation) {
            console.log("show animation normal: ", shouldShowAnimation);

            const handsComponent = this.getComponentsInChildren(Hand);

            await Promise.all(handsComponent.map((component) => component.playSettleAnimation()));
            this.finishSettleAnimation(ANIMATION_STAGES.normal as AnimationStage);
        }
    }

    @handle(SettlementHandlers, (handler, animation: AnimationStage) => handler.handleFinishAnimation(animation))
    finishSettleAnimation(animation: AnimationStage) {
        console.log("finish animation: ", animation);
        return animation;
    }

    @render(gc.GamePusoy.Settlement.SettlementStore, (store) => store.settlementResult)
    onSettlement(result: Record<string, GamePusoy.SettlementResult>) {
        if (!result) {
            return;
        }
        const handsData = Object.values(result).sort((a, b) => a.slot - b.slot);
        const handsComponent = this.getComponentsInChildren(Hand);

        handsData.forEach((data, index) => {
            const component = handsComponent[index];
            const wins = {
                back: data.normal.back + data.royalty.back.units > 0,
                front: data.normal.front + data.royalty.front.units > 0,
                middle: data.normal.middle + data.royalty.middle.units > 0,
            };

            component.setWins(wins);
        });
    }

    @render(gc.GamePusoy.Settlement.SettlementStore, (store) => store.result)
    onRoundResult(result: Record<string, GamePusoy.PlayerHand>) {
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
            const ranks = converter.convertRank(hand);

            handsComponent[index].setRanks(ranks);
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
