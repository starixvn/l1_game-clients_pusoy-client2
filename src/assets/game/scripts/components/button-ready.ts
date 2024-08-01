import gc from "@sg/game-client-base";
import { _decorator, EventHandler, Node } from "cc";
import Observer from "observer";
import { ObserverComponent } from "../../../../extensions/shared-components/assets/shared/common-components/observer-component/scripts/observer-component";

const { ccclass, property } = _decorator;
const { handle } = Observer;

@ccclass("ButtonReady")
export class button_ready extends ObserverComponent {
    @property([EventHandler])
    clickEventsHandler: EventHandler[] = [];

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.onClick, this);
    }

    @handle(gc.GamePusoy.Arrangement.ArrangementHandler, (handler) => handler.submitHand())
    onClick() {
        console.log("submit hand");
        this.clickEventsHandler.forEach((h) => h.emit([]));
    }

    update(deltaTime: number) {}
}
