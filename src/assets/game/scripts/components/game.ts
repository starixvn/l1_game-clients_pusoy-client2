import type { GamePusoy } from "@sg/game-client-base";

import gc from "@sg/game-client-base";
import { Label, Prefab, _decorator, instantiate, Node, sp, v3 } from "cc";
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
import { Pusoy } from "./pusoy";
import { AutoDestroySpine } from "./auto-destroy-spine";
import { Quake } from "./quake";

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

    @property(Prefab)
    pusoy: Prefab = null;

    @property(Prefab)
    pusoyExplosion: Prefab = null;

    @property(Prefab)
    pusoyEmoji: Prefab = null;

    @property([Node])
    earthquakes: Node[] = [];

    @property(Prefab)
    crack: Prefab = null;

    @property(Prefab)
    superPusoy: Prefab = null;

    private _pusoyPairs: { source: Node; sourceSlot: string; target: Node; targetSlot: string }[] = [];

    private _superPusoy: { source: Node; sourceSlot: string } = {
        source: null,
        sourceSlot: "",
    };

    private _crackNode: Node[] = [];

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
    async updateAnimationCrack(showAnimation: boolean) {
        if (showAnimation) {
            console.log("show animation crack", showAnimation, new Date().getSeconds());
            await Promise.all(
                this._crackNode.map(async (node) => {
                    const crack = instantiate(this.crack);
                    node.addChild(crack);
                    return new Promise((resolve) => {
                        const autoDestroySpine = crack.getComponent(AutoDestroySpine);
                        autoDestroySpine.node.position = v3(0, 20);
                        autoDestroySpine.addDestroyHandler({
                            onDestroy: () => {
                                resolve(null);
                            },
                        });
                        autoDestroySpine.play();
                    });
                })
            );

            this.finishSettleAnimation(ANIMATION_STAGES.crack as AnimationStage);
            this._crackNode = [];
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
    async updateAnimationMiniPusoy(showAnimation: boolean) {
        if (showAnimation) {
            console.log("show animation mini pusoy", showAnimation);
            const pusoyTargets: { [key: string]: Node } = {};
            await Promise.all(
                this._pusoyPairs.map(async (pair) => {
                    pusoyTargets[pair.targetSlot] = pair.target;
                    const pusoy = instantiate(this.pusoy);
                    this.node.addChild(pusoy);
                    const pusoyComponent = pusoy.getComponent(Pusoy);
                    return new Promise((resolve) => {
                        pusoyComponent.addDestroyHandler(() => {
                            resolve(null);
                        });
                        pusoyComponent.playAnimation(pair.source, pair.sourceSlot, pair.target, pair.targetSlot);
                    });
                })
            );

            await Promise.all(
                Object.values(pusoyTargets).map(async (target) => {
                    const pusoyExplosion = instantiate(this.pusoyExplosion);
                    target.addChild(pusoyExplosion);
                    return new Promise((resolve) => {
                        const autoDestroySpine = pusoyExplosion.getComponent(AutoDestroySpine);
                        autoDestroySpine.addDestroyHandler({
                            onStart: () => {
                                this.earthquakes.forEach((earthquake) => {
                                    earthquake.getComponent(Quake).play();
                                });
                            },
                            onDestroy: () => {
                                resolve(null);
                            },
                        });
                        autoDestroySpine.play();
                    });
                })
            );

            await Promise.all(
                Object.values(pusoyTargets).map(async (target) => {
                    const pusoyEmoji = instantiate(this.pusoyEmoji);
                    target.addChild(pusoyEmoji);
                    return new Promise((resolve) => {
                        const autoDestroySpine = pusoyEmoji.getComponent(AutoDestroySpine);
                        autoDestroySpine.addDestroyHandler({
                            onDestroy: () => {
                                resolve(null);
                            },
                        });
                        autoDestroySpine.play();
                    });
                })
            );

            this._pusoyPairs = [];
            this.finishSettleAnimation(ANIMATION_STAGES.mini as AnimationStage);
            console.log("finish animation mini pusoy", showAnimation, new Date().getSeconds());
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
        console.log("finish animation: ", animation, new Date().getSeconds());
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
            const payout = {
                back: data.normal.back + data.royalty.back.units,
                front: data.normal.front + data.royalty.front.units,
                middle: data.normal.middle + data.royalty.middle.units,
            };
            Object.entries(data.pusoy.mini).forEach(([key, value]) => {
                if (value > 0) {
                    this._pusoyPairs.push({
                        source: component.node,
                        sourceSlot: `${data.slot}`,
                        target: handsComponent[Number(key)].node,
                        targetSlot: key,
                    });
                }
            });

            if (data.crack.isCrack) {
                this._crackNode.push(component.node);
            }

            if (data.pusoy.full) {
                this._superPusoy.source = component.node;
                this._superPusoy.sourceSlot = `${data.slot}`;
            }

            component.setPayout(payout);
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
