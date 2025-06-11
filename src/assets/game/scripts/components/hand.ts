import { _decorator, CCInteger, easing, instantiate, math, Node, Prefab, Tween, tween, v3, Vec3 } from "cc";
import { HandCard } from "./hand-card";
import { HandSegment } from "./hand-segment";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import gc from "@sg/game-client-base";

const { ccclass, property } = _decorator;
const { render } = Observer;

@ccclass
export class Hand extends ObserverComponent {
    @property(Node)
    protected dealerNode: Node = null;

    @property(Prefab)
    protected cardPrefab: Prefab = null;

    @property(CCInteger)
    protected slotIndex = -1;

    protected readyNode: Node = null;

    getSlotIndex(): number {
        return this.slotIndex;
    }

    @property([HandSegment])
    protected segments: HandSegment[] = [];

    private _swappingTween: {
        node: Node;
        tween: Tween<Node>;
        target: {
            position: Vec3;
            rotation: math.Quat;
        };
    }[] = [];

    @property
    mine = false;

    natural = "";

    crack = false;

    playerNaturalOrCrack = false;

    private _shouldSwap = false;

    get cards(): HandCard[] {
        const result = [];
        const segments = [...this.segments].reverse();

        for (const segment of segments) {
            const components = segment.getComponentsInChildren(HandCard);

            result.push(...components);
        }

        return result;
    }

    onLoad(): void {
        super.onLoad();
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

        for (const card of cards.flat()) {
            card.active = false;
        }
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

    showSwapCards() {
        this._shouldSwap = true;

        const keepSwap = () => {
            if (!this._shouldSwap) {
                this.unschedule(keepSwap);
            } else if (Math.random() < 0.5 && this._swappingTween.length === 0) { //NOSONAR
                this.randomSwapCards();
            }
        };

        this.schedule(keepSwap, 1.5);
    }

    randomSwapCards() {
        let pickCards: Node[] = [];
        for (const segment of this.segments) {
            const cards = segment.getComponentsInChildren(HandCard);
            const nodes = cards.map((c) => c.node);
            pickCards.push(...nodes);
        }

        const randomIndex = Math.floor(Math.random() * pickCards.length); //NOSONAR
        const card1 = pickCards[randomIndex];
        pickCards = pickCards.filter((c) => c !== card1);

        const randomIndex2 = Math.floor(Math.random() * pickCards.length); //NOSONAR
        const card2 = pickCards[randomIndex2];

        this.swap(card1, card2);
    }

    swap(from: Node, to: Node) {
        const fromParent = from.getParent();
        const fromPosition = from.getPosition();
        const fromWorldPosition = from.getWorldPosition();
        const fromSiblingIndex = from.getSiblingIndex();
        const fromRotation = from.getRotation();

        const toParent = to.getParent();
        const toPosition = to.getPosition();
        const toWorldPosition = to.getWorldPosition();
        const toSiblingIndex = to.getSiblingIndex();
        const toRotation = to.getRotation();

        from.setParent(toParent);
        from.setWorldPosition(fromWorldPosition);
        from.setSiblingIndex(toSiblingIndex);

        to.setParent(fromParent);
        to.setWorldPosition(toWorldPosition);
        to.setSiblingIndex(fromSiblingIndex);

        const targetFrom = { position: fromPosition, rotation: fromRotation };
        const targetTo = { position: toPosition, rotation: toRotation };

        const t1 = tween(to)
            .to(0.5, targetFrom, { easing: easing.smooth })
            .call(() => {
                this._swappingTween = this._swappingTween.filter(({ node }) => node.uuid !== to.uuid);
            });

        const t2 = tween(from)
            .to(0.5, targetTo, { easing: easing.smooth })
            .call(() => {
                this._swappingTween = this._swappingTween.filter(({ node }) => node.uuid !== from.uuid);
            });

        this._swappingTween.push(
            {
                node: to,
                tween: t1,
                target: targetFrom,
            },
            {
                node: from,
                tween: t2,
                target: targetTo,
            }
        );
        t1.start();
        t2.start();
    }

    stopAllSwapping() {
        this._shouldSwap = false;

        this._swappingTween.forEach(({ node, tween, target }) => {
            tween.stop();
            node.setPosition(target.position);
            node.setRotation(target.rotation);
        });

        this._swappingTween = [];
    }

    activeCards(active: boolean, showCards = false) {
        const cards = this.segments.reduce((result, segment) => result.concat(segment.getComponentsInChildren(HandCard)), [] as HandCard[]);
        for (const card of cards) {
            card.node.active = active;
            card.back = !showCards;
        }
    }

    showCards(data: Record<string, { rank: number; suit: number }[]>) {
        this.renderCards(data);
        this.activeCards(true, true);
    }

    setRanks(ranks: Record<string, string>) {
        for (const segment of this.segments) {
            segment.rank = ranks[segment.node.name];
        }
    }

    setPayout(payout: Record<string, number>) {
        for (const segment of this.segments) {
            segment.payout = payout[segment.node.name];
            segment.win = payout[segment.node.name] > 0;
        }
    }

    async playSettleAnimation() {
        for (const segment of this.segments) {
            const cards = segment.getComponentsInChildren(HandCard);

            for (const card of cards) {
                card.back && card.flip();

                card.disable = !!this.natural || this.crack;
            }

            if (this.natural || this.crack) {
                continue;
            }

            await new Promise((resolve) => segment.playSettleAnimation(resolve, this.mine, this.playerNaturalOrCrack));
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
            const targetNode = new Node();
            targetNode.parent = card.node.parent;
            targetNode.setPosition(card.node.position);
            const targetRotation = card.node.rotation.clone();

            await new Promise((resolve) => {
                tween(card.node)
                    .call(() => {
                        card.node.setRotationFromEuler(v3(0, 0, 90));
                        card.node.setScale(v3(0.5, 0.5, 1));
                        card.node.setWorldPosition(dealerPosition);
                        card.disable = false;
                        card.node.active = true;
                    })
                    .to(0.1, { scale: v3(1, 1, 1), rotation: targetRotation, position: targetNode.position })
                    .call(() => {
                        card.flip(0.32, !this.mine);
                        resolve(card);
                        targetNode.destroy();
                    })
                    .start();
            });
        }
    }

    observeOtherPlayers() {
        const cards = this.segments.reduce((result, segment) => result.concat(segment.getComponentsInChildren(HandCard)), [] as HandCard[]);

        for (const card of cards) {
            card.node.active = false;
        }

        for (const card of cards) {
            card.disable = false;
            card.node.active = true;
            card.back = true;
        }
    }

    onFocusInEditor(): void {
        this.loadComponents();
    }

    private loadComponents() {
        this.segments = this.node.getComponentsInChildren(HandSegment);
    }

    @render(gc.GamePusoy.Rounds.RoundStore, (store) => store.otherPlayers)
    renderSlotIndex(otherPlayers: { avatarId: number; name: string; slot: number }[]) {
        const player = otherPlayers.find((p) => p.slot === this.slotIndex);
        if (player) {
            this.node.active = true;
        } else if (this.slotIndex > 0) {
            this.node.active = false;
        }
    }

    @render(gc.GamePusoy.Rounds.RoundStore, (store) => store.observingRound)
    observeRound(observingRound: boolean) {
        if (observingRound) {
            this.observeOtherPlayers();

            if (this.slotIndex === 0) {
                this.node.active = false;
            }
        } else {
            if (this.slotIndex === 0) {
                this.node.active = true;
                this.activeCards(false);
            }
        }
    }
}
