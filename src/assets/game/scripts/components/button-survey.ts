import { _decorator, Label, tween, UIOpacity } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import gc from "@sg/game-client-base";

const { ccclass } = _decorator;
const { handle, render } = Observer;

@ccclass("ButtonSurvey")
export class ButtonSurvey extends ObserverComponent {
    surveyStatus = false;

    @handle(gc.GamePusoy.Survey.SurveyHandler, (handle, wishToPlayWithRealMoney: boolean) =>
        handle.sendSurveyToServer(wishToPlayWithRealMoney)
    )
    handleClickWishToPlayWithRealMoney() {
        this.surveyStatus = true;
        return true;
    }

    @render(gc.GamePusoy.Survey.SurveyStore, (store) => store.statusUpdated)
    renderButtonSurvey(statusUpdated: boolean) {
        const parent = this.node.getParent();

        console.log("statusUpdated: ", statusUpdated);
        if (statusUpdated && !this.surveyStatus) {
            parent.active = false;
            return;
        }

        if (statusUpdated && this.surveyStatus) {
            const label = parent.getChildByName("label").getComponent(Label);
            label.string = "Thank you for your feedback!";
            this.node.active = false;
            const uiOpacity = parent.getComponent(UIOpacity);

            tween(uiOpacity)
                .to(3, { opacity: 0 })
                .call(() => {
                    parent.active = false;
                })
                .start();
        }
    }
}
