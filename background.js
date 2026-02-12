let logging = false;

function log(message, object) {
  if (logging) console.log(message, object);
}

function onResponse(response) {
  log("Received", response)
}

function onError(error) {
  log("Error:", error);
}

function onPatternsReceived(patternData) {
  if (patternData && Array.isArray(patternData['url_patterns']) && patternData['url_patterns'].length > 0) {
    let patterns = patternData['url_patterns'];
    log("Patterns:", patterns);
    browser.webRequest.onBeforeRequest.addListener(
      redirect,
      { urls: patterns, types: ["main_frame"] },
      ["blocking"],
    );
  }
}

function redirect(requestDetails) {
  log("Hit redirect", requestDetails.url);

  let sending = browser.runtime.sendNativeMessage("firefox_to_chrome", requestDetails.url);
  sending.then(onResponse, onError);
  return {
    redirectUrl: "about:blank",
  };
}

let savedPatterns = browser.storage.local.get('url_patterns');
savedPatterns.then(onPatternsReceived, onError);
