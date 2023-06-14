import { _decorator } from "cc";
import gc from "@sg/game-client-base";
import { BetChoice } from "../dtf-commons";
import BetDetailLogItem, {
    BetDetailLogItemType,
    GameRoundBetDetailsLog,
} from "db://shared-components/game/bet-history/scripts/components/bet-detail/bet-detail-log-item";

const { ccclass } = _decorator;
const { FormatUtils } = gc;

@ccclass
export default class BetDetailBodyItem extends BetDetailLogItem {
    setData(data: BetDetailLogItemType) {
        const { betDetailsLog, odds, fractionalOddsFormat, settlementResult, freeBet } = data;

        const { amount, choice } = betDetailsLog as GameRoundBetDetailsLog & gc.BetHistory.DynamicObject<object>;
        const odd = odds[choice];
        super.setData(data);

        this.lblOdds.string = (fractionalOddsFormat ? FormatUtils.numberWithCommas(+odd - 1, 2) : odd).toString();
        if (settlementResult[choice]) {
            const effectiveOdds = freeBet ? odd - 1 : odd;
            const winningAmount = amount * effectiveOdds;
            this.lblWin.string = FormatUtils.numberWithCommas(winningAmount, 2);
            this.setHighlightTicketDetail(winningAmount > amount);
        } else {
            const lossAmount =
                settlementResult[BetChoice.Tie] && (choice == BetChoice.Tiger || choice == BetChoice.Dragon) ? amount / 2 : 0;
            this.lblWin.string = FormatUtils.numberWithCommas(lossAmount, 2);
        }
    }
}
