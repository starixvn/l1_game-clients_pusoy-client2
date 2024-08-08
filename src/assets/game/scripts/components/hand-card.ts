import { _decorator, Component, easing, tween, v3 } from "cc";
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

    set back(value: boolean) {
        this.card!.back = value;
    }

    set disable(value: boolean) {
        this.card!.disable = value;
    }

    value(rank: number, suit: number) {
        this.card!.suit = suit;
        this.card!.rank = rank;
    }

    flip(duration = 0.32, keepBack = false, done = () => ({})) {
        const halfDuration = duration / 2;

        tween(this.node)
            .by(halfDuration, { eulerAngles: v3(0, 90, 0) })
            .call(() => {
                if (keepBack) {
                    this.card.back = true;
                } else {
                    this.card.back = false;
                }
            })
            .by(halfDuration, { eulerAngles: v3(0, -90, 0) }, { easing: easing.backOut })
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
