import { _decorator, Component, tween, v3 } from "cc";
import { Card } from "./card";

const { ccclass, property } = _decorator;

@ccclass
export class HandCard extends Component {
    @property(Card)
    protected card: Card = null;

    @property
    get back() {
        return this.card?.back;
    }

    set disable(value: boolean) {
        this.card!.disable = value;
    }

    value(rank: number, suit: number) {
        this.card!.suit = suit;
        this.card!.rank = rank;
    }

    flip(duration = 0.32, done = () => ({})) {
        const halfDuration = duration / 2;

        tween(this.node)
            .to(halfDuration, { scale: v3(0, 1, 1) })
            .call(() => {
                this.card.back = !this.card.back;
            })
            .to(halfDuration, { scale: v3(1, 1, 1) })
            .call(done)
            .start();
    }

    hide() {
        this.card!.node.active = false;
    }

    show() {
        this.card!.node.active = true;
    }
}
