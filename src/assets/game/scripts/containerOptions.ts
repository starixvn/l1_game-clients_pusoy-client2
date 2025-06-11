import gc from "@sg/game-client-base/dist/exports";
import { sharedContainer } from "../../scripts/shared-container";
import { settings } from "./game-settings";


export const containerOptions: gc.IContainerOptions = {
    globalContainer: sharedContainer,
    features: gc.GamePusoy.features,
    onContainerCreated: (container) => {
        container.bind(gc.GamePusoy.GameConfigs.GameSetting).toConstantValue(settings);

        gc.GamePusoy.onContainerCreated(container, settings);
    },
};
