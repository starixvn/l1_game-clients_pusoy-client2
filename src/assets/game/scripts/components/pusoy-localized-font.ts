import { bundleManager } from "db://shared-components/shared/common-components/bundle-magager/bundle-manager";
import { Font, _decorator } from "cc";
import { LocalizedFont } from "db://shared-components/shared/common-components/localization/localized-font";

const { ccclass } = _decorator;

@ccclass("PusoyLocalizedFont")
export class PusoyLocalizedFont extends LocalizedFont {
    initData() {
        this.fontBases = {
            vi: "noto-serif-bold",
            id: "Poppins-Medium",
            en: "Poppins-Medium",
            th: "noto-serif-regular-thai",
            zh_cn: "noto-serif-regular-zhcn",
            zh_tw: "noto-serif-regular-zhtw",
        };
    }

    async loadFont(name: string) {
        const fontFromResources = await bundleManager.loadResourcesAsset<Font>(`fonts/${name}`, Font);
        const fontFromShared = await bundleManager.loadSharedAsset<Font>(`fonts/${name}`, Font);
        return fontFromShared ?? fontFromResources;
    }
}
