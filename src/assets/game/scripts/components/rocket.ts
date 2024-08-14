import { _decorator, easing, EventHandler, tween, Vec3 } from "cc";
import Observer from "observer";
import gc from "@sg/game-client-base";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { AudioIds } from "../constanst/audio-ids";

const { ccclass, property } = _decorator;

const { handle } = Observer;
const { AudioHandler } = gc.Audios;

@ccclass("Rocket")
export class Rocket extends ObserverComponent {
    @property([EventHandler])
    afterFly: EventHandler[] = [];

    fly(start: Vec3, end: Vec3, rotation: Vec3) {
        this.node.worldPosition = start;

        this.playRocketFlySound();

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

    @handle(AudioHandler, (handle, id: string) => handle.playSFX(id))
    playRocketFlySound() {
        return AudioIds.ROCKET_WHOOSH;
    }
}
