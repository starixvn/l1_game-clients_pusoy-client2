import { _decorator, BoxCollider2D, Color, Component, Contact2DType, Enum, instantiate, Node, Prefab, Sprite, UITransform } from "cc";
import { HandSegment } from "./hand-segment";
import { Card } from "./card";

const { ccclass, property } = _decorator;

@ccclass
export class Hand extends Component {
    @property(Prefab)
    protected cardPrefab: Prefab = null;

    @property([HandSegment])
    protected segments: HandSegment[] = [];

    protected onLoad(): void {
        this.loadComponents();

        const cards = [
            [instantiate(this.cardPrefab), instantiate(this.cardPrefab), instantiate(this.cardPrefab)],
            [
                instantiate(this.cardPrefab),
                instantiate(this.cardPrefab),
                instantiate(this.cardPrefab),
                instantiate(this.cardPrefab),
                instantiate(this.cardPrefab),
            ],
            [
                instantiate(this.cardPrefab),
                instantiate(this.cardPrefab),
                instantiate(this.cardPrefab),
                instantiate(this.cardPrefab),
                instantiate(this.cardPrefab),
            ],
        ];

        this.segments.forEach((segment, index) => {
            cards[index].forEach((card) => (card.getComponent(Card).back = true));
            segment.addCard(cards[index]);

            this.scheduleOnce(() => {
                cards[index].forEach((card) => (card.getComponent(Card).back = false));
                segment.playSettleAnimation("Example", index === 2);
            }, -index * 4 + 12);
        });
    }

    onFocusInEditor(): void {
        this.loadComponents();
    }

    private loadComponents() {
        this.segments = this.node.getComponentsInChildren(HandSegment);
    }
}
