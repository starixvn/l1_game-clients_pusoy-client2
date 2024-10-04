import { _decorator } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import gc from "@sg/game-client-base";

const { ccclass } = _decorator;
const { render } = Observer;

@ccclass
export class JoinNextGamePopup extends ObserverComponent {
    onLoad() {
        super.onLoad();
        this.node.active = false;
    }

    startPopup() {
        this.node.active = true;
        setTimeout(() => {
            this.node.destroy();
        }, 3000);
    }

    @render(gc.GamePusoy.Rounds.RoundStore, (store) => store.observingRound)
    observeRound(observingRound: boolean) {
        if (observingRound) {
            this.startPopup();
        }
    }
}
