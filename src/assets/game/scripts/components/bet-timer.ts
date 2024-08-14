import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import Observer from "observer";
import TwoDigitsTimer from "../../../../extensions/shared-components/assets/game/game-timer/scripts/two-digits-timer";
import { AudioIds } from "../constanst/audio-ids";

const { ccclass } = _decorator;
const { render, handle } = Observer;
const { RoundTimeStore } = gc.GamePusoy.Rounds;

const changeColorTime = 10;
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

    @render(RoundTimeStore, (store) => store.remaining)
    playCountDownSound(remainingTime: number) {
        if (remainingTime <= changeColorTime && remainingTime > 0) {
            this.playClockSound();
        }
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playClockSound() {
        return AudioIds.CLOCK_TICK_TOCK;
    }
}
