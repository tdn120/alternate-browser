let logging = false;

function log(message) {
  if (logging) console.log(message);
}

function onResponse(response) {
  log(`Received ${response}`)
}

function onError(error) {
  log(`Error: ${error}`);
}

function onPatternsReceived(patterns) {
  // TODO load patterns!
  log(`Patterns: ${patterns}`);
}

function redirect(requestDetails) {
  log(`"Hit redirect for ${requestDetails.url}`);

  let sending = browser.runtime.sendNativeMessage("firefox_to_chrome", requestDetails.url);
  sending.then(onResponse, onError);
  return {
    redirectUrl: "about:blank",
  };
}

console.log("Loaded new plugin.");

let savedPatterns = browser.storage.local.get('url_patterns');
savedPatterns.then(onPatternsReceived, onError);

browser.webRequest.onBeforeRequest.addListener(
  redirect,
  { urls: patterns, types: ["main_frame"] },
  ["blocking"],
);
