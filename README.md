# alternate-browser
Browser extension to send certain urls to an alternative browser.

## Set Up
You need to set up the browser you want to open (via script) when a url matches one of the configured patterns.

See [Native manifests](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests) and [Native messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging) for details.

### Linux Example

#### Launch Script
Create a script for processing the native messages, as detailed in [Native messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging).

Python example:
```
#!/usr/bin/env -S python3 -u

import json
import struct
import subprocess
import sys

def getMessage():
    rawLength = sys.stdin.buffer.read(4)
    if len(rawLength) == 0:
        sys.exit(0)
    messageLength = struct.unpack('@I', rawLength)[0]
    message = sys.stdin.buffer.read(messageLength).decode('utf-8')
    return json.loads(message)

inp = getMessage()
subprocess.run(['google-chrome', inp])
```
#### Native Manifest
Create a config file at `/usr/lib64/mozilla/native-messaging-hosts/firefox_to_chrome.json`:
<pre>
{
  "name": "firefox_to_chrome",
  "description": "Load url in Chrome",
  "path": "/path/to/native/script",
  "type": "stdio",
  "allowed_extensions": ["alternatebrowser@thomasnardone.net"]
}
</pre>

If everything is configured properly, the next time you navigate or click on a link to a matching url, your tab should remain blank in Firefox, and the url should launch in your alternative browser.
