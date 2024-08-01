import { _decorator, Component, tween, v3 } from "cc";

const { ccclass, property, executeInEditMode } = _decorator;

@ccclass
@executeInEditMode
export class Quake extends Component {
    @property
    protected scale = 0.01;

    @property
    protected movement = 10;

    @property
    protected duration = 0.5;

    @property
    protected batches = 10;

    @property
    protected playOnStart = false;

    private playing = false;

    start() {
        if (this.playOnStart) {
            this.play();
        }
    }

    play() {
        if (this.playing) {
            return;
        }

        const size = 4;
        const duration = this.duration / this.batches / size;
        const animation = tween(this.node).call(() => (this.playing = true));

        for (let batch = 0; batch < this.batches; batch++) {
            animation.then(this.createBatch(duration, size));
        }

        animation.call(() => (this.playing = false)).start();
    }

    private createBatch(duration: number, size: number) {
        const position = this.node.position.clone();
        const scale = this.node.scale.clone();
        const animation = tween();

        for (let batch = 0; batch < size - 1; batch++) {
            animation.by(duration, {
                scale: v3(this.getRandom(this.scale), this.getRandom(this.scale), 1),
                position: v3(this.getRandom(this.movement), this.getRandom(this.movement), 0),
            });
        }

        return animation.to(duration, { position, scale });
    }

    private getRandom(range: number) {
        return 2 * range * Math.random() - range;
    }
}
