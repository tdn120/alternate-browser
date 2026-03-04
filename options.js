async function initOptions() {
  await loadOptions(loadDefaultsOnError = true);
}

async function reloadOptions(event) {
  await loadOptions(loadDefaultsOnError = false);
}

async function loadOptions(loadDefaultsOnError) {
  try {
    patterns = await browser.storage.local.get('url_patterns');
    if (patterns && Array.isArray(patterns['url_patterns']) && patterns['url_patterns'].length > 0) {
      setPatterns(patterns['url_patterns']);
      resetUI("reset");
    } else {
      loadDefaults();
    }
  } catch (error) {
    let errorLabel = document.querySelector("#errorLabel");
    if (errorLabel) {
      if (loadDefaultsOnError) {
        loadDefaults();
        errorLabel.innerText = `Error loading settings: ${error.message}.  Using defaults.`;
      } else {
        errorLabel.innerText = `Error loading settings: ${error.message}`;
      }
    } else {
      console.log("Unknown error loading options:", error);
    }
  }
}

async function saveOptions(event) {
  const options = document.querySelector("#patternList").options;
  const patterns = [];
  for (i = 0; i < options.length; i++) {
    patterns[i] = options.item(i).value;
  }
  try {
    await browser.storage.local.set({
      url_patterns: patterns,
    });
    resetUI("save");
  } catch (error) {
    console.log(error);
    document.querySelector("#errorLabel").innerText = `Error saving settings: ${error.message}`;
  }
}

function loadDefaults() {
  setPatterns([
    "*://*.chrome.com/*",
    "*://*.google.com/*",
    "*://*.google/*",
    "*://*.goo.gl/*",
    "*://*.youtube.com/*",
    "*://*.youtu.be/*",
  ]);
  resetUI("defaults");
}

function addPatternViaKeyboard(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addPattern(event);
  }
}

function addPattern(event) {
  const newPattern = document.querySelector("#patternInput").value;

  // validate url
  try {
    new URLPattern(newPattern); // throws if invalid pattern
  } catch(error) {
    document.querySelector("#errorLabel").innerText = `Invalid pattern! Please check the documentation.`;
    return;
  }

  const patternSelector = document.querySelector("#patternList");
  let before = null;
  
  // find position in list
  for (i = 0; i < patternSelector.options.length; i++) {
    const nextItem = patternSelector.item(i).value;
    if (newPattern === nextItem) {
      return; // duplicate entry
    } 
    if (newPattern < nextItem) {
      before = i;
      break;
    }
  }
  patternSelector.add(createOption(newPattern), before);
  resetUI("add");
}

function removePatterns(event) {
  const patternSelector = document.querySelector("#patternList");
  let selectedIndex = patternSelector.selectedIndex;
  while (selectedIndex > -1) {
    patternSelector.remove(selectedIndex);
    selectedIndex = patternSelector.selectedIndex;
  }
  resetUI("remove");
}

function setPatterns(patterns) {
  const patternSelector = document.querySelector("#patternList");
  for (i = patternSelector.options.length - 1; i > -1; i--) {
    patternSelector.remove(i);
  }
  patterns.sort();
  patterns.forEach(pattern => {
    patternSelector.add(createOption(pattern));
  });
}

function testUrlViaKeyboard(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    testUrl(event);
  }
}

function testUrl(event) {
  const patternSelector = document.querySelector("#patternList");
  const testUrl = document.querySelector("#urlInput").value;
  const resultLabel = document.querySelector("#testResult");
  let matched = false;
  for (const pattern of patternSelector.options) {
    if (new URLPattern(pattern.value).test(testUrl)) {
      resultLabel.innerText = `URL matched: ${pattern.value}`;
      matched = true;
      break;
    }
  }
  if (!matched) {
    resultLabel.innerText = "URL did not match.";
  }
}

function createOption(pattern) {
  const option = document.createElement("option");
  option.text = pattern;
  option.value = pattern;
  option.className = "pattern-list__select__option";
  return option;
}

function resetUI(buttonUsed) {
  document.querySelector("#saveButton").disabled = (buttonUsed == "save" || buttonUsed == "reset");
  document.querySelector("#errorLabel").innerText = "";
  enableRemoveButton();
}

function enableRemoveButton() {
  const patternSelector = document.querySelector("#patternList");
  const removeButton = document.querySelector("#removePatternsButton");
  removeButton.disabled = patternSelector.selectedOptions.length < 1;
}

document.addEventListener('DOMContentLoaded', initOptions);
document.querySelector("#addPatternButton").addEventListener("click", addPattern);
document.querySelector("#patternInput").addEventListener("keypress", addPatternViaKeyboard);
document.querySelector("#removePatternsButton").addEventListener("click", removePatterns);
document.querySelector("#patternList").addEventListener("change", enableRemoveButton);
document.querySelector("#saveButton").addEventListener("click", saveOptions);
document.querySelector("#resetButton").addEventListener("click", reloadOptions);
document.querySelector("#defaultsButton").addEventListener("click", loadDefaults);
document.querySelector("#testUrlButton").addEventListener("click", testUrl);
document.querySelector("#urlInput").addEventListener("keypress", testUrlViaKeyboard);
