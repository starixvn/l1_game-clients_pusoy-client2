import gc from "@sg/game-client-base";
import { _decorator } from "cc";
import Observer from "observer";
import TwoDigitsTimer from "../../../../extensions/shared-components/assets/game/game-timer/scripts/two-digits-timer";

const { ccclass } = _decorator;
const { render } = Observer;
const { Rounds } = gc.GamePusoy;
const { TimelineKey } = Rounds;
@ccclass
export default class BetTimer extends TwoDigitsTimer {
    @render(gc.GamePusoy.Rounds.RoundTimeStore, (store) => store.remaining)
    setTime(time: number) {
        super.setTime(time);
    }

    @render(gc.GamePusoy.Rounds.RoundTimeStore, (store) => store.isInArrangementTime)
    setVisibility(isInArrangementTime: boolean) {
        this.node.active = isInArrangementTime;
    }
}
