# tb-header-buttons

## Description
Thunderbird extension to add a **Move** button in the message display toolbar.  It will provide similar options to the "Move To >" right-click context menu item, with the main exception being that it only lists folders from the current mail account.

Selecting a folder will immediately move the message as a "user action", allowing you to undo.

## Relevant API Links
This extension was developed by poring over the [API docs](https://webextension-api.thunderbird.net/en/mv2/index.html) for relevant account, folder, menu, and menu action button calls, in the perceived absence of a way to directly access the built-in "Move to" menu.

These are the resulting APIs used to provide the desired functionality:

* [accounts.get()](https://webextension-api.thunderbird.net/en/mv2/accounts.html#get-accountid-includesubfolders)
* [messageDisplay.onMessageDisplayed()](https://webextension-api.thunderbird.net/en/mv2/messageDisplay.html#onmessagedisplayed)
* [messages.move()](https://webextension-api.thunderbird.net/en/mv2/messages.html#move-messageids-destination-options)
* [menus.create()](https://webextension-api.thunderbird.net/en/mv2/menus.html#create-createproperties-callback)
