/*global Array, chrome, Object, Promise */

/*property
    accessibilityFeatures, alarms, animationPolicy, apply, autoclick,
    automaticDownloads, automation, bookmarks, browserAction, browsingData,
    call, commands, concat, config, contentSettings, contextMenus, cookies,
    cpu, debugger, desktopCapture, deviceAttributes, devtools, documentScan,
    downloads, enterprise, extension, fileBrowserHandler, fileSystemProvider,
    fontSettings, forEach, fullscreen, gcm, highContrast, history, i18n,
    identity, idle, images, ime, input, inspectedWindow, instanceID,
    javascript, keys, largeCursor, lastError, length, local, location, managed,
    management, memory, mouselock, network, notifications, pageAction,
    pageCapture, panels, permissions, platformKeys, plugins, popups, processes,
    prototype, proxy, runtime, screenMagnifier, sessions, settings,
    signedInDevices, slice, spokenFeedback, stickyKeys, storage, sync, system,
    tabCapture, tabs, topSites, tts, unsandboxedPlugins, virtualKeyboard,
    vpnProvider, wallpaper, webNavigation, webRequest, window
*/

/*jslint browser, white */

(function () {
    "use strict";

    // promisify accepts a method that itself expects a callback function and
    // returns a Promise-returning version of said method.  If the resulting
    // method receives a function as its last parameter, the orignal callback
    // version is invoked with the last argument as a callback.  If the last
    // argument is not a function, the promise-returning version is used.
    function promisify(fn, context) {

        return function () {
            var args = Array.prototype.slice.call(arguments);
            // This can eventually be replaced with Array.from(arguments)

            // If the last argument is a function, assume the method is being
            // invoked in the callback style and use the former callback version
            if (typeof args[args.length - 1] === "function") {
                return fn.apply(context, args);
            }

            return new Promise(function (resolve, reject) {
                function callback(value) {
                    // According to the documentation, this will be defined
                    // during callback invocation if there's an error.  In most
                    // tested cases, this undefined check is sufficient
                    if (chrome.runtime.lastError !== undefined) {
                        return reject(chrome.runtime.lastError);
                    }

                    if (arguments.length > 1) {
                        value = Array.prototype.slice.call(value);
                    }

                    resolve(value);
                }

                fn.apply(context, args.concat(callback));
            });
        };
    }

    function replace(original, replacement) {
        var keys = Object.keys(replacement);

        keys.forEach(function (key) {
            var value = replacement[key];
            var method = original[key];

            if (method === undefined) {
                // Chrome has no API with key so it cannot be replaced
                return;
            }

            if (typeof value === "function") {
                if (typeof method !== "function") {
                    // If the api is not a method, don't replace it
                    return;
                }

                original[key] = promisify(method, original);
                return;
            }

            if (method !== undefined && typeof method !== "function") {
                replace(method, value);
            }
        });
    }

    var apis = {
        accessibilityFeatures: {
            animationPolicy: [
                "clear",
                "get",
                "set"],
            autoclick: [
                "clear",
                "get",
                "set"],
            highContrast: [
                "clear",
                "get",
                "set"],
            largeCursor: [
                "clear",
                "get",
                "set"],
            screenMagnifier: [
                "clear",
                "get",
                "set"],
            spokenFeedback: [
                "clear",
                "get",
                "set"],
            stickyKeys: [
                "clear",
                "get",
                "set"],
            virtualKeyboard: [
                "clear",
                "get",
                "set"]},
        alarms: [
            "clear",
            "clearAll",
            "get",
            "getAll"],
        bookmarks: [
            "create",
            "get",
            "getChildren",
            "getRecent",
            "getSubTree",
            "getTree",
            "move",
            "remove",
            "removeTree",
            "search",
            "update"],
        browserAction: [
            "getBadgeBackgroundColor",
            "getBadgeText",
            "getPopup",
            "getTitle",
            "setIcon"],
        browsingData: [
            "remove",
            "removeAppcache",
            "removeCache",
            "removeCookies",
            "removeDownloads",
            "removeFileSystems",
            "removeFormData",
            "removeHistory",
            "removeIndexedDB",
            "removeLocalStorage",
            "removePasswords",
            "removePluginData",
            "removeWebSQL",
            "settings"],
        commands: [
            "getAll"],
        contentSettings: {
            automaticDownloads: [
                "clear",
                "get",
                "getResourceIdentifiers",
                "set"],
            cookies: [
                "clear",
                "get",
                "getResourceIdentifiers",
                "set"],
            fullscreen: [
                "clear",
                "get",
                "getResourceIdentifiers",
                "set"],
            images: [
                "clear",
                "get",
                "getResourceIdentifiers",
                "set"],
            javascript: [
                "clear",
                "get",
                "getResourceIdentifiers",
                "set"],
            location: [
                "clear",
                "get",
                "getResourceIdentifiers",
                "set"],
            mouselock: [
                "clear",
                "get",
                "getResourceIdentifiers",
                "set"],
            notifications: [
                "clear",
                "get",
                "getResourceIdentifiers",
                "set"],
            plugins: [
                "clear",
                "get",
                "getResourceIdentifiers",
                "set"],
            popups: [
                "clear",
                "get",
                "getResourceIdentifiers",
                "set"],
            unsandboxedPlugins: [
                "clear",
                "get",
                "getResourceIdentifiers",
                "set"]},
        contextMenus: [
            "create",
            "remove",
            "removeAll",
            "update"],
        cookies: [
            "get",
            "getAll",
            "getAllCookieStores",
            "remove",
            "set"],
        debugger: [
            "attach",
            "detach",
            "getTargets",
            "sendCommand"],
        desktopCapture: [
            "cancelChooseDesktopMedia",
            "chooseDesktopMedia"],
        devtools: {
            inspectedWindow: [
                "eval",
                "getResources"],
            network: [
                "getHAR"],
            panels: [
                "create",
                "openResource",
                "setOpenResourceHandler"]},
        documentScan: [
            "scan"],
        downloads: [
            "acceptDanger",
            "cancel",
            "download",
            "erase",
            "getFileIcon",
            "pause",
            "removeFile",
            "resume",
            "search"],
        enterprise: {
            deviceAttributes: [
                "getDirectoryDeviceId"],
            platformKeys: [
                "getCertificates",
                "getTokens",
                "importCertificate",
                "removeCertificate"]},
        extension: [
            "isAllowedFileSchemeAccess",
            "isAllowedIncognitoAccess",
            "sendRequest"],
        fileBrowserHandler: [
            "selectFile"],
        fileSystemProvider: [
            "get",
            "getAll",
            "mount",
            "notify",
            "unmount"],
        fontSettings: [
            "clearDefaultFixedFontSize",
            "clearDefaultFontSize",
            "clearFont",
            "clearMinimumFontSize",
            "getDefaultFixedFontSize",
            "getDefaultFontSize",
            "getFont",
            "getFontList",
            "getMinimumFontSize",
            "setDefaultFixedFontSize",
            "setDefaultFontSize",
            "setFont",
            "setMinimumFontSize"],
        gcm: [
            "register",
            "send",
            "unregister"],
        history: [
            "addUrl",
            "deleteAll",
            "deleteRange",
            "deleteUrl",
            "getVisits",
            "search"],
        i18n: [
            "detectLanguage",
            "getUILanguage"],
        identity: [
            "getAccounts",
            "getAuthToken",
            "getProfileUserInfo",
            "launchWebAuthFlow",
            "removeCachedAuthToken"],
        idle: [
            "queryState"],
        input: {
            ime: [
                "clearComposition",
                "commitText",
                "deleteSurroundingText",
                "sendKeyEvents",
                "setCandidates",
                "setCandidateWindowProperties",
                "setComposition",
                "setCursorPosition",
                "setMenuItems",
                "updateMenuItems"]},
        instanceID: [
            "deleteID",
            "deleteToken",
            "getCreationTime",
            "getID",
            "getTokenParams"],
        management: [
            "createAppShortcut",
            "generateAppForLink",
            "get",
            "getAll",
            "getPermissionWarningsById",
            "getPermissionWarningsByManifest",
            "getSelf",
            "launchApp",
            "setEnabled",
            "setLaunchType",
            "uninstall",
            "uninstallSelf"],
        network: {
            config: [
                "finishAuthentication",
                "setNetworkFilter"]},
        notifications: [
            "clear",
            "create",
            "getAll",
            "getPermissionLevel",
            "update"],
        pageAction: [
            "getPopup",
            "getTitle",
            "setIcon"],
        pageCapture: [
            "saveAsMHTML"],
        permissions: [
            "contains",
            "getAll",
            "remove",
            "request"],
        platformKeys: [
            "getKeyPair",
            "selectClientCertificates",
            "verifyTLSServerCertificate"],
        proxy: {
            settings: [
                "clear",
                "get",
                "set"]},
        runtime: [
            "getBackgroundPage",
            "getPackageDirectoryEntry",
            "getPlatformInfo",
            "openOptionsPage",
            "requestUpdateCheck",
            "sendMessage",
            "sendNativeMessage",
            "setUninstallURL"],
        sessions: [
            "getDevices",
            "getRecentlyClosed",
            "restore"],
        storage: {
            local: [
                "clear",
                "get",
                "getBytesInUse",
                "remove",
                "set"],
            managed: [
                "clear",
                "get",
                "getBytesInUse",
                "remove",
                "set"],
            sync: [
                "clear",
                "get",
                "getBytesInUse",
                "remove",
                "set"]},
        system: {
            cpu: [
                "getInfo"],
            memory: [
                "getInfo"],
            storage: [
                "ejectDevice",
                "getAvailableCapacity",
                "getInfo"]},
        tabCapture: [
            "capture",
            "getCapturedTabs"],
        tabs: [
            "captureVisibleTab",
            "create",
            "detectLanguage",
            "duplicate",
            "executeScript",
            "get",
            "getAllInWindow",
            "getCurrent",
            "getSelected",
            "getZoom",
            "getZoomSettings",
            "highlight",
            "insertCSS",
            "move",
            "query",
            "reload",
            "remove",
            "sendMessage",
            "sendRequest",
            "setZoom",
            "setZoomSettings",
            "update"],
        topSites: [
            "get"],
        tts: [
            "getVoices",
            "isSpeaking",
            "speak"],
        vpnProvider: [
            "createConfig",
            "destroyConfig",
            "notifyConnectionStateChanged",
            "sendPacket",
            "setParameters"],
        wallpaper: [
            "setWallpaper"],
        webNavigation: [
            "getAllFrames",
            "getFrame"],
        webRequest: [
            "handlerBehaviorChanged"],
        window: [
            "create",
            "get",
            "getAll",
            "getCurrent",
            "getLastFocused",
            "remove",
            "update"],
        automation: [
            "getDesktop",
            "getFocus",
            "getTree"],
        processes: [
            "getProcessIdForTab",
            "getProcessInfo",
            "terminate"],
        signedInDevices: [
            "get"]};

    replace(apis, chrome);
}());
