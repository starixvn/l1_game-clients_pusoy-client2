import gc from "@sg/game-client-base";
import { sharedContainer } from "../../scripts/shared-container";

const GAME_NAME = "Pusoy";

export const settings = {
    id: 94,
    name: GAME_NAME,
    observerNamespace: GAME_NAME,
    durations: {},
};

export const containerOptions: gc.IContainerOptions = {
    globalContainer: sharedContainer,
    features: gc.GamePusoy.features,
    onContainerCreated: (container) => {
        container.bind(gc.GamePusoy.GameConfigs.GameSetting).toConstantValue(settings);

        gc.GamePusoy.onContainerCreated(container, settings);
    },
};
