import gc from "@sg/game-client-base";
import { _decorator, Toggle } from "cc";
import Observer from "observer";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { FunctionUtils } from "db://shared-components/shared/utils";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;
const { Shared } = gc;
const { utils } = Shared;
@ccclass
export default class PlayMode extends ObserverComponent {
    @property(Toggle)
    toggle: Toggle = null;

    @handle(gc.GamePusoy.Survey.SurveyHandler, (handler, payload: boolean) => handler.handleOpenSurveyPopup(payload))
    onChangeOpenSurveyPopup() {
        if (this.toggle.isChecked) {
            utils.AnalyticsManager.trackEvent(utils.TrackingEvent.Button, {
                location: FunctionUtils.getNamespace(),
                action: utils.TrackingAction.Click,
                object_name: "switch_play_for_real",
                game_name: FunctionUtils.getNamespace(),
            });
            return true;
        }

        return false;
    }

    @render(gc.GamePusoy.Survey.SurveyStore, (store) => store.openSurveyPopup)
    showDisplayPopup(visible: boolean) {
        if (this.toggle) {
            this.toggle.isChecked = visible;
        }
    }
}
