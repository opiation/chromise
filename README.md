# chromise

This modest Javascript library replaces known Chrome OS API methods with versions of themselves that return a [`Promise`][0].  

If using the Promise version, the promise is rejected when the API method fails.  At that point, the rejection handler is invoked with `chrome.runtime.lastError` as that's normally populated with the relevant error.

If the method is invoked with a function as its last parameter, the library method attempts to use the original callback version of the API method supplying said function as the callback.  With the slight overhead of the function type check, this makes the library ideal for gradually migrating away from the callback style methods of the existing API while not breaking existing tools.

The function type check is basically as follows:

```javascript
const lastArgument = arguments[arguments.length - 1];
if (typeof lastArgument === "function") {
    // The last argument is a function and most likely intended to be used as a callback
    return oldCallbackVersion.apply(undefined, arguments);
}

// Otherwise, use the fancy new Promise version
return new Promise(function (resolve, reject) {
    /// ...
});
```

## Example
Find below an example of how **chromise** allows one to use the `chrome.identity.getAuthToken` method:

```javascript
const tokenConfiguration = {
    interactive: true,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"]
};

chrome.identity.getAuthToken(tokenConfiguration)
.then(function (token) {
    // Do something useful with a precious auth token
    // Return the result to continue the promise chain
}, function (err) {
    // Handle errors gracefully
    // It's most likely that the user turned down the auth request
});
```

[0]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
