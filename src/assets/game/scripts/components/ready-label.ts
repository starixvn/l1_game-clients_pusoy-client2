import { _decorator, Component, instantiate, Node, Prefab, v3, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("ReadyLabel")
export class ReadyLabel extends Component {
    protected instance: Node = null;

    @property(Prefab)
    prefab: Prefab = null;

    init(position: Vec3 = v3(0, 0, 0)) {
        if (this.instance == null && this.prefab != null) {
            const ready = instantiate(this.prefab);
            this.node.addChild(ready);
            this.instance = ready;
            this.instance.position = position;
        }
    }

    destroyInstance() {
        if (this.instance !== null) {
            this.instance.destroy();
            this.instance = null;
        }
    }
}
