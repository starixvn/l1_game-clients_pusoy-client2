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
export default class WaitTimer extends ObserverComponent {
    @property({ type: Label })
    lblSingle: Label = null;

    disableGame = false;
    enoughPlayers = false;

    @render(RoundTimeStore, (store) => store.remainingTimeToPlaceBet)
    setTime(time: number) {
        this.lblSingle.string = time.toString().padStart(2, "0");
    }

    @render(RoundTimeStore, (store) => ({
        remaining: store.remaining,
        isInTransitionTime: store.isInTransitionTime,
    }))
    setVisibility({ isInTransitionTime }: { remaining: number; isInTransitionTime: boolean }) {
        if (this.node.active && !isInTransitionTime && !this.disableGame && this.enoughPlayers) {
            console.log("place bet");
            this.placeBet();
        }

        this.node.active = isInTransitionTime && !this.disableGame && this.enoughPlayers;
    }

    @render(gc.GamePusoy.OtherPlayers.OtherPlayersStore, (store) => store.otherPlayers)
    updateEnoughPlayers(otherPlayers: PusoyServiceMessages.OtherPlayer[]) {
        if (otherPlayers.length > 0) {
            this.enoughPlayers = true;
        } else {
            this.enoughPlayers = false;
        }
    }

    @render(gc.DisabledGame.DisabledGameStore, (store) => store.disabled)
    updateDisableGame(disabled: boolean) {
        this.disableGame = disabled;
    }

    @handle(BetHandler, (handler, payload: string) => handler.handle(payload))
    placeBet() {
        return "pusoy";
    }
}
