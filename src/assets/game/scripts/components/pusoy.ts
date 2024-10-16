import { _decorator, Component, Node, Vec3 } from "cc";
import { Rocket } from "./rocket";
const { ccclass, property } = _decorator;

const ROTATE_SOURCE = {
    "0": {
        x: -170,
        y: 0,
    },
    "1": {
        x: 0,
        y: 170,
    },
    "2": {
        x: 170,
        y: 0,
    },
    "3": {
        x: 0,
        y: -170,
    },
};

const ROTATE_TARGET = {
    "1": {
        x: 0,
        y: -170,
    },
    "3": {
        x: 0,
        y: 170,
    },
};

@ccclass("Pusoy")
export class Pusoy extends Component {
    @property(Node)
    rocket: Node;

    private _onDestroyHandlers: Function[] = [];

    addDestroyHandler(handler: Function) {
        this._onDestroyHandlers.push(handler);
    }

    afterFly(_: Node) {
        this._onDestroyHandlers.forEach((handler) => {
            handler();
            this.node.destroy();
        });
    }

    playAnimation(source: Node, sourceSlot: string, target: Node, targetSlot: string) {
        const randomRotation = Math.floor(Math.random() * 50) * 10 + 360;
        const rotationSource = ROTATE_SOURCE[sourceSlot];
        const rotationTarget = ROTATE_TARGET[targetSlot];
        const rotation = new Vec3(
            rotationTarget ? rotationTarget.x : rotationSource.x,
            rotationTarget ? rotationTarget.y : rotationSource.y
        );
        const rotationVec = new Vec3(rotation.x, rotation.y, rotation.y != 0 ? randomRotation : 0);
        this.rocket.getComponent(Rocket).fly(source.worldPosition, target.worldPosition, rotationVec);
    }
}
