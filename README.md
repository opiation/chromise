# chromise

This ECMAScript 5 library replaces known [Chrome API][0] methods with versions of themselves that return a [`Promise`][1] while still allowing the existing callback forms to be used.  This is ideal for migrating Chrome OS apps, Chrome apps and Chrome extensions away from the callback style.

### Using the existing callback form
If the API method is invoked with a function as its last parameter, the intent is assumed to be to used the existing callback form of the API.  The original API method is invoked as expected as though the library were not present.  

The following function type check is used:

```javascript
var lastArgument = arguments[arguments.length - 1];
if (typeof lastArgument === "function") {
    return callbackForm.apply(undefined /*API context*/, arguments);
}
```

### Using the Promise form
With the Promise form, the original API is invoked with a custom callback method and a promise is returned.  [`chrome.runtime.lastError`][2] is defined when an error is encountered with a given Chrome API.  If this is the case when the custom callback is invoked, the promise is rejected with the value of `chrome.runtime.lastError`.  Otherwise, the promise is resolved with the value(s) passed to the callback.  
> Note that if the API is successful and the callback is invoked with more than 1 arguments, the promise is resolved with the all the callback arguments passed as an array since native promises will not pass on additional arguments to functions pending their resolution.

#### Custom callback
```javascript
function callback(result /* arguments */) {
    // Reject the promise if there was an error
    if (chrome.runtime.lastError !== undefined) {
        return reject(chrome.runtime.lastError);
    }

    // If callback was invoked with multiple arguments, set result to an array
    if (arguments.length > 1) {
        result = Array.prototype.slice.call(arguments);
    }

    // Resolve the promise with the result
    resolve(result);
}
```

-----

## Example
Here is an example comparing the existing callback form with the Promise form as applied to the [`chrome.identity.getAuthToken`][3] API method.

```javascript
var tokenConfiguration = {
    interactive: true,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"]
};

function issueAuthenticatedRequest(token) {
    // Do something useful with the precious auth token and return the result
}

function handleError(error) {
    // Handle errors gracefully like informing the user or exponential backoff
    // Where getAuthToken is concerned, it's most likely the user turned down
    // the authentication request so best to leave them alone
}

// Callback form
chrome.identity.getAuthToken(tokenConfiguration, function (token) {
    if (chrome.runtime.lastError !== undefined) {
        return handleError(chrome.runtime.lastError);
    }

    return issueAuthenticatedRequest(token);
});

// Promise form
chrome.identity.getAuthToken(tokenConfiguration)
    .then(issueAuthenticatedRequest, handleError);
```

-----

## Support

As Chrome APIs are only replaced when present, support for this library in Chrome is reliant on support for native promises.  Based on [caniuse][4], native promises are fully supported in Chrome >= 33, released on February 20th, 2014.  Given that support target, this library is [ES5 Strict Mode][5]-compliant.  If you must use a version of Chrome **without** native promises, consider using one of the many polyfills available.  

Should you encounter any issues with this library, file an issue against it.

[0]: https://developer.chrome.com/extensions/api_index
[1]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
[2]: https://developer.chrome.com/extensions/runtime#property-lastError
[3]: https://developer.chrome.com/extensions/identity#method-getAuthToken
[4]: http://caniuse.com/#feat=promises
[5]: http://www.ecma-international.org/ecma-262/5.1/#sec-10.1.1
