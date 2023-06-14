import { _decorator, Color, Label } from "cc";
import { BaseResultBodyItem } from "db://shared-components/game/bet-history/scripts/components/bet-history-body-item";
import { PokerCard, ServiceCard } from "db://shared-components/game/poker-cards/scripts/poker-card";
import { BetChoice, Choice } from "../dtf-commons";
import gc from "@sg/game-client-base";

const { ccclass } = _decorator;
const { property } = _decorator;

@ccclass
export default class ResultBodyItem extends BaseResultBodyItem {
    @property(PokerCard)
    cards: PokerCard[] = [];

    @property(Label)
    dragonRank: Label = null;

    @property(Label)
    tigerRank: Label = null;

    setData(result: gc.BetHistory.DynamicObject<ServiceCard>, settlementResult: gc.BetHistory.DynamicObject<boolean>) {
        this.showCardResult(BetChoice.Dragon, Choice.Dragon, result, settlementResult, this.dragonRank);
        this.showCardResult(BetChoice.Tiger, Choice.Tiger, result, settlementResult, this.tigerRank);
    }

    showCardResult(
        betChoice: BetChoice,
        choiceIndex: Choice,
        result: gc.BetHistory.DynamicObject<ServiceCard>,
        settlementResult: gc.BetHistory.DynamicObject<boolean>,
        rankLabel: Label
    ) {
        const card = result[betChoice];
        this.cards[choiceIndex].setServiceCard(card);
        this.cards[choiceIndex].faceUp();
        rankLabel.string = (card.rank + 1).toString();
        rankLabel.color = settlementResult[betChoice] ? Color.YELLOW : Color.WHITE;
    }
}
