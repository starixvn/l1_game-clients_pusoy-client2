import {
    _decorator,
    BoxCollider2D,
    Canvas,
    Collider2D,
    Component,
    Contact2DType,
    director,
    EventTouch,
    Input,
    math,
    Node,
    NodeEventType,
    RigidBody2D,
    tween,
    UITransform,
    Vec3,
} from "cc";
import { CardContainerEvent } from "../custom-event";
const { ccclass } = _decorator;

@ccclass("draggable")
export class Draggable extends Component {
    private _containerMap: Map<string, Collider2D> = new Map();
    _currentRect: math.Rect;
    _newCardContainer: Node = null;
    _currentWorldPosition: Vec3;
    _currentParent: Node = null;
    _isDragging: boolean = false;

    start() {
        this.node.on(NodeEventType.TOUCH_START, this.onDragStart, this);
        this.node.on(NodeEventType.TOUCH_MOVE, this.onDrag, this);
        this.node.on(NodeEventType.TOUCH_END, this.onDragEnd, this);
        this.node.on(NodeEventType.TOUCH_CANCEL, this.onDragCancel, this);
        const collider = this.node.getComponent(Collider2D);

        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    onDragCancel() {
        console.log("onDragCancel", this.node.name);
    }

    onDragStart(_: EventTouch) {
        if (!this._isDragging) {
            this._currentWorldPosition = this.node.getWorldPosition();
            this._currentParent = this.node.parent;
            console.log("before", this._currentParent.uuid);
            this.node.setParent(this.node.parent.parent.parent.parent);
            this.node.setSiblingIndex(this.node.parent.children.length - 1);
            this.node.setWorldPosition(this._currentWorldPosition);
            console.log("after 1", this.node.parent);
            console.log("after", this._currentParent.uuid);
        }
        this._isDragging = true;
    }

    onDrag(event: EventTouch) {
        const { x, y } = event.getLocation();

        if (this._containerMap.size > 0) {
            let max: Node = null;
            let maxIntersectArea = 0;
            ({ maxIntersectArea, max } = this.getMaxIntersectNode(maxIntersectArea, max));

            this.notifyCardContainer(max);
        }

        this.node.setWorldPosition(x, y, this.node.worldPosition.z);
    }

    private notifyCardContainer(max: Node) {
        if (max) {
            if (!this._newCardContainer) {
                max.emit(CardContainerEvent.OnDragOver, this.node);
            } else if (this._newCardContainer && max.uuid !== this._newCardContainer?.uuid) {
                this._newCardContainer.emit(CardContainerEvent.OnDragOverEnd);
                max.emit(CardContainerEvent.OnDragOver, this.node);
            }
            this._newCardContainer = max;
        }
    }

    onDragEnd(event: EventTouch) {
        console.log(this.node.name, "onDragEnd");
        const currentWordPosition = this.node.getWorldPosition();
        this.node.setParent(this._currentParent);
        this.node.setWorldPosition(currentWordPosition);
        if (this._newCardContainer && this._newCardContainer.uuid !== this.node.parent.uuid) {
            this._newCardContainer.emit(CardContainerEvent.SwapCard, this.node, this.node.parent);
        } else {
            tween(this.node).to(0.05, { worldPosition: this._currentWorldPosition }, { easing: "smooth" }).start();
        }
        this.node.setSiblingIndex(0);
        this._isDragging = false;
    }

    private getMaxIntersectNode(currentMaxIntersectArea: number, max: Node) {
        for (const [_, value] of this._containerMap) {
            const intersectArea = this.getIntersectArea(value);

            if (intersectArea > currentMaxIntersectArea) {
                max = value.node;
                currentMaxIntersectArea = intersectArea;
            }
        }
        return { maxIntersectArea: currentMaxIntersectArea, max };
    }

    getIntersectArea(otherCollider: Collider2D) {
        const collider = this.node.getComponent(Collider2D);
        if (collider) {
            const current = collider.worldAABB;
            const other = otherCollider.worldAABB;
            const xMin = Math.max(current.xMin, other.xMin);
            const xMax = Math.min(current.xMax, other.xMax);
            const yMin = Math.max(current.yMin, other.yMin);
            const yMax = Math.min(current.yMax, other.yMax);

            return (xMax - xMin) * (yMax - yMin);
        }

        return 0;
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        this._containerMap.set(otherCollider.node.uuid, otherCollider);
        this._currentRect = selfCollider.worldAABB;
    }

    onEndContact(_: Collider2D, otherCollider: Collider2D) {
        if (this._newCardContainer?.uuid === otherCollider.node.uuid) {
            this._newCardContainer.emit(CardContainerEvent.OnDragOverEnd);
            this._newCardContainer = null;
        }
        this._containerMap.delete(otherCollider.node.uuid);
    }

    update(deltaTime: number) {}
}
