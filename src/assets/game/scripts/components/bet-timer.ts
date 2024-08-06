import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import Observer from "observer";
import TwoDigitsTimer from "../../../../extensions/shared-components/assets/game/game-timer/scripts/two-digits-timer";

const { ccclass } = _decorator;
const { render } = Observer;
const { RoundTimeStore } = gc.GamePusoy.Rounds;

const changeColorTime = 5;
@ccclass
export default class BetTimer extends TwoDigitsTimer {
    @render(RoundTimeStore, (store) => store.remaining)
    setTime(time: number) {
        super.setTime(time);
    }

    @render(RoundTimeStore, (store) => store.isInArrangementTime)
    setVisibility(isInArrangementTime: boolean) {
        this.node.active = isInArrangementTime;
    }

    @render(RoundTimeStore, (store) => store.remaining)
    setTimerColor(remainingTime: number) {
        const color = remainingTime <= changeColorTime ? this.lockingColor : this.normalColor;
        this.setColor(color);
    }
}
