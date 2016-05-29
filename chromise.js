/*globals
  Array,
  chrome,
  console,
  Promise
*/

'use strict';

(function () {
  if (chrome === undefined || chrome.runtime === undefined || Promise === undefined) {
    console.error('cannot promisify Chrome APIs\ncore APIs are undefined or Promise is undefined')
    return;
  }

  // Default promisifier
  function promisify(fn, context) {

    function promise(/* args */) {
      let args = Array.prototype.slice.call(arguments);

      function executor(resolve, reject) {
        function callback(value) {
          if (chrome.runtime.lastError !== undefined && chrome.runtime.lastError !== null) {
            return reject(chrome.runtime.lastError);
          }

          // if callback is invoked with multiple arguments, return as an array
          if (arguments.length > 1) {
            value = Array.prototype.slice.call(value);
          }

          resolve(value);
        }

        args.push(callback);

        fn.apply(
          context,
          args);
      }

      return new Promise(executor);
    }

    return promise;
  }

  function replace_methods(object, methods) {
    methods.forEach(function (name) {
      let fn = object[name];

      if (typeof fn !== 'function') {
        /*console.warn(
          'cannot promisify property %s of %O as it is of type %s',
          name,
          object,
          typeof fn);*/

        return;
      }

      object[name] = promisify(fn, object);
    });
  }

  function iterate(object, collection) {
    for (let key in collection) {
      if (!collection.hasOwnProperty(key)) {
        continue;
      }

      if (!object.hasOwnProperty(key)) {
        /*console.warn(
          'object %O does not have member %s\ncannot replace methods for this API',
          object,
          key);*/

        continue;
      }

      // collection is an array of method names to promisify
      if (Array.isArray(collection[key])) {
        replace_methods(object[key], collection[key]);

      // collection is a sub API that may also have method names to promisify
      } else if (typeof collection[key] === 'object') {
        iterate(object[key], collection[key]);
      }

    }
  }

  let apis = {
    'accessibilityFeatures': {
      'animationPolicy': [
        'clear',
        'get',
        'set'],
      'autoclick': [
        'clear',
        'get',
        'set'],
      'highContrast': [
        'clear',
        'get',
        'set'],
      'largeCursor': [
        'clear',
        'get',
        'set'],
      'screenMagnifier': [
        'clear',
        'get',
        'set'],
      'spokenFeedback': [
        'clear',
        'get',
        'set'],
      'stickyKeys': [
        'clear',
        'get',
        'set'],
      'virtualKeyboard': [
        'clear',
        'get',
        'set']},
    'alarms': [
      'clear',
      'clearAll',
      'get',
      'getAll'],
    'bookmarks': [
      'create',
      'get',
      'getChildren',
      'getRecent',
      'getSubTree',
      'getTree',
      'move',
      'remove',
      'removeTree',
      'search',
      'update'],
    'browserAction': [
      'getBadgeBackgroundColor',
      'getBadgeText',
      'getPopup',
      'getTitle',
      'setIcon'],
    'browsingData': [
      'remove',
      'removeAppcache',
      'removeCache',
      'removeCookies',
      'removeDownloads',
      'removeFileSystems',
      'removeFormData',
      'removeHistory',
      'removeIndexedDB',
      'removeLocalStorage',
      'removePasswords',
      'removePluginData',
      'removeWebSQL',
      'settings'],
    'commands': [
      'getAll'],
    'contentSettings': {
      'automaticDownloads': [
        'clear',
        'get',
        'getResourceIdentifiers',
        'set'],
      'cookies': [
        'clear',
        'get',
        'getResourceIdentifiers',
        'set'],
      'fullscreen': [
        'clear',
        'get',
        'getResourceIdentifiers',
        'set'],
      'images': [
        'clear',
        'get',
        'getResourceIdentifiers',
        'set'],
      'javascript': [
        'clear',
        'get',
        'getResourceIdentifiers',
        'set'],
      'location': [
        'clear',
        'get',
        'getResourceIdentifiers',
        'set'],
      'mouselock': [
        'clear',
        'get',
        'getResourceIdentifiers',
        'set'],
      'notifications': [
        'clear',
        'get',
        'getResourceIdentifiers',
        'set'],
      'plugins': [
        'clear',
        'get',
        'getResourceIdentifiers',
        'set'],
      'popups': [
        'clear',
        'get',
        'getResourceIdentifiers',
        'set'],
      'unsandboxedPlugins': [
        'clear',
        'get',
        'getResourceIdentifiers',
        'set']},
    'contextMenus': [
      'create',
      'remove',
      'removeAll',
      'update'],
    'cookies': [
      'get',
      'getAll',
      'getAllCookieStores',
      'remove',
      'set'],
    'debugger': [
      'attach',
      'detach',
      'getTargets',
      'sendCommand'],
    'desktopCapture': [
      'cancelChooseDesktopMedia',
      'chooseDesktopMedia'],
    'devtools': {
      'inspectedWindow': [
        'eval',
        'getResources'],
      'network': [
        'getHAR'],
      'panels': [
        'create',
        'openResource',
        'setOpenResourceHandler']},
    'documentScan': [
      'scan'],
    'downloads': [
      'acceptDanger',
      'cancel',
      'download',
      'erase',
      'getFileIcon',
      'pause',
      'removeFile',
      'resume',
      'search'],
    'enterprise': {
      'deviceAttributes': [
        'getDirectoryDeviceId'],
      'platformKeys': [
        'getCertificates',
        'getTokens',
        'importCertificate',
        'removeCertificate']},
    'extension': [
      'isAllowedFileSchemeAccess',
      'isAllowedIncognitoAccess',
      'sendRequest'],
    'fileBrowserHandler': [
      'selectFile'],
    'fileSystemProvider': [
      'get',
      'getAll',
      'mount',
      'notify',
      'unmount'],
    'fontSettings': [
      'clearDefaultFixedFontSize',
      'clearDefaultFontSize',
      'clearFont',
      'clearMinimumFontSize',
      'getDefaultFixedFontSize',
      'getDefaultFontSize',
      'getFont',
      'getFontList',
      'getMinimumFontSize',
      'setDefaultFixedFontSize',
      'setDefaultFontSize',
      'setFont',
      'setMinimumFontSize'],
    'gcm': [
      'register',
      'send',
      'unregister'],
    'history': [
      'addUrl',
      'deleteAll',
      'deleteRange',
      'deleteUrl',
      'getVisits',
      'search'],
    'i18n': [
      'detectLanguage',
      'getUILanguage'],
    'identity': [
      'getAccounts',
      'getAuthToken',
      'getProfileUserInfo',
      'launchWebAuthFlow',
      'removeCachedAuthToken'],
    'idle': [
      'queryState'],
    'input': {
      'ime': [
        'clearComposition',
        'commitText',
        'deleteSurroundingText',
        'sendKeyEvents',
        'setCandidates',
        'setCandidateWindowProperties',
        'setComposition',
        'setCursorPosition',
        'setMenuItems',
        'updateMenuItems']},
    'instanceID': [
      'deleteID',
      'deleteToken',
      'getCreationTime',
      'getID',
      'getTokenParams'],
    'management': [
      'createAppShortcut',
      'generateAppForLink',
      'get',
      'getAll',
      'getPermissionWarningsById',
      'getPermissionWarningsByManifest',
      'getSelf',
      'launchApp',
      'setEnabled',
      'setLaunchType',
      'uninstall',
      'uninstallSelf'],
    'network': {
      'config': [
        'finishAuthentication',
        'setNetworkFilter']},
    'notifications': [
      'clear',
      'create',
      'getAll',
      'getPermissionLevel',
      'update'],
    'pageAction': [
      'getPopup',
      'getTitle',
      'setIcon'],
    'pageCapture': [
      'saveAsMHTML'],
    'permissions': [
      'contains',
      'getAll',
      'remove',
      'request'],
    'platformKeys': [
      'getKeyPair',
      'selectClientCertificates',
      'verifyTLSServerCertificate'],
    'proxy': {
      'settings': [
        'clear',
        'get',
        'set']},
    'runtime': [
      'getBackgroundPage',
      'getPackageDirectoryEntry',
      'getPlatformInfo',
      'openOptionsPage',
      'requestUpdateCheck',
      'sendMessage',
      'sendNativeMessage',
      'setUninstallURL'],
    'sessions': [
      'getDevices',
      'getRecentlyClosed',
      'restore'],
    'storage': {
      'local': [
        'clear',
        'get',
        'getBytesInUse',
        'remove',
        'set'],
      'managed': [
        'clear',
        'get',
        'getBytesInUse',
        'remove',
        'set'],
      'sync': [
        'clear',
        'get',
        'getBytesInUse',
        'remove',
        'set']},
    'system': {
      'cpu': [
        'getInfo'],
      'memory': [
        'getInfo'],
      'storage': [
        'ejectDevice',
        'getAvailableCapacity',
        'getInfo']},
    'tabCapture': [
      'capture',
      'getCapturedTabs'],
    'tabs': [
      'captureVisibleTab',
      'create',
      'detectLanguage',
      'duplicate',
      'executeScript',
      'get',
      'getAllInWindow',
      'getCurrent',
      'getSelected',
      'getZoom',
      'getZoomSettings',
      'highlight',
      'insertCSS',
      'move',
      'query',
      'reload',
      'remove',
      'sendMessage',
      'sendRequest',
      'setZoom',
      'setZoomSettings',
      'update'],
    'topSites': [
      'get'],
    'tts': [
      'getVoices',
      'isSpeaking',
      'speak'],
    'vpnProvider': [
      'createConfig',
      'destroyConfig',
      'notifyConnectionStateChanged',
      'sendPacket',
      'setParameters'],
    'wallpaper': [
      'setWallpaper'],
    'webNavigation': [
      'getAllFrames',
      'getFrame'],
    'webRequest': [
      'handlerBehaviorChanged'],
    'window': [
      'create',
      'get',
      'getAll',
      'getCurrent',
      'getLastFocused',
      'remove',
      'update'],

    'automation': [
      'getDesktop',
      'getFocus',
      'getTree'],
    'processes': [
      'getProcessIdForTab',
      'getProcessInfo',
      'temrinate'],
    'signedInDevices': [
      'get']};

  iterate(chrome, apis);
}());
