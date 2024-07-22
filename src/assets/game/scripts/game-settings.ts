import gc from "@sg/game-client-base";
import { sharedContainer } from "../../scripts/shared-container";

export const settings = {
    id: 94,
    name: "Pusoy",
    durations: {},
};

export const containerOptions: gc.IContainerOptions = {
    globalContainer: sharedContainer,
    features: gc.GamePusoy.features,
    onContainerCreated: (container) => {
        container.bind(gc.GamePusoy.GameSetting).toConstantValue(settings);

        gc.GamePusoy.onContainerCreated(container, settings);
    },
};
