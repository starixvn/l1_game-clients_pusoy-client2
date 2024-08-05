import { _decorator, Component, EventHandler, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("ButtonReady")
export class button_ready extends Component {
    @property([EventHandler])
    clickEventsHandler: EventHandler[] = [];

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.onClick, this);
    }

    onClick() {
        this.clickEventsHandler.forEach((handler) => handler.emit([]));
    }

    update(deltaTime: number) {}
}
