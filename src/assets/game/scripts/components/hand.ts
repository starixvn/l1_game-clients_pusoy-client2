import { _decorator, Component, instantiate, Prefab, tween, v3 } from "cc";
import { Card } from "./card";
import { HandSegment } from "./hand-segment";

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
                for (const node of cards[index]) {
                    const card = node.getComponent(Card);

                    tween(node)
                        .to(0.16, { scale: v3(0, 1, 1) })
                        .call(() => (card.back = false))
                        .to(0.16, { scale: v3(1, 1, 1) })
                        .start();
                }
                segment.playSettleAnimation("Three of a Kind", !!index);
            }, -index * 2 + 8);
        });
    }

    onFocusInEditor(): void {
        this.loadComponents();
    }

    private loadComponents() {
        this.segments = this.node.getComponentsInChildren(HandSegment);
    }
}
