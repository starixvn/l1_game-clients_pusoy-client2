import { _decorator, Button, Component, EventHandler, Node, NodeEventType, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("ButtonChangePosition")
export class ButtonChangePosition extends Component {
    @property([EventHandler])
    changeArrangementHandlers: EventHandler[] = [];

    @property(Node)
    middle: Node = null;

    @property(Node)
    back: Node = null;

    start() {
        this.node.on(NodeEventType.TOUCH_START, this.onTouchStart, this);
    }

    onTouchStart() {
        const backPosition = new Vec3(this.back.worldPosition);
        const middlePosition = new Vec3(this.middle.worldPosition);
        this.back.setWorldPosition(middlePosition);
        this.middle.setWorldPosition(backPosition);
        this.changeArrangementHandlers.forEach((handler) => {
            handler.emit([this.node]);
        });
    }

    update(deltaTime: number) {}
}
