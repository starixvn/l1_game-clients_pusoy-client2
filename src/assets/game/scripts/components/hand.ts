import { _decorator, Component, instantiate, Prefab } from "cc";
import { HandCard } from "./hand-card";
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

        this.segments.forEach((segment, index) => segment.addCard(cards[index]));

        // For demo
        this.renderCards({
            front: [
                { rank: 1, suit: 2 },
                { rank: 1, suit: 2 },
                { rank: 1, suit: 2 },
            ],
            middle: [
                { rank: 2, suit: 1 },
                { rank: 2, suit: 1 },
                { rank: 2, suit: 1 },
                { rank: 2, suit: 1 },
                { rank: 2, suit: 1 },
            ],
            back: [
                { rank: 3, suit: 1 },
                { rank: 3, suit: 1 },
                { rank: 3, suit: 1 },
                { rank: 3, suit: 1 },
                { rank: 3, suit: 1 },
            ],
        });
        this.playSettleAnimation({
            front: { name: "High card", win: true },
            middle: { name: "Full house", win: true },
            back: { name: "Three of a Kind", win: false },
        });
    }

    renderCards(data: Record<string, { rank: number; suit: number }[]>) {
        for (const segment of this.segments) {
            const cards = data[segment.node.name];
            const components = segment.getComponentsInChildren(HandCard);

            components.forEach((component, index) => {
                const { rank, suit } = cards[index];

                component.value(rank, suit);
            });
        }
    }

    async playSettleAnimation(settlements: Record<string, { name: string; win: boolean }>) {
        const segments = this.segments.reverse();

        for (const segment of segments) {
            const { name, win } = settlements[segment.node.name];
            const cards = segment.getComponentsInChildren(HandCard);

            for (const card of cards) {
                card.back && card.flip();
            }

            await new Promise((resolve) => segment.playSettleAnimation(name, win, resolve));
        }
    }

    onFocusInEditor(): void {
        this.loadComponents();
    }

    private loadComponents() {
        this.segments = this.node.getComponentsInChildren(HandSegment);
    }
}
