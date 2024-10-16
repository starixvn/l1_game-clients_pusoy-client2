import gc from "@sg/game-client-base";
import { _decorator, Label } from "cc";
import Observer from "observer";
import { ObserverComponent } from "../../../../extensions/shared-components/assets/shared/common-components/observer-component/scripts/observer-component";
import { PusoyServiceMessages } from "@sg/game-client-base/dist/game-pusoy";

const { RoundTimeStore } = gc.GamePusoy.Rounds;
const { BetHandler } = gc.GamePusoy.Bet;
const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass
export default class SearchingPlayers extends ObserverComponent {
    enoughPlayers = false;
    time = 0;
    runner: NodeJS.Timer;

    @property({ type: Label })
    waitTime: Label = null;

    count() {
        this.time++;
        const seconds = this.time < 10 ? `0${this.time}` : this.time.toString();
        this.waitTime.string = ` ${seconds} s`;
    }

    startSearching() {
        console.log("start searching players");
        this.runner = setInterval(() => {
            this.count();
        }, 1000);
    }

    stopSearching() {
        this.time = 0;
        clearInterval(this.runner);
    }

    @render(RoundTimeStore, (store) => ({
        remaining: store.remaining,
        isInTransitionTime: store.isInTransitionTime,
    }))
    setVisibility({ remaining, isInTransitionTime }: { remaining: number; isInTransitionTime: boolean }) {
        this.node.active = isInTransitionTime && !this.enoughPlayers;

        if (this.node.active) {
            this.startSearching();
        } else {
            this.stopSearching();
        }
    }

    @render(gc.GamePusoy.OtherPlayers.OtherPlayersStore, (store) => store.otherPlayers)
    updateEnoughPlayers(otherPlayers: PusoyServiceMessages.OtherPlayer[]) {
        if (otherPlayers.length > 0) {
            this.enoughPlayers = true;
        } else {
            this.enoughPlayers = false;
        }
    }
}
