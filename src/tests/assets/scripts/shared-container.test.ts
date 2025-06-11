import { buildObserverContainer } from "@sg/game-client-base";
import { getSharedContainer } from "db://shared-components/shared/scripts/startup";
import mobx from "mobx";
import { configure } from "observer";

import "../../../assets/scripts/shared-container";

jest.mock("db://shared-components/shared/scripts/startup", () => ({
    getSharedContainer: jest.fn(() => ({ sharedContainer: true })),
}));

jest.mock("@sg/game-client-base", () => ({
    buildObserverContainer: jest.fn(() => ({ sharedContainer: true })),
    getContainer: jest.fn(() => ({ sharedContainer: true })),
    Player: { FEATURE_NAME: "player" },
    Auth: { FEATURE_NAME: "auth" },
    App: { FEATURE_NAME: "app" },
    Notification: { FEATURE_NAME: "notification" },
    ConnectSite: { FEATURE_NAME: "connectSite" },
    ChipSetting: { FEATURE_NAME: "chipSetting" },
    Configs: { SiteConfigs: Symbol("SiteConfigs") }
}));

jest.mock("../../../assets/scripts/site-configs", () => ({ siteConfigs: { mockedConfig: true } }));

describe("when imported", () => {
    it("should create observer container", () => {
        // Assert
        expect(buildObserverContainer).toBeCalledWith({ sharedContainer: true });
    });

    it("should configure observer", () => {
        // Assert
        expect(configure).toBeCalledWith({ default: { mobx, container: { sharedContainer: true } } });
    });
});
