import { _decorator, Component, Node, sp } from "cc";
import { AutoDestroySpine } from "./auto-destroy-spine";
const { ccclass, property } = _decorator;

@ccclass("Crack")
export class Crack extends Component {
    @property(Node)
    crackText: Node = null;

    protected onLoad(): void {
        this.crackText.active = false;
        const autoDestroySpine = this.node.getComponent(AutoDestroySpine);
        autoDestroySpine.addDestroyHandler({
            scheduleOnce: {
                0.8333: () => {
                    this.crackText.active = true;
                },
            },
        });
    }

    update(deltaTime: number) {}
}
