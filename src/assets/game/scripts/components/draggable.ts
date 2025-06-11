import { _decorator, Component, EventHandler, EventTouch, NodeEventType, v3, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Draggable")
export class Draggable extends Component {
    @property([EventHandler])
    dragStartHandlers: EventHandler[] = [];

    @property([EventHandler])
    draggingHandlers: EventHandler[] = [];

    @property([EventHandler])
    dragEndHandlers: EventHandler[] = [];

    @property([EventHandler])
    dragCancelHandlers: EventHandler[] = [];

    _isDragging = false;

    _delta: Vec3;

    onEnable(): void {
        this.node.on(NodeEventType.TOUCH_START, this.onDragStart, this);
        this.node.on(NodeEventType.TOUCH_MOVE, this.onDragging, this);
        this.node.on(NodeEventType.TOUCH_END, this.onDragEnd, this);
        this.node.on(NodeEventType.TOUCH_CANCEL, this.onDragCancel, this);
    }

    onDisable(): void {
        this.node.off(NodeEventType.TOUCH_START, this.onDragStart, this);
        this.node.off(NodeEventType.TOUCH_MOVE, this.onDragging, this);
        this.node.off(NodeEventType.TOUCH_END, this.onDragEnd, this);
        this.node.off(NodeEventType.TOUCH_CANCEL, this.onDragCancel, this);
    }

    onDragStart(event: EventTouch) {
        if (!this._isDragging) {
            const { x, y } = event.getUILocation();
            this._delta = v3(x, y, this.node.worldPosition.z).subtract(this.node.worldPosition);
            emitHandlers(this.dragStartHandlers, [this.node, event]);
        }

        this._isDragging = true;
    }

    onDragging(event: EventTouch) {
        const { x, y } = event.getUILocation();
        const newPosition = v3(x, y, this.node.worldPosition.z).subtract(this._delta);
        this.node.setWorldPosition(newPosition);
        emitHandlers(this.draggingHandlers, [this.node, event]);
    }

    onDragEnd(event: EventTouch) {
        emitHandlers(this.dragEndHandlers, [this.node, event]);
        this._isDragging = false;
    }

    onDragCancel(event: EventTouch) {
        emitHandlers(this.dragCancelHandlers, [this.node, event]);
        this._isDragging = false;
    }
}

const emitHandlers = (handlers: EventHandler[], params: any[]) => {
    for (const handler of handlers) {
        handler.emit(params);
    }
};
