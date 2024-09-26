import { _decorator, Component, Node } from "cc";
import { AnimationUtils } from "../../../../extensions/shared-components/assets/shared/utils";
import gc from "@sg/game-client-base";

const { bounceIn, fadeIn } = AnimationUtils;
const { ccclass, property } = _decorator;
const { Shared } = gc;
@ccclass("WelcomePopup")
export class WelcomePopup extends Component {
    @property(Node)
    nodeFadeBackground: Node = null;

    @property(Node)
    nodeBody: Node = null;

    protected readonly appearDuration = 0.4;
    protected readonly storageKey = "pusoy_welcome_popup";

    onLoad() {
        const data = (Shared.utils.StorageManager.get(this.storageKey) as { enabled: boolean }) ?? {
            enabled: true,
        };

        if (data.enabled) {
            this.show();
        } else {
            this.hide();
        }
    }

    show() {
        this.node.active = true;

        if (this.nodeFadeBackground) {
            this.nodeFadeBackground.active = true;
            fadeIn(this.nodeFadeBackground, 0.1);
        }
        if (this.nodeBody) {
            fadeIn(this.nodeBody, 0.3);
            bounceIn(this.nodeBody, this.nodeBody.scale, this.appearDuration);
        }
    }

    hide() {
        this.node.active = false;
    }

    doNotShowAgain() {
        Shared.utils.StorageManager.set(this.storageKey, { enabled: false });
        this.hide();
    }
}
