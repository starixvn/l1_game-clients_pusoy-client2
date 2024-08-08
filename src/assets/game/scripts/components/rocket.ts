import { _decorator, CCFloat, Component, easing, EventTouch, Node, RealCurve, tween, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("rocket")
export class rocket extends Component {
    @property(RealCurve)
    realCurve: RealCurve;

    fly(start: Vec3, end: Vec3) {
        this.node.position = start;
        tween(this.node)
            .to(0.5, { worldPosition: end, eulerAngles: new Vec3(0, -170, 0) }, { easing: "sineInOut" })
            .start();
    }
    flyTo(event: EventTouch) {
        console.log("flyTo: ", event);
        const { x, y } = event.getUILocation();
        const end = new Vec3(x, y, 0);
        const mid = new Vec3((x + this.node.worldPosition.x) / 2, (y + this.node.worldPosition.y) / 2, 0);
        // tween(this.node)
        //     .to(
        //         0.5,
        //         {
        //             worldPosition: mid,
        //             eulerAngles: new Vec3(0, -90, 0),
        //             scale: new Vec3(3, 3, 3),
        //         },
        //         { easing: easing.sineOut }
        //     )
        //     .to(0.5, { worldPosition: end, eulerAngles: new Vec3(0, -170, 0), scale: new Vec3(2, 2, 2) }, { easing: easing.sineIn })
        //     .start();
        const t1 = tween(this.node).to(1, { worldPosition: end, eulerAngles: new Vec3(0, -170, 0) }, { easing: easing.cubicIn });
        const t2 = tween(this.node)
            .to(0.5, { scale: new Vec3(3, 3, 3) }, { easing: "sineOut" })
            .to(0.5, { scale: new Vec3(2, 2, 2) }, { easing: "sineIn" });
        tween(this.node).parallel(t1, t2).start();
    }

    start() {}

    update(deltaTime: number) {}
}
