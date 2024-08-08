import { SettlementResult } from "@sg/game-client-base/dist/game-pusoy";
import { Node, Prefab, _decorator, instantiate, tween } from "cc";
import Observer from "observer";
import gc from "@sg/game-client-base";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { AnimationStage } from "@sg/game-client-base/dist/game-pusoy/settlements";
const { SettlementStore, ANIMATION_STAGES, SettlementHandlers } = gc.GamePusoy.Settlement;

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

const coinFlightDuration = 500;
const numberOfCoins = 6;
const delayBetweenCoins = coinFlightDuration / (numberOfCoins - 1);

@ccclass
export class players extends ObserverComponent {
    @property({ type: Prefab })
    coinPrefab: Prefab | null = null;

    @property({ type: Node })
    playerCoin: Node | null = null;

    @property({ type: Node })
    leftCoin: Node | null = null;

    @property({ type: Node })
    rightCoin: Node | null = null;

    @property({ type: Node })
    centerCoin: Node | null = null;

    @property({ type: Node })
    sumCoin: Node | null = null;

    coins: Record<string, Node>;
    winners: SettlementResult[] = [];
    losers: SettlementResult[] = [];

    onLoad() {
        super.onLoad();
        this.coins = { slot0: this.playerCoin, slot1: this.leftCoin, slot2: this.centerCoin, slot3: this.rightCoin };
        this.sumCoin.active = false;
    }

    @render(SettlementStore, (store) => store.settlementResult)
    setLosersAndWinners(settlementResult: Record<string, SettlementResult>) {
        const settlementResults = Object.values(settlementResult);

        if (!this.coins || settlementResults.length === 0) {
            return;
        }

        this.losers = settlementResults.filter((result) => result.sum < 0);
        this.winners = settlementResults.filter((result) => result.sum > 0);
    }

    @render(SettlementStore, (store) => store.showAnimation[ANIMATION_STAGES.chipFly])
    renderCoin(showAnimation: boolean) {
        if (!this.coins || !this.winners.length || !this.losers.length) {
            return;
        }

        if (showAnimation) {
            console.log("show animation fly chip: ", showAnimation);
            this.losersAnimation(this.losers);

            setTimeout(() => {
                this.winnersAnimation(this.winners);
            }, coinFlightDuration * 2 + 200);

            this.finishSettleAnimation(ANIMATION_STAGES.chipFly as AnimationStage);
        }
    }

    losersAnimation(losers: SettlementResult[]) {
        losers.forEach((loser) => {
            const coin = this.coins[`slot${loser.slot}`];
            this.flyCoinAnimation(coin, this.sumCoin);
        });

        setTimeout(() => {
            this.sumCoin.active = true;
        }, coinFlightDuration);
    }

    winnersAnimation(winners: SettlementResult[]) {
        winners.forEach((winner) => {
            const coin = this.coins[`slot${winner.slot}`];
            this.flyCoinAnimation(this.sumCoin, coin);
        });

        setTimeout(() => {
            this.sumCoin.active = false;
        }, coinFlightDuration);
    }

    flyCoinAnimation(sourceCoin: Node, targetCoin: Node) {
        for (let i = 0; i < numberOfCoins; i++) {
            setTimeout(() => {
                this.flyCoin(sourceCoin, targetCoin);
            }, delayBetweenCoins * i);
        }
    }

    flyCoin(sourceCoin: Node, targetCoin: Node) {
        const newCoin = instantiate(this.coinPrefab);
        this.node.addChild(newCoin);
        newCoin.setWorldPosition(sourceCoin.worldPosition);

        tween(newCoin)
            .to(coinFlightDuration / 1000, { worldPosition: targetCoin.worldPosition })
            .call(() => {
                newCoin.destroy();
            })
            .start();
    }

    @handle(SettlementHandlers, (handler, animation: AnimationStage) => handler.handleFinishAnimation(animation))
    finishSettleAnimation(animation: AnimationStage) {
        console.log("finishSettleAnimation: ", animation);
        return animation;
    }
}
