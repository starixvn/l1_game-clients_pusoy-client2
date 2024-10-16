import { values } from "lodash-es";
import gc from "@sg/game-client-base";
import { CCInteger, Label, Sprite, SpriteFrame, _decorator, Node, Vec3, Color } from "cc";
import { bundleManager } from "db://shared-components/shared/common-components/bundle-magager/bundle-manager";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { GradientNode } from "db://shared-components/shared/common-components/custom-materials/components/gradient-node";

const { ccclass, property } = _decorator;

const { Player } = gc;
const { render } = Observer;
const { MainPlayerStore } = Player;

@ccclass
export default class PlayerProfile extends ObserverComponent {
    @property(Label)
    playerName: Label = null;

    @property(Sprite)
    playerAvatar: Sprite = null;

    @property(CCInteger)
    slotIndex: number = 0;

    @property(Label)
    balance: Label = null;

    private _totalWin = 0;
    private _balance = 0;

    onLoad() {
        super.onLoad();

        const avatarBorderAnimationWin = this.node.getChildByName("avatar").getChildByName("border-win-animation");
        avatarBorderAnimationWin.active = false;
    }

    public setTotalWin(totalWin: number) {
        this._totalWin = totalWin;
    }

    public getTotalWin() {
        return this._totalWin;
    }

    public addBalance(amount: number) {
        this._balance += amount;
    }

    setPlayerName(text: string) {
        if (this.playerName) {
            this.playerName.string = text;
        }

        return this;
    }

    setPlayerBalance() {
        if (this.balance) {
            this.setBalanceStyles();
            this.balance.string = this._balance.toString();
        }

        return this;
    }

    private setBalanceStyles() {
        const gradient = this.balance.node.getComponent(GradientNode);

        gradient.topColor = new Color("FFFFFF");
        gradient.bottomColor = new Color("A2A2A200");
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

    @render(gc.GamePusoy.Rounds.RoundStore, (store) => store.playerBalance)
    renderMainPlayerBalance(balance: number) {
        if (this.slotIndex === 0) {
            this._balance = balance;
            this.setPlayerBalance();
        }
    }

    @render(gc.GamePusoy.OtherPlayers.OtherPlayersStore, (store) => store.otherPlayers)
    renderSlotIndex(otherPlayers: gc.GamePusoy.PusoyServiceMessages.OtherPlayer[]) {
        const player = otherPlayers.find((p) => p.slot === this.slotIndex);
        if (player) {
            this.setPlayerName(player.name);
            this.setPlayerAvatar(player.avatarId);
            this._balance = player.balance;
            this.setPlayerBalance();
            this.node.active = true;
        } else if (this.slotIndex > 0) {
            this.node.active = false;
        }
    }
}
