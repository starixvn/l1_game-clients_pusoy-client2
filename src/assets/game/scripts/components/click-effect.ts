import { _decorator, easing, Node, Tween, tween, v3 } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import gc from "@sg/game-client-base";

const { handle } = Observer;
const { ccclass, property } = _decorator;

@ccclass("ClickEffect")
export class ClickEffect extends ObserverComponent {
    @property(String)
    soundEffect: string = gc.Audios.AudioIds.CLICK;

    private _tweenStart: Tween<Node> | null = null;
    private _tweenEnd: Tween<Node> | null = null;

    onEnable() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onDisable() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchStart() {
        if (this._tweenStart) {
            this._tweenStart.stop();
            this.node.scale = v3(1.1, 1.1, 1.1);
        } else {
            this._tweenStart = tween(this.node)
                .to(0.1, { scale: v3(1.1, 1.1, 1.1) }, { easing: easing.smooth })
                .start();
        }
    }

    onTouchEnd() {
        this.playClickSound();

        if (this._tweenEnd) {
            this._tweenEnd.stop();
            this.node.scale = v3(1, 1, 1);
        } else {
            this._tweenEnd = tween(this.node)
                .to(0.1, { scale: v3(1, 1, 1) }, { easing: easing.smooth })
                .start();
        }
    }

    onTouchCancel() {
        if (this._tweenEnd) {
            this._tweenEnd.stop();
            this.node.scale = v3(1, 1, 1);
        } else {
            this._tweenEnd = tween(this.node)
                .to(0.1, { scale: v3(1, 1, 1) }, { easing: easing.smooth })
                .start();
        }
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playClickSound() {
        return this.soundEffect;
    }
}
