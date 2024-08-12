import gc from "@sg/game-client-base";
import { CCInteger, Label, Sprite, SpriteFrame, _decorator } from "cc";
import { bundleManager } from "db://shared-components/shared/common-components/bundle-magager/bundle-manager";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";

const { ccclass, property } = _decorator;

const { Player, GamePusoy } = gc;
const { render } = Observer;
const { MainPlayerStore } = Player;
const { Rounds } = GamePusoy;
const { RoundStore } = Rounds;

@ccclass
export default class PlayerProfile extends ObserverComponent {
    @property(Label)
    playerName: Label = null;

    @property(Sprite)
    playerAvatar: Sprite = null;

    @property(CCInteger)
    slotIndex: number = 0;

    private _totalWin = 0;

    onLoad() {
        super.onLoad();
    }

    public setTotalWin(totalWin: number) {
        this._totalWin = totalWin;
    }

    public getTotalWin() {
        return this._totalWin;
    }

    setPlayerName(text: string) {
        if (this.playerName) {
            this.playerName.string = text;
        }

        return this;
    }

    setPlayerAvatar(avatarId: number) {
        if (this.playerAvatar) {
            const path = `images/avatars/${avatarId}/spriteFrame`;

            bundleManager.loadSharedAsset<SpriteFrame>(path, SpriteFrame).then((frame) => {
                if (frame) {
                    this.playerAvatar.spriteFrame = frame;
                }
            });
        }

        return this;
    }

    // For main player only
    @render(MainPlayerStore, (store) => store.avatarId)
    renderAvatar(id: number) {
        this.setPlayerAvatar(id);
    }

    @render(MainPlayerStore, (store) => store.name)
    renderPlayerName(name: string) {
        this.setPlayerName(name);
    }

    @render(RoundStore, (store) => store.otherPlayers)
    renderSlotIndex(otherPlayers: { avatarId: number; name: string; slot: number }[]) {
        const player = otherPlayers.find((p) => p.slot === this.slotIndex);
        if (player) {
            this.setPlayerName(player.name);
            this.setPlayerAvatar(player.avatarId);
            this.node.active = true;
        } else if (this.slotIndex > 0) {
            this.node.active = false;
        }
    }
}
