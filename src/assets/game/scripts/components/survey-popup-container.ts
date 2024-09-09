import { _decorator, Component, Node } from "cc";
import Observer from "observer";
import gc from "@sg/game-client-base";
import { AnimationUtils } from "../../../../extensions/shared-components/assets/shared/utils";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { FunctionUtils } from "db://shared-components/shared/utils";

const { bounceIn, bounceOut, fadeIn, fadeOut } = AnimationUtils;
const { render, handle } = Observer;
const { ccclass, property } = _decorator;

const { Bet, Rounds, Shared } = gc;
const { utils } = Shared;

@ccclass("SurveyPopup")
export class SurveyPopup extends ObserverComponent {
    @property(Node)
    nodeFadeBackground: Node = null;

    @property(Node)
    nodeBody: Node = null;

    protected readonly appearDuration = 0.4;

    show() {
        this.node.active = true;

        if (this.nodeFadeBackground) {
            this.nodeFadeBackground.active = true;
            fadeIn(this.nodeFadeBackground, 0.1);
        }
        if (this.nodeBody) {
            fadeIn(this.nodeBody, 0.3);
            bounceIn(this.nodeBody, this.nodeBody.scale, this.appearDuration);
        }
    }

    hide() {
        this.handleCloseSurveyPopup();
    }

    @render(gc.GamePusoy.Survey.SurveyStore, (store) => store.openSurveyPopup)
    openGuide(enable: boolean) {
        if (enable === false) {
            this.node.active = false;
        } else if (enable === true) {
            this.show();
        }
    }

    @handle(gc.GamePusoy.Survey.SurveyHandler, (handler, payload: boolean) => handler.handleOpenSurveyPopup(payload))
    handleCloseSurveyPopup() {
        utils.AnalyticsManager.trackEvent(utils.TrackingEvent.Button, {
            location: FunctionUtils.getNamespace(),
            action: utils.TrackingAction.Click,
            object_name: "Wish_to_play_with_real_money",
            game_name: FunctionUtils.getNamespace(),
        });

        return false;
    }

    @handle(gc.GamePusoy.Survey.SurveyHandler, (handler, payload: boolean) => handler.handleOpenSurveyPopup(payload))
    onCloseSurveyPopup() {
        this.hide();
    }
}
