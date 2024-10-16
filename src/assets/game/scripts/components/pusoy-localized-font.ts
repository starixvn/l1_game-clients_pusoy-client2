import { bundleManager } from "db://shared-components/shared/common-components/bundle-magager/bundle-manager";
import { CCBoolean, Component, Font, Label, _decorator } from "cc";
import gc from "@sg/game-client-base";

const { Translator } = gc;
const { ccclass, property } = _decorator;

@ccclass("LanguageFont")
export class LanguageFont {
    @property
    language = "";

    @property
    name = "";
}

@ccclass("PusoyLocalizedFont")
export class PusoyLocalizedFont extends Component {
    @property({ type: LanguageFont })
    overrideFonts: LanguageFont[] = [];

    @property(CCBoolean)
    enableCacheMode = false;

    label: Label = null;
    fontBases = {};

    onLoad() {
        this.initData();
        this.label = this.node.getComponent(Label);
        this.updateFont();
    }

    updateFont() {
        const name = this.getFontNameByLanguage();
        if (this.label) {
            this.loadFont(name)
                .then((font) => {
                    if (this.label.isValid) {
                        this.label.font = font;
                        this.enableCacheMode && this.handleCacheMode();
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }

    handleCacheMode() {
        const lang = Translator.getCurrentLanguageId();
        switch (lang) {
            case "th":
            case "zh_cn":
            case "zh_tw":
                this.label.cacheMode = Label.CacheMode.BITMAP;
                break;

            default:
                this.label.cacheMode = Label.CacheMode.CHAR;
                break;
        }
    }

    getFontNameByLanguage(): any {
        const lang = Translator.getCurrentLanguageId();
        const overrideFonts = this.overrideFonts.find((data) => data.language === lang);
        return overrideFonts?.name || this.fontBases[lang] || this.fontBases["en"];
    }

    initData() {
        this.fontBases = {
            vi: "noto-serif-bold",
            id: "Poppins-Medium",
            en: "Poppins-Medium",
            th: "Poppins-Medium",
            zh_cn: "Poppins-Medium",
            zh_tw: "Poppins-Medium",
        };
    }

    async loadFont(name: string) {
        const fontFromResources = await bundleManager.loadResourcesAsset<Font>(`fonts/${name}`, Font);
        const fontFromShared = await bundleManager.loadSharedAsset<Font>(`fonts/${name}`, Font);
        return fontFromShared ?? fontFromResources;
    }
}
