import type { GamePusoy } from "@sg/game-client-base";

import "./../../../resources/i18n";

import gc from "@sg/game-client-base";
import { AnimationStage } from "@sg/game-client-base/dist/game-pusoy/settlements";
import { _decorator, instantiate, Label, Node, Prefab, v3 } from "cc";
import GameComponent from "db://shared-components/game/scripts/components/game-component";
import { startGame } from "db://shared-components/shared/scripts/startup";
import Observer from "observer";
import { siteConfigs } from "../../../scripts/site-configs";
import { containerOptions, settings } from "../game-settings";
import { sortSegment } from "../helpers/card-helper";
import { AutoDestroySpine } from "./auto-destroy-spine";
import { CardConverter } from "./card-converter";
import { Hand } from "./hand";
import { Natural } from "./natural";
import PlayerProfile from "./player-profile";
import { Pusoy } from "./pusoy";
import { Quake } from "./quake";
import { ReadyLabel } from "./ready-label";
import { AudioIds } from "../constanst/audio-ids";

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

    private _looseSuperPusoy: { target: Node; targetSlot: string }[] = [];

    private _crackHand: Hand[] = [];
    private _crackNode: Node[] = [];

    private _readyLabelMap: { [playerName: string]: ReadyLabel } = {};

    override namespace = settings.name;
    override containerOptions = containerOptions;

    @render(gc.GamePusoy.Rounds.RoundTimeStore, (store) => store.isAtDealTime)
    deals(shouldDeals: boolean) {
        if (shouldDeals) {
            const hands = this.getComponentsInChildren(Hand);
            this.playSound(AudioIds.DEAL_CARDS);

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
                if (!hand.mine) {
                    hand.showSwapCards(true);
                }
            }
        }
    }

    @render(gc.GamePusoy.Settlement.SettlementStore, (store) => store.showAnimation[ANIMATION_STAGES.crack])
    async updateAnimationCrack(showAnimation: boolean) {
        if (showAnimation) {
            await Promise.all(
                this._crackHand.map(async (hand) => {
                    const crack = instantiate(this.crack);
                    hand.node.addChild(crack);
                    this._crackNode.push(crack);
                    return new Promise((resolve) => {
                        const autoDestroySpine = crack.getComponent(AutoDestroySpine);
                        autoDestroySpine.node.position = hand.mine ? v3(0, 26) : v3(0, 0);
                        autoDestroySpine.addDestroyHandler({
                            onDestroy: () => {
                                resolve(null);
                            },
                            onStart: () => {
                                this.playSound(AudioIds.CRACKS);
                            },
                        });
                        autoDestroySpine.play(false);
                    });
                })
            );

            this._crackHand = [];

            this.finishSettleAnimation(ANIMATION_STAGES.crack as AnimationStage);
        }
    }

    @render(gc.GamePusoy.Settlement.SettlementStore, (store) => store.showAnimation[ANIMATION_STAGES.natural])
    async updateAnimationNatural(showAnimation: boolean) {
        if (showAnimation) {
            const hands = this.getComponentsInChildren(Hand);
            const natural = this.getComponentInChildren(Natural);

            for (const hand of hands) {
                await natural.playAnimation(hand);
            }

            this.finishSettleAnimation(ANIMATION_STAGES.natural as AnimationStage);
        }
    }

    @render(gc.GamePusoy.Settlement.SettlementStore, (store) => store.showAnimation[ANIMATION_STAGES.mini])
    async updateAnimationMiniPusoy(showAnimation: boolean) {
        if (showAnimation) {
            await this.pusoyAnimation(this._pusoyPairs);
            this._pusoyPairs = [];
            this.finishSettleAnimation(ANIMATION_STAGES.mini as AnimationStage);
        }
    }

    private async pusoyAnimation(pusoyPairs: { source: Node; sourceSlot: string; target: Node; targetSlot: string }[]) {
        const pusoyTargets: { [key: string]: Node } = {};
        await Promise.all(
            pusoyPairs.map(async (pair) => {
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
    }

    @render(gc.GamePusoy.Settlement.SettlementStore, (store) => store.showAnimation[ANIMATION_STAGES.fullPusoy])
    async updateAnimationFullPusoy(showAnimation: boolean) {
        if (showAnimation) {
            const pusoyPairs = this._looseSuperPusoy.map((loosePusoy) => ({
                source: this._superPusoy.source,
                sourceSlot: this._superPusoy.sourceSlot,
                target: loosePusoy.target,
                targetSlot: loosePusoy.targetSlot,
            }));
            await this.pusoyAnimation(pusoyPairs);
            this._looseSuperPusoy = [];
            this._superPusoy = {
                source: null,
                sourceSlot: "",
            };
            this.finishSettleAnimation(ANIMATION_STAGES.fullPusoy as AnimationStage);
        }
    }

    @render(gc.GamePusoy.Settlement.SettlementStore, (store) => store.showAnimation[ANIMATION_STAGES.normal])
    async inSettlement(shouldShowAnimation: boolean) {
        if (shouldShowAnimation) {
            const handsComponent = this.getComponentsInChildren(Hand);

            await Promise.all(handsComponent.map((component) => component.playSettleAnimation()));
            this.finishSettleAnimation(ANIMATION_STAGES.normal as AnimationStage);
        }
    }

    @handle(SettlementHandlers, (handler, animation: AnimationStage) => handler.handleFinishAnimation(animation))
    finishSettleAnimation(animation: AnimationStage) {
        return animation;
    }

    @render(gc.GamePusoy.Settlement.SettlementStore, (store) => store.settlementResult)
    onSettlement(result: Record<string, GamePusoy.SettlementResult>) {
        if (!result) {
            return;
        }
        const handsData = Object.values(result).sort((a, b) => a.slot - b.slot);
        const handComponents = this.getComponentsInChildren(Hand);
        const playerProfileComponents = this.getComponentsInChildren(PlayerProfile);
        const playerNaturalOrCrack = handsData[0].crack.isCrack || Boolean(handsData[0].natural.name);

        handsData.forEach((data) => {
            const handComponent = handComponents.find((component) => component.getSlotIndex() === data.slot);
            const playerProfileComponent = playerProfileComponents.find((component) => component.slotIndex === data.slot);

            const payout = {
                back: data.normal.back + data.royalty.back.units,
                front: data.normal.front + data.royalty.front.units,
                middle: data.normal.middle + data.royalty.middle.units,
            };
            Object.entries(data.pusoy.mini).forEach(([key, value]) => {
                if (value > 0) {
                    this._pusoyPairs.push({
                        source: handComponent.node,
                        sourceSlot: `${data.slot}`,
                        target: handComponents[Number(key)].node,
                        targetSlot: key,
                    });
                } else if (value == 0) {
                    this._looseSuperPusoy.push({
                        target: handComponent.node,
                        targetSlot: `${data.slot}`,
                    });
                }
            });

            if (data.crack.isCrack) {
                this._crackHand.push(handComponent);
            }

            if (data.pusoy.full > 0) {
                this._superPusoy.source = handComponent.node;
                this._superPusoy.sourceSlot = `${data.slot}`;
            }

            handComponent.natural = data.natural.name;
            handComponent.crack = data.crack.isCrack;
            handComponent.playerNaturalOrCrack = playerNaturalOrCrack;
            handComponent.setPayout(payout);
            playerProfileComponent.setTotalWin(data.sum);
        });
    }

    @render(gc.GamePusoy.Settlement.SettlementStore, (store) => store.result)
    onRoundResult(result: Record<string, GamePusoy.PlayerHand>) {
        if (!result) {
            return;
        }

        const handsData = Object.values(result);
        const handComponents = this.getComponentsInChildren(Hand);
        const converter = this.getComponent(CardConverter);

        handsData.forEach((data) => {
            const handComponent = handComponents.find((component) => component.getSlotIndex() === data.slot);

            const hand = {
                front: sortSegment(data.hand.front),
                middle: sortSegment(data.hand.middle),
                back: sortSegment(data.hand.back),
            };
            const cards = converter.convertHand(hand);
            const ranks = converter.convertRank(hand);

            handComponent.setRanks(ranks);
            handComponent.renderCards(cards);
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

            const playerProfiles = this.getComponentsInChildren(PlayerProfile);
            const mainPlayer = playerProfiles.find((profile) => profile.slotIndex === 0);
            if (mainPlayer) {
                this._readyLabelMap[mainPlayer.playerName.string] = mainPlayer.node.parent.getComponent(ReadyLabel).init(v3(0, 30));
            }
        }
    }

    @render(gc.GamePusoy.Rounds.RoundStore, (store) => store.submittedPlayers)
    handlePlayerSubmitted(submittedPlayers: gc.GamePusoy.PusoyServiceMessages.SubmittedPlayer[]) {
        this.handleRearrangePlayer(submittedPlayers);
        if (submittedPlayers.length === 0) {
            return;
        }

        const hands = this.getComponentsInChildren(Hand);
        const submittedPlayersMap: Record<number, gc.GamePusoy.PusoyServiceMessages.SubmittedPlayer> = {};

        for (const submittedPlayer of submittedPlayers) {
            submittedPlayersMap[submittedPlayer.slot] = submittedPlayer;
        }

        for (const hand of hands) {
            const submittedPlayer = submittedPlayersMap[hand.getSlotIndex()];
            if (submittedPlayer) {
                this._readyLabelMap[submittedPlayer.name] = hand.node.getComponent(ReadyLabel).init();
                hand.showSwapCards(false);
            }
        }
    }

    handleRearrangePlayer(submittedPlayers: GamePusoy.PusoyServiceMessages.SubmittedPlayer[]) {
        const playerNames = submittedPlayers.map((player) => player.name);
        Object.keys(this._readyLabelMap).forEach((key) => {
            if (!playerNames.includes(key)) {
                this._readyLabelMap[key].destroyInstance();
            }
        });
    }

    @render(gc.GamePusoy.Settlement.SettlementStore, (store) => store.settleAnimation)
    handleBeforeSettle(animations: string[]) {
        if (animations.length > 0) {
            const hands = this.getComponentsInChildren(Hand);
            this._readyLabelMap = {};
            for (const hand of hands) {
                hand.node.getComponent(ReadyLabel).destroyInstance();
                if (hand.mine) {
                    hand.activeCards(true, true);
                } else {
                    hand.showSwapCards(false);
                }
            }

            const playerProfiles = this.getComponentsInChildren(PlayerProfile);
            const mainPlayer = playerProfiles.find((profile) => profile.slotIndex === 0);
            if (mainPlayer) {
                mainPlayer.node.parent.getComponent(ReadyLabel).destroyInstance();
            }
        }
    }

    @render(gc.GamePusoy.Settlement.SettlementStore, (store) => store.showAnimation[ANIMATION_STAGES.chipFly])
    handleAfterSettle() {
        this._crackNode.forEach((node) => {
            node.destroy();
        });
        this._crackNode = [];
    }
}
