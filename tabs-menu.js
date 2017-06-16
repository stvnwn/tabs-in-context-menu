// FIXME: async error handling
function populateMenu() {
  browser.contextMenus.removeAll().then(() => {
    browser.contextMenus.create({
      id: 'tabs-in-context-menu',
      title: 'Tabs',
      contexts: ['all']
    }, () => {
      browser.tabs.query({}).then((tabsArray) => {
        for (let i = 0, currentWindowId = tabsArray[0].windowId; i < tabsArray.length; i++) {
          if (currentWindowId != tabsArray[i].windowId) {
            currentWindowId = tabsArray[i].windowId;
            browser.contextMenus.create({
              // FIXME: add id property
              type: 'separator',
              parentId: 'tabs-in-context-menu',
              contexts: ['all']
            });
          }

          let title = tabsArray[i].title;
          if (tabsArray[i].incognito) {
            title = `\u{1f575} ${title}`;
          }

          browser.contextMenus.create({
            id: `${tabsArray[i].id}`,
            parentId: 'tabs-in-context-menu',
            title: title,
            contexts: ['all']
          });
        }
      });
    });
  });
}

browser.contextMenus.onClicked.addListener((info) => {
  browser.tabs.get(Number(info.menuItemId)).then((tab) => {
    browser.tabs.update(tab.id, {
      active: true
    }).then(() => {
      browser.windows.update(tab.windowId, {
        focused: true
      });
    });
  });
});

populateMenu();

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.title) {
    let title = changeInfo.title;
    if (tab.incognito) {
      title = `\u{1f575} ${title}`;
    }

    browser.contextMenus.update(`${tabId}`, {
      title: title
    });
  }
});

// FIXME: do not repopulate menu on change
browser.tabs.onCreated.addListener(populateMenu);
browser.tabs.onRemoved.addListener(populateMenu);
browser.tabs.onMoved.addListener(populateMenu);
