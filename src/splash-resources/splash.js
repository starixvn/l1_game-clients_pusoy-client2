window.mobilecheck = function () {
    let check = false;
    (function (a) {
        if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
                a
            ) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                a.substr(0, 4)
            )
        )
            check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

const userAgent = window.navigator.userAgent;

function initGA() {
    const gaCode = window.envConfig.systemType === "SG" ? "G-GJDD3FENTH" : "G-JHKMX35LM3";

    loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaCode}`).then(
        () => {
            console.log("Init GA");
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                dataLayer.push(arguments);
            }
            gtag("js", new Date());
            gtag("config", gaCode);
        },
        (reason) => {
            console.log("Init GA failed with" + reason);
        }
    );
}

function addGATrackingButton() {
    if (window.envConfig.env !== "PROD") {
        return;
    }
    const gaCode = "G-W13X2FGNGN";
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaCode}`).then(
        () => {
            console.log("Init GA");
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                dataLayer.push(arguments);
            }
            gtag("js", new Date());
            gtag("config", gaCode);
            globalThis.gtag = gtag;
        },
        (reason) => {
            console.log("Init GA failed with" + reason);
        }
    );
}

function loadScript(src) {
    return new Promise(function (resolve, reject) {
        let script;
        script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function getLanguageURLparams(locale) {
    const dict = {
        "vi-VN": "vi",
        "en-US": "en",
        "en-UK": "en",
        "th-TH": "th",
        "id-ID": "id",
        "zh-CN": "zh_cn",
        "zh-TW": "zh_tw",
    };
    return dict[locale] || "en";
}

function getCurrentLanguage() {
    let language = "vi";
    try {
        const languageKey = window.envConfig?.storagePrefixKey
            ? `${window.envConfig.storagePrefixKey}_current_language`
            : "current_language";
        if (localStorage.getItem(languageKey)) {
            language = localStorage.getItem(languageKey);
        }
    } catch (e) {}
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("lang")) {
        language = getLanguageURLparams(urlParams.get("lang"));
    }

    if (urlParams.has("params")) {
        const otherParams = new URLSearchParams(window.atob(urlParams.get("params")));
        if (otherParams.has("lang")) {
            language = getLanguageURLparams(otherParams.get("lang"));
        }
    }
    return language;
}

function getCurrentOperator() {
    let operator = "";
    try {
        const operatorKey = window.envConfig?.storagePrefixKey ? `${window.envConfig.storagePrefixKey}_op` : "op";
        if (localStorage.getItem(operatorKey)) {
            operator = localStorage.getItem(operatorKey);
        }
    } catch (e) {}

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("op")) {
        operator = urlParams.get("op");
    }

    if (urlParams.has("params")) {
        const otherParams = new URLSearchParams(window.atob(urlParams.get("params")));
        if (otherParams.has("op")) {
            operator = otherParams.get("op");
        }
    }
    return operator;
}

function updateLocalizedImages() {
    const splashBgGame = document.getElementById("splash_bg_game");
    const splashGameName = document.getElementById("splash_game_name");
    const language = getCurrentLanguage().replace(/['"]+/g, "");
    const operator = getCurrentOperator().replace(/['"]+/g, "").toUpperCase();

    const OperatorAlias = {
        SP: "SP",
        VG: "VG",
        SG: "SG",
        TIP88: "tip88",
    };

    let title, favicon;
    switch (OperatorAlias[operator]) {
        case OperatorAlias.SP:
            title = "Saba Play";
            favicon = "favicon_sabaplay.ico?v=5";
            break;
        case OperatorAlias.VG:
            title = "Vgaming";
            favicon = "favicon_vgaming.ico?v=4";
            break;
        case OperatorAlias.SG:
            title = language === "vi" ? "Cổng Game SABA" : "SABA.games";
            favicon = "favicon.ico?v=4";
            break;
        case OperatorAlias.TIP88:
            title = "SoiBet";
            favicon = "favicon.ico?v=4";
            break;
        default:
            title = "Default Title";
            favicon = "default_favicon.ico";
            break;
    }

    setTitleAndFavicon(title, favicon);
    setSplashTextClass(language);
    const classNameBG = window.envConfig?.backgroundNoTranslate ? "bg_no_translate" : `splash_bg_game_${language}`;
    const classNameGameName = `splash_game_name_${language}`;
    splashBgGame.className += ` ${classNameBG}`;
    splashGameName.className += ` ${classNameGameName}`;
}

function setTitleAndFavicon(title, favicon) {
    document.title = title;
    const rel = document.getElementById("favicon");
    rel.href = favicon;
}

function setSplashTextClass(language) {
    const splashText = document.getElementById("splash_text");
    const className = `splash_text_${language}`;
    splashText.className += ` ${className}`;
}

function updateSplashLogo() {
    const operator = getCurrentOperator().replace(/['"]+/g, "").toUpperCase();
    const splash = document.getElementById("splash_logo");
    const suffix = getCSSClassName(operator);
    splash.className = `splash${suffix}`;
}

function getCSSClassName(operator) {
    const operators = {
        SP: "_sabaplay",
        VG: "_Vgaming",
        SG: "",
        TIP88: "_tip88",
    };
    return operators.hasOwnProperty(operator) ? operators[operator] : "_other";
}

function isInstant() {
    const instantKey = "instant";
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(instantKey)) {
        return !!urlParams.get(instantKey);
    }
    try {
        const sessionStorageKey = window.envConfig?.storagePrefixKey ? `${window.envConfig.storagePrefixKey}_ss` : "ss";
        if (localStorage.getItem(sessionStorageKey)) {
            return JSON.parse(localStorage.getItem(sessionStorageKey))?.system === 3;
        }
    } catch (e) {}
    return false;
}

function updateSplashByAppType() {
    if (isInstant()) {
        const className = "instant-game";
        const splash = document.getElementById("splash");
        splash.classList.add(className);
        document.body.classList.add(className);
    }
}

updateSplashByAppType();
updateSplashLogo();
updateLocalizedImages();
initGA();
addGATrackingButton();
