import gc from "@sg/game-client-base";
import mobx from "mobx";
import Observer from "observer";
import { siteConfigs } from "./site-configs";

function getSharedContainer(siteConfigs: gc.Configs.SiteConfigs) {
    const containerOptions: gc.IContainerOptions = {
        onContainerCreated: (container) => {
            container.bind(gc.Configs.SiteConfigs).toConstantValue(siteConfigs);
            container.bind(gc.Player.MainPlayerHandlers).to(gc.GamePusoy.Player.PusoyMainPlayerHandlers);
        },
        enabledFeatures: [
            gc.Player.FEATURE_NAME,
            gc.Auth.FEATURE_NAME,
            gc.App.FEATURE_NAME,
            gc.Notification.FEATURE_NAME,
            gc.ConnectSite.FEATURE_NAME,
            gc.ChipSetting.FEATURE_NAME,
        ],
    };

    return gc.getContainer(containerOptions);
}

export const sharedContainer = getSharedContainer(siteConfigs);

Observer.configure({ default: { mobx, container: gc.buildObserverContainer(sharedContainer) } });
