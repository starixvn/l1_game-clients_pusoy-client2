import { _decorator, Component, Node } from "cc";
import { Card } from "./card";
const { ccclass, property } = _decorator;

@ccclass("CardValue")
export class CardValue extends Component {
    @property(Node)
    innerCard: Node;

    private _value: number = 0;
    public get value(): number {
        return this._value;
    }
    public set value(value: number) {
        this._value = value;
    }

    changeFront(rank: number, suit: number) {
        this.innerCard.getComponent(Card).rank = rank;
        this.innerCard.getComponent(Card).suit = suit;
    }

    start() {}

    update(deltaTime: number) {}
}
