import gc from "@sg/game-client-base";
import { _decorator, Label } from "cc";
import Observer from "observer";
import { ObserverComponent } from "../../../../extensions/shared-components/assets/shared/common-components/observer-component/scripts/observer-component";

const { RoundTimeStore } = gc.GamePusoy.Rounds;
const { BetHandler } = gc.GamePusoy.Bet;
const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass
export default class WaitTimer extends ObserverComponent {
    @property({ type: Label })
    lblSingle: Label = null;

    @render(RoundTimeStore, (store) => store.remainingTimeToPlaceBet)
    setTime(time: number) {
        this.lblSingle.string = time.toString().padStart(2, "0");
    }

    @render(RoundTimeStore, (store) => store.isInTransitionTime)
    setVisibility(isInTransitionTime: boolean) {
        this.node.active = isInTransitionTime;

        if (isInTransitionTime) {
            this.placeBet();
        }
    }

    @handle(BetHandler, (handler, payload: string) => handler.handle(payload))
    placeBet() {
        return "pusoy";
    }
}
