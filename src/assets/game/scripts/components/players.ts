import { SettlementResult } from "@sg/game-client-base/dist/game-pusoy";
import { Color, Label, Node, Prefab, UIOpacity, Vec3, _decorator, instantiate, tween } from "cc";
import Observer from "observer";
import gc from "@sg/game-client-base";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { AnimationStage } from "@sg/game-client-base/dist/game-pusoy/settlements";
import PlayerProfile from "./player-profile";
import { GradientNode } from "db://shared-components/shared/common-components/custom-materials/components/gradient-node";
import { AudioIds } from "../constanst/audio-ids";
const { SettlementStore, ANIMATION_STAGES, SettlementHandlers } = gc.GamePusoy.Settlement;

const { ccclass, property } = _decorator;
const { render, handle } = Observer;
const { FormatUtils } = gc;

const COIN_FLIGHT_DURATION = 0.5;
const NUMBER_OF_COINS = 6;
const DELAY_BETWEEN_COINS = COIN_FLIGHT_DURATION / (NUMBER_OF_COINS - 1);

@ccclass
export class players extends ObserverComponent {
    @property({ type: Prefab })
    coinPrefab: Prefab | null = null;

    @property({ type: Prefab })
    winPrefab: Prefab | null = null;

    @property({ type: Node })
    sumCoin: Node | null = null;

    coins: Record<string, Node> = {};
    winners: SettlementResult[] = [];
    losers: SettlementResult[] = [];

    onLoad() {
        super.onLoad();

        this.sumCoin.active = false;
    }

    @render(SettlementStore, (store) => store.settlementResult)
    setLosersAndWinners(settlementResult: Record<string, SettlementResult>) {
        if (!settlementResult) {
            return;
        }

        const settlementResults = Object.values(settlementResult);

        if (settlementResults.length === 0) {
            return;
        }

        this.mapPlayerProfilesToCoins();

        this.losers = settlementResults.filter((result) => result.sum < 0);
        this.winners = settlementResults.filter((result) => result.sum > 0);
    }

    private mapPlayerProfilesToCoins() {
        const playerProfileComponents = this.getComponentsInChildren(PlayerProfile);

        playerProfileComponents.forEach((playerProfile) => {
            const coin = playerProfile.node.getChildByPath("name/background/coin");
            this.coins[`slot${playerProfile.slotIndex}`] = coin;
        });
    }

    @render(SettlementStore, (store) => store.showAnimation[ANIMATION_STAGES.chipFly])
    renderCoin(showAnimation: boolean) {
        if (!showAnimation || !this.winners.length || !this.losers.length) {
            return;
        }

        this.animateLosers(this.losers);

        this.scheduleOnce(() => {
            this.animateWinners(this.winners);
        }, COIN_FLIGHT_DURATION * 2 + 0.2);

        this.scheduleOnce(() => {
            this.animateShowTotalWin();
        }, COIN_FLIGHT_DURATION * 2 + 0.2);

        this.finishSettleAnimation(ANIMATION_STAGES.chipFly as AnimationStage);
    }

    animateLosers(losers: SettlementResult[]) {
        losers.forEach((loser) => {
            const coin = this.coins[`slot${loser.slot}`];
            this.animateCoinFly(coin, this.sumCoin);
            this.playSound(AudioIds.CHIPS_FLY_LOSERS);
        });

        this.scheduleOnce(() => {
            this.sumCoin.active = true;
        }, COIN_FLIGHT_DURATION);
    }

    animateWinners(winners: SettlementResult[]) {
        winners.forEach((winner) => {
            const coin = this.coins[`slot${winner.slot}`];
            this.animateCoinFly(this.sumCoin, coin);
            this.playSound(AudioIds.CHIPS_FLY_WINNERS);
        });

        this.scheduleOnce(() => {
            this.sumCoin.active = false;
        }, COIN_FLIGHT_DURATION);
    }

    animateCoinFly(sourceCoin: Node, targetCoin: Node) {
        for (let i = 0; i < NUMBER_OF_COINS; i++) {
            this.scheduleOnce(() => {
                this.flyCoins(sourceCoin, targetCoin);
            }, DELAY_BETWEEN_COINS * i);
        }
    }

    flyCoins(sourceCoin: Node, targetCoin: Node) {
        const newCoin = instantiate(this.coinPrefab);
        this.node.addChild(newCoin);
        newCoin.setWorldPosition(sourceCoin.worldPosition);

        tween(newCoin).to(COIN_FLIGHT_DURATION, { worldPosition: targetCoin.worldPosition }).destroySelf().start();
    }

    animateShowTotalWin() {
        const playerProfileComponents = this.getComponentsInChildren(PlayerProfile);

        playerProfileComponents.forEach(async (playerProfile) => {
            const playerAvatar = playerProfile.node.getChildByName("avatar");
            const totalWin = instantiate(this.winPrefab);
            const winValue = playerProfile.getTotalWin();

            if (winValue === 0) {
                return;
            }

            playerProfile.setTotalWin(0);

            this.setWinStyles(totalWin, winValue);

            this.handleAvatarWinAnimation(playerAvatar, winValue);

            playerAvatar.addChild(totalWin);

            this.handleTotalWinAnimation(totalWin);
        });
    }

    private setWinStyles(totalWin: Node, winValue: number) {
        const label = totalWin.getComponent(Label);
        const gradient = totalWin.getComponent(GradientNode);
        totalWin.setScale(new Vec3(0.1, 0.1, 0.1));

        const labelValue = `${winValue > 0 ? "+" : ""}` + FormatUtils.numberWithCommas(winValue, 2);
        label.string = labelValue;

        if (winValue > 0) {
            gradient.topColor = new Color("FFEC9F");
            gradient.bottomColor = new Color("FFE14600");
        } else {
            gradient.topColor = new Color("FFFFFF");
            gradient.bottomColor = new Color("A2A2A200");
        }
    }

    private handleAvatarWinAnimation(playerAvatar: Node, winValue: number) {
        if (winValue > 0) {
            const avatarBorderAnimationWin = playerAvatar.getChildByName("border-win-animation");

            this.scheduleOnce(() => {
                avatarBorderAnimationWin.active = true;

                tween(borderUiOpacity)
                    .to(3, { opacity: 0 })
                    .call(() => {
                        avatarBorderAnimationWin.active = false;
                    })
                    .start();
            }, 1);

            const avatarBorderWin = playerAvatar.getChildByName("border-win");
            const borderUiOpacity = avatarBorderWin.getComponent(UIOpacity);

            const embedTween = tween(borderUiOpacity).to(0.4, { opacity: 255 }).to(0.4, { opacity: 10 });

            tween(borderUiOpacity)
                .repeat(5, embedTween)
                .call(() => {
                    borderUiOpacity.opacity = 0;
                })
                .start();
        }
    }

    private handleTotalWinAnimation(totalWin: Node) {
        const uiOpacity = totalWin.getComponent(UIOpacity);

        tween(totalWin)
            .to(0.5, { scale: new Vec3(1.5, 1.5, 1.5) }, { easing: "quadInOut" })
            .to(0.5, { scale: new Vec3(1, 1, 1) }, { easing: "quadInOut" })
            .delay(0.5)
            .call(() => {
                tween(uiOpacity).to(1, { opacity: 0 }).start();
            })
            .start();
    }

    @handle(SettlementHandlers, (handler, animation: AnimationStage) => handler.handleFinishAnimation(animation))
    finishSettleAnimation(animation: AnimationStage) {
        return animation;
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playSound(soundId: string) {
        return soundId;
    }
}
