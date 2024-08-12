import { _decorator, Component, Node } from "cc";
import { LocalizedLabel } from "db://i18n/LocalizedLabel";
import { Card } from "./card";
const { ccclass, property } = _decorator;

@ccclass
export class Natural extends Component {
    @property(LocalizedLabel)
    protected label: LocalizedLabel = null;

    @property(Node)
    protected cardsNode: Node = null;

    set type(value: string) {
        this.label!.key = `Pusoy.${value}`;
        this.label?.updateLabel();
    }

    set cards(cards: { rank: number; suit: number }[]) {
        for (const [index, node] of this.cardsNode.children.entries()) {
            const { rank, suit } = cards[index];
            const card = node.getComponent(Card);

            card.rank = rank;
            card.suit = suit;
        }
    }

    async playAnimation() {}
}
