import { Label, Node, _decorator, sp } from "cc";
import { PokerCard } from "db://shared-components/game/poker-cards/scripts/poker-card";
import GameComponent from "db://shared-components/game/scripts/components/game-component";
import { WinningResult } from "db://shared-components/shared/common-components/winning-result/scripts/winning-result";
import { startGame } from "db://shared-components/shared/scripts/startup";
import Observer from "observer";
import { siteConfigs } from "../../../scripts/site-configs";
import { containerOptions, settings } from "../game-settings";
import gc from "@sg/game-client-base";
import "./../../../resources/i18n";

startGame(settings.name, containerOptions, siteConfigs);

const { ccclass, property } = _decorator;
const { observer, handle, render } = Observer;

@ccclass
@observer(settings.name)
export default class Game extends GameComponent {
    @property({ type: Label, override: true, visible: false })
    lblMinBet: Label = null;

    @property({ type: Label, override: true, visible: false })
    lblMaxBet: Label = null;

    @property(PokerCard)
    cards: PokerCard[] = [];

    @property(Node)
    nodeCardBox: Node = null;

    @property({ type: sp.Skeleton })
    resultSpines: sp.Skeleton[] = [];

    @property({ type: Node })
    staticMonsters: Node[] = [];

    @property(WinningResult)
    winningResult: WinningResult = null;

    override namespace = settings.name;
    override containerOptions = containerOptions;

    onLoad() {
        super.onLoad();
    }

    @render(gc.GameConfigs.GameConfigStore, (store) => store.initialized)
    onConfigsLoaded(initialized: boolean) {
        if (initialized) {
            this.placeBet();
        }
    }

    @handle(gc.Bet.BetHandler, (handler, payload: string) => handler.handle(payload))
    placeBet() {
        return "pusoy";
    }

    @render(gc.Rounds.RoundTimeStore, (store) => store.remaining)
    updateRemaining(remaining: number) {
        console.log(remaining);
    }
}
