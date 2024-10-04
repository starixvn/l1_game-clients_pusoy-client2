import { _decorator, Component, Node } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import gc from "@sg/game-client-base";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass("ButtonNewTable")
export class ButtonNewTable extends ObserverComponent {
    @render(gc.GamePusoy.Rounds.RoundStore, (store) => store.observingRound)
    observeRound(observingRound: boolean) {
        this.node.active = observingRound;
    }

    @render(gc.GamePusoy.Rounds.RoundTimeStore, (store) => store.isInArrangementTime)
    inArrangement(inArrangement: boolean) {
        if (!inArrangement) {
            this.node.active = false;
        }
    }

    @handle(gc.GamePusoy.Rounds.RoundHandlers, (handler) => handler.handleCreateNewTable())
    handleClickOpenNewTable() {
        this.playClickSound();
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playClickSound() {
        return gc.Audios.AudioIds.CLICK;
    }
}
