import { _decorator, Component, Node, sp } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AutoDestroySpine")
export class AutoDestroySpine extends Component {
    private readonly _autoDestroySpineHandler: AutoDestroySpineHandler[] = [];

    addDestroyHandler(handler: AutoDestroySpineHandler) {
        this._autoDestroySpineHandler.push(handler);
    }

    play(shouldDestroy = true, animation = "active") {
        const skeleton = this.node.getComponent(sp.Skeleton);
        skeleton.setAnimation(0, animation, false);
        this._autoDestroySpineHandler.forEach((handler) => {
            if (handler.onStart) {
                handler.onStart({});
            }
            if (handler.scheduleOnce) {
                Object.keys(handler.scheduleOnce).forEach((key) => {
                    const time = Number(key);
                    const schedule = handler.scheduleOnce[time];
                    skeleton.scheduleOnce(schedule, time * skeleton.timeScale);
                });
            }
        });
        skeleton.setCompleteListener(() => {
            this._autoDestroySpineHandler.forEach((handler) => {
                if (handler.onDestroy) {
                    handler.onDestroy({});
                }
            });
            if (shouldDestroy) {
                this.node.destroy();
            }
        });
    }
}

export interface AutoDestroySpineHandler {
    onDestroy?: <InType, OutType>(node: InType) => OutType | void;
    onStart?: <InType, OutType>(node: InType) => OutType | void;
    scheduleOnce?: { [key: number]: (time: number, node: Node) => void };
}
