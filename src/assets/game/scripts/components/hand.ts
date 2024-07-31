import { _decorator, Component, instantiate, Node, Prefab, tween, v3 } from "cc";
import { HandCard } from "./hand-card";
import { HandSegment } from "./hand-segment";

const { ccclass, property } = _decorator;

@ccclass
export class Hand extends Component {
    @property(Node)
    protected dealerNode: Node = null;

    @property(Prefab)
    protected cardPrefab: Prefab = null;

    @property([HandSegment])
    protected segments: HandSegment[] = [];

    @property
    protected mine = false;

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
        this.segments.reverse();

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

        this.playDealsAnimation();

        this.scheduleOnce(() => {
            this.playSettleAnimation({
                front: { name: "High card", win: true },
                middle: { name: "Full house", win: true },
                back: { name: "Three of a Kind", win: false },
            });
        }, 5);
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
        for (const segment of this.segments) {
            const { name, win } = settlements[segment.node.name];
            const cards = segment.getComponentsInChildren(HandCard);

            for (const card of cards) {
                card.back && card.flip();
            }

            await new Promise((resolve) => segment.playSettleAnimation(name, win, resolve));
        }
    }

    async playDealsAnimation() {
        if (!this.dealerNode) {
            return;
        }

        const cards = this.segments.reduce((result, segment) => result.concat(segment.getComponentsInChildren(HandCard)), [] as HandCard[]);

        for (const card of cards) {
            card.node.active = false;
        }

        for (const card of cards) {
            const dealerPosition = this.dealerNode.getWorldPosition();
            const targetPosition = card.node.getWorldPosition();
            const targetRotation = card.node.rotation.clone();

            await new Promise((resolve) => {
                tween(card.node)
                    .call(() => {
                        card.node.setRotationFromEuler(v3(0, 0, 90));
                        card.node.setScale(v3(0.5, 0.5, 1));
                        card.node.setWorldPosition(dealerPosition);
                        card.node.active = true;
                    })
                    .to(0.1, { scale: v3(1, 1, 1), rotation: targetRotation, worldPosition: targetPosition })
                    .call(() => {
                        card.flip(0.32, !this.mine);
                        resolve(card);
                    })
                    .start();
            });
        }
    }

    onFocusInEditor(): void {
        this.loadComponents();
    }

    private loadComponents() {
        this.segments = this.node.getComponentsInChildren(HandSegment);
    }
}
