import { _decorator } from "cc";
import { PusoyLocalizedFont } from "./pusoy-localized-font";

const { ccclass } = _decorator;

@ccclass("PusoyLocalizedFontBold")
export default class PusoyLocalizedFontBold extends PusoyLocalizedFont {
    initData() {
        this.fontBases = {
            vi: "noto-serif-bold",
            id: "Poppins-Bold",
            en: "Poppins-Bold",
            th: "Poppins-Bold",
            zh_cn: "Poppins-Bold",
            zh_tw: "Poppins-Bold",
        };
    }
}
