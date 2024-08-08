import gc from "@sg/game-client-base";
import { _decorator, Color, Component, Label, Node, sp, tween, v3, Vec3 } from "cc";
import { LocalizedLabel } from "db://i18n/LocalizedLabel";
import { GradientNode } from "db://shared-components/shared/common-components/custom-materials/components/gradient-node";
import { AnimationUtils } from "db://shared-components/shared/utils";
import { HandCard } from "./hand-card";

const { ccclass, property } = _decorator;
const { FormatUtils } = gc;

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
    private _win = false;

    @property(Node)
    protected cardsNode: Node = null;

    @property(Node)
    protected rankNode: Node = null;

    @property(Node)
    protected payoutNode: Node = null;

    onLoad() {
        this.rankNode.active = false;
        this.payoutNode.active = false;
    }

    public set rank(value: string) {
        if (!this.isValidProperties()) {
            return;
        }

        const label = this.rankNode.getComponentInChildren(LocalizedLabel);

        label.key = value;
        label.updateLabel();
    }

    public get win() {
        return this._win;
    }

    public set win(value: boolean) {
        if (!this.isValidProperties()) {
            return;
        }

        this._win = value;

        const rankLabel = this.rankNode.getComponentInChildren(GradientNode);
        const payoutLabel = this.payoutNode.getComponentInChildren(GradientNode);

        if (value) {
            const topColor = new Color("FFEC9F");
            const bottomColor = new Color("FFE14600");

            rankLabel.topColor = topColor;
            rankLabel.bottomColor = bottomColor;

            payoutLabel.topColor = topColor;
            payoutLabel.bottomColor = bottomColor;
        } else {
            const topColor = new Color("FFFFFF");
            const bottomColor = new Color("A2A2A200");

            rankLabel.topColor = topColor;
            rankLabel.bottomColor = bottomColor;

            payoutLabel.topColor = topColor;
            payoutLabel.bottomColor = bottomColor;
        }

        rankLabel.onLoad();
        payoutLabel.onLoad();
    }

    public set payout(value: number) {
        const labelValue = `${value > 0 ? "+" : ""}` + FormatUtils.numberWithCommas(value, 2);
        const label = this.payoutNode.getComponentInChildren(Label);

        label.string = labelValue;
    }

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

    public playSettleAnimation(done: Function = () => ({})) {
        if (!this.cardsNode.children) {
            return;
        }

        this.rankNode.active = false;

        const steps = this.getAnimationSteps();
        const cards = this.cardsNode.children.map(this.createCardTween(steps));
        const rankTween = this.createRankTween(this.rankNode, steps);
        const payoutTween = this.createPayoutTween(this.payoutNode, steps);

        cards.forEach((card) => card.start());
        payoutTween.start();
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

                    const card = node.getComponent(HandCard);

                    card.disable = disable;
                });
            }

            return animation;
        };
    }

    private createRankTween(node: Node, steps: AnimationStep[]) {
        const animation = tween(node).call(() => {
            node.active = true;
            const spine = node.getComponentInChildren(sp.Skeleton);

            AnimationUtils.playSpine(spine, this.win ? "win" : "lose");
        });

        for (const { duration, rank } of steps) {
            animation.to(duration, rank);
        }

        return animation.call(() => {
            node.active = false;
        });
    }

    private createPayoutTween(node: Node, steps: AnimationStep[]) {
        const animation = tween(node).call(() => {
            node.active = true;
        });

        for (const { duration, rank } of steps) {
            animation.to(duration, rank);
        }

        return animation.call(() => {
            node.active = false;
        });
    }

    private isValidProperties() {
        return !!this.cardsNode && !!this.rankNode && !!this.payoutNode;
    }
}
