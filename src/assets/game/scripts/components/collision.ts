import { _decorator, Collider2D, Component, Contact2DType, EventTouch, math, Node, tween, Vec3 } from "cc";
import { DragCardEvent } from "../custom-event";
import { CardContainer } from "./card-container";
const { ccclass, property } = _decorator;

@ccclass("Collision")
export class Collision extends Component {
    private readonly _containerMap: Map<string, Collider2D> = new Map();

    _currentRect: math.Rect;
    _newCardContainer: Node = null;
    _currentWorldPosition: Vec3;
    _currentParent: Node = null;
    _isDragging = false;

    start() {
        const collider = this.node.getComponent(Collider2D);

        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    onDragStart(_: EventTouch) {
        this._currentWorldPosition = this.node.getWorldPosition();
        this._currentParent = this.node.parent;
        this.node.emit(DragCardEvent.OnDragStart, this.node);

        this.node.setParent(this.node.parent.parent.parent.parent);
        this.node.setWorldPosition(this._currentWorldPosition);
        this.node.setSiblingIndex(this.node.parent.children.length - 1);
    }

    onDragging(event: EventTouch) {
        if (this._containerMap.size === 1) {
            this.notifyCardContainer(this._containerMap.values().next().value.node);
        } else if (this._containerMap.size > 1) {
            const max: Node = null;
            const { max: maxNode } = this.getMaxIntersectNode(0, max);
            this.notifyCardContainer(maxNode);
        }
    }

    private notifyCardContainer(max: Node) {
        if (max) {
            if (!this._newCardContainer) {
                const cardContainer = max.getComponent(CardContainer);
                cardContainer.draggableCardNode.emit(DragCardEvent.OnDragOver, this.node);
            } else if (this._newCardContainer && max.uuid !== this._newCardContainer?.uuid) {
                const newCardContainer = this._newCardContainer.getComponent(CardContainer);
                newCardContainer.draggableCardNode.emit(DragCardEvent.OnDragOverEnd);

                const maxCardContainer = max.getComponent(CardContainer);
                maxCardContainer.draggableCardNode.emit(DragCardEvent.OnDragOver, this.node);
            }
            this._newCardContainer = max;
        }
    }

    onDragEnd(event: EventTouch) {
        const currentWordPosition = this.node.getWorldPosition();
        this.node.setParent(this._currentParent);
        this.node.setWorldPosition(currentWordPosition);
        if (this._newCardContainer && this._newCardContainer.uuid !== this.node.parent.uuid) {
            this._newCardContainer.emit(DragCardEvent.SwapCard, this.node, this.node.parent);
        } else {
            tween(this.node)
                .to(
                    0.05,
                    { worldPosition: this._currentParent.worldPosition },
                    {
                        easing: "smooth",
                        onStart: () => {
                            const draggable = this.node.getComponent(Collision);
                            draggable.enabled = false;
                        },
                        onComplete: () => {
                            const draggable = this.node.getComponent(Collision);
                            draggable.enabled = true;
                        },
                    }
                )
                .start();
            this.node.setSiblingIndex(0);
        }
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
            const newCardContainer = this._newCardContainer.getComponent(CardContainer);
            newCardContainer.draggableCardNode.emit(DragCardEvent.OnDragOverEnd);
            this._newCardContainer = null;
        }
        this._containerMap.delete(otherCollider.node.uuid);
    }

    update(deltaTime: number) {}
}
