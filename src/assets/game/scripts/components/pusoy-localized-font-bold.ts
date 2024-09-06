import { _decorator } from "cc";
import { PusoyLocalizedFont } from "./pusoy-localized-font";

const { ccclass } = _decorator;

@ccclass("PusoyLocalizedFontBold")
export default class PusoyLocalizedFontBold extends PusoyLocalizedFont {
    initData() {
        this.fontBases = {
            vi: "Kodchasan-Bold",
            id: "Poppins-Bold",
            en: "Poppins-Bold",
            th: "noto-serif-bold-thai",
            zh_cn: "noto-serif-bold-zhcn",
            zh_tw: "noto-serif-bold-zhtw",
        };
    }
}
