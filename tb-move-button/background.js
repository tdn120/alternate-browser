const MDAM = [browser.menus.ContextType.MESSAGE_DISPLAY_ACTION_MENU];

/**
 * Reconstruct the menu for the messageDisplayAction button
 * 
 * @param {Tab} tab (unused)
 * @param {MessageHeader} message
 * 
 * @see https://webextension-api.thunderbird.net/en/mv2/messageDisplay.html#onmessagedisplayed
 * @see https://webextension-api.thunderbird.net/en/mv2/accounts.html#get-accountid-includesubfolders
 */
async function onMessageDisplayed(tab, message) {
  // clean up old menu
  await messenger.menus.removeAll();

  // load folders for message's account
  let currentFolder = message.folder;
  let account = await messenger.accounts.get(currentFolder.accountId, includeSubFolders = true);
  addFolders(account.folders, message.id, currentFolder.id);
}

/**
 * Recursively add folders and subfolders to the move menu, excluding the message's current folder.
 * 
 * @param {MailFolder[]} folders 
 * @param {MessageId} messageId
 * @param {MailFolderId} currentFolderId 
 * @param {string} parentId - id of the parent menu, if this is a subfolder.
 * 
 * @see https://webextension-api.thunderbird.net/en/mv2/messages.html#move-messageids-destination-options
 * @see https://webextension-api.thunderbird.net/en/mv2/menus.html#create-createproperties-callback
 */
async function addFolders(folders, messageId, currentFolderId, parentId) {
  for (let i = 0; i < folders.length; i++) {
    let f = folders[i];
    if (f.isRoot || f.id === currentFolderId) continue;
    let createProps = {
      contexts: MDAM,
      icons: "images/move.svg",
      onclick: () => {
        messenger.messages.move([messageId], f.id, { isUserAction: true });
      },
      title: f.name,
    };
    if (parentId) {
      createProps["parentId"] = parentId;
    }

    let id = await messenger.menus.create(createProps);
    console.log("ID", id);

    if (Array.isArray(f.subFolders) && f.subFolders.length > 0) {
      // Parent menu item won't be clickable. Create a child item for it.
      createProps["parentId"] = id;
      await messenger.menus.create(createProps);
      await messenger.menus.create({ type: "separator", parentId: id });

      // RECURSION - assumes the folder structure is small enough to avoid stack overflow.
      addFolders(f.subFolders, messageId, currentFolderId, id);
    }
  }
}

// when message is displayed, construct the menu of move-eligible folders
messenger.messageDisplay.onMessageDisplayed.addListener(onMessageDisplayed);
