import { _decorator } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import gc from "@sg/game-client-base";

const { ccclass } = _decorator;
const { handle } = Observer;

@ccclass("ButtonSurvey")
export class ButtonSurvey extends ObserverComponent {
    @handle(gc.GamePusoy.Survey.SurveyHandler, (handle, wishToPlayWithRealMoney: boolean) =>
        handle.sendSurveyToServer(wishToPlayWithRealMoney)
    )
    handleClickWishToPlayWithRealMoney() {
        return true;
    }
}
