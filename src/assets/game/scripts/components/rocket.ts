import { _decorator, Component, easing, EventHandler, QuadRenderData, quat, tween, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Rocket")
export class Rocket extends Component {
    @property([EventHandler])
    afterFly: EventHandler[] = [];

    fly(start: Vec3, end: Vec3, rotation: Vec3) {
        this.node.worldPosition = start;

        const t1 = tween(this.node).to(
            0.8,
            { worldPosition: end, eulerAngles: rotation },
            {
                easing: easing.cubicIn,
            }
        );
        const t2 = tween(this.node)
            .to(0.4, { scale: new Vec3(1.5, 1.5, 1.5) }, { easing: easing.linear })
            .to(0.4, { scale: new Vec3(1, 1, 1) }, { easing: easing.linear });
        tween(this.node)
            .parallel(t1, t2)
            .call(() => {
                EventHandler.emitEvents(this.afterFly, this.node);
            })
            .start();
    }

    start() {}

    update(deltaTime: number) {}
}
