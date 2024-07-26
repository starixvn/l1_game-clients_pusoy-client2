import { _decorator, Collider2D, Component, IPhysics2DContact, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("CardContainer")
export class CardContainerHandler extends Component {
    start() {
        this.node.on("onCardDragOver", this.onCardDragOver, this);
        this.node.on("onCardDragOverEnd", this.onCardDragOverEnd, this);
    }
    onCardDragOver() {
        console.log(this.node.name, "onCardDragOver");
    }

    onCardDragOverEnd() {
        console.log(this.node.name, "onCardDragOverEnd");
    }

    onBeginContact(self: Node, selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact, customData: any) {
        console.log("onBeginContact handler", self.name, selfCollider, otherCollider, contact, customData);
    }

    update(deltaTime: number) {}
}
