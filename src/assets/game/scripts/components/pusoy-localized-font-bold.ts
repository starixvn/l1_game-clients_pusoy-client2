import { _decorator } from "cc";
import { PusoyLocalizedFont } from "./pusoy-localized-font";

const { ccclass } = _decorator;

const FONT_BOLD = "Poppins-Bold";

@ccclass("PusoyLocalizedFontBold")
export default class PusoyLocalizedFontBold extends PusoyLocalizedFont {
    initData() {
        this.fontBases = {
            vi: "noto-serif-bold",
            id: FONT_BOLD,
            en: FONT_BOLD,
            th: FONT_BOLD,
            zh_cn: FONT_BOLD,
            zh_tw: FONT_BOLD,
        };
    }
}
