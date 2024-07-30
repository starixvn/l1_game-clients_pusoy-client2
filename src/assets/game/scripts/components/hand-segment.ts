import { _decorator, Color, Component, Label, Node, sp, tween, v3, Vec3 } from "cc";
import { GradientNode } from "db://shared-components/shared/common-components/custom-materials/components/gradient-node";
import { Card } from "./card";

const { ccclass, property } = _decorator;

const ANIMATION_STEPS = [
    {
        cards: [
            { rotation: 0, x: -68, y: 0 },
            { rotation: 0, x: -34, y: 0 },
            { rotation: 0, x: 0, y: 0 },
            { rotation: 0, x: 34, y: 0 },
            { rotation: 0, x: 68, y: 0 },
        ],
        duration: 0,
        rank: { scale: v3(0.5, 0.5, 1) },
    },
    {
        cards: [
            { rotation: 0, x: -98, y: 0 },
            { rotation: 0, x: -49, y: 0 },
            { rotation: 0, x: 0, y: 0 },
            { rotation: 0, x: 49, y: 0 },
            { rotation: 0, x: 98, y: 0 },
        ],
        duration: 0.5,
        rank: { scale: v3(1.1, 1.1, 1) },
    },
    {
        cards: [
            { rotation: 20, x: -98, y: -15 },
            { rotation: 12, x: -49, y: -3 },
            { rotation: 0, x: 0, y: 0 },
            { rotation: -12, x: 49, y: -3 },
            { rotation: -20, x: 98, y: -15 },
        ],
        duration: 0.7,
        rank: { scale: v3(1, 1, 1) },
        default: true,
    },
    {
        cards: [
            { rotation: 20, x: -98, y: -15, disable: true },
            { rotation: 12, x: -49, y: -3, disable: true },
            { rotation: 0, x: 0, y: 0, disable: true },
            { rotation: -12, x: 49, y: -3, disable: true },
            { rotation: -20, x: 98, y: -15, disable: true },
        ],
        duration: 0.25,
        rank: { scale: v3(1, 1, 1) },
    },
];

type AnimationStep = {
    cards: { rotation: number; x: number; y: number; disable?: boolean }[];
    duration: number;
    rank: { scale: Vec3 };
    default?: boolean;
};

@ccclass
export class HandSegment extends Component {
    @property(Node)
    protected cardsNode: Node = null;

    @property(Node)
    protected rankNode: Node = null;

    public addCard(cards: Node[]) {
        if (!this.isValidProperties()) {
            return;
        }
        this.cardsNode.removeAllChildren();

        for (const card of cards) {
            this.cardsNode.addChild(card);
        }

        const positions = this.getDefaultPositions();

        positions.forEach((position, index) => {
            const node = this.cardsNode.children[index];

            node.position = v3(position.x, position.y, 0);
            node.setRotationFromEuler(v3(0, 0, position.rotation));
        });
    }

    public playSettleAnimation(rank: string, win: boolean, done: Function = () => ({})) {
        if (!this.cardsNode.children) {
            return;
        }

        this.rankNode.active = false;
        this.setRankData(rank, win);

        const steps = this.getAnimationSteps();
        const cards = this.cardsNode.children.map(this.createCardTween(steps));
        const rankTween = this.createRankTween(this.rankNode, steps);

        cards.forEach((card) => card.start());
        rankTween.call(done).start();
    }

    private getDefaultPositions() {
        const steps = this.getAnimationSteps();

        return steps.find((step) => step.default).cards;
    }

    private getAnimationSteps() {
        const steps = JSON.parse(JSON.stringify(ANIMATION_STEPS)) as AnimationStep[];

        if (this.cardsNode.children.length === 3) {
            steps.forEach((step) => {
                step.cards.pop();
                step.cards.shift();
            });
        }

        return steps;
    }

    private createCardTween(steps: AnimationStep[]) {
        return function (node: Node, nodeIndex: number) {
            const animation = tween(node);
            const nodeSteps = steps.map((step) => ({ ...step.cards[nodeIndex], duration: step.duration }));

            for (const { x, y, rotation, duration, disable } of nodeSteps) {
                animation.to(duration, { position: v3(x, y, 0), eulerAngles: v3(0, 0, rotation) }).call(() => {
                    if (disable === undefined) {
                        return;
                    }

                    const card = node.getComponent(Card);

                    card!.disable = disable;
                });
            }

            return animation;
        };
    }

    private createRankTween(node: Node, steps: AnimationStep[]) {
        const animation = tween(node).call(() => {
            node.active = true;
        });

        for (const { duration, rank } of steps) {
            animation.to(duration, rank);
        }
        // for (const { rank, duration } of steps) {
        //     animation.delay(duration).call(() => {
        //         node.active = rank;
        //     });
        // }

        return animation.call(() => {
            node.active = false;
        });
    }

    private setRankData(rank: string, win: boolean) {
        if (!this.isValidProperties()) {
            return;
        }

        const gradient = this.rankNode.getComponentInChildren(GradientNode);
        const label = this.rankNode.getComponentInChildren(Label);
        const skeleton = this.rankNode.getComponentInChildren(sp.Skeleton);

        label.string = rank;

        if (win) {
            gradient.topColor = new Color("FFEC9F");
            gradient.bottomColor = new Color("FFE14600");
        } else {
            gradient.topColor = new Color("FFFFFF");
            gradient.bottomColor = new Color("A2A2A200");
        }

        skeleton.node.active = win;
    }

    private isValidProperties() {
        return !!this.cardsNode && !!this.rankNode;
    }
}
