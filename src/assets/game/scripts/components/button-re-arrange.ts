import { _decorator, Component, Node } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import gc from "@sg/game-client-base";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass("ButtonReArrange")
export class ButtonReArrange extends ObserverComponent {
    @render(gc.GamePusoy.Arrangement.ArrangementStore, (store) => store.isShowReArrange)
    allPlayersSubmitted(isShowReArrange: boolean) {
        this.node.active = isShowReArrange;
    }

    @handle(gc.GamePusoy.Arrangement.ArrangementHandler, (handler) => handler.sendRearrangeToServer())
    handleClickReArrange() {
        this.node.active = true;
        this.playClickSound();
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playClickSound() {
        return gc.Audios.AudioIds.CLICK;
    }
}
