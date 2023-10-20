// Initialize the tabsList array to store saved tab data (URLs and titles)
let tabsList = [];

// Load and console log all the saved links from local storage
function loadSavedTabs() {
    const savedTabs = JSON.parse(localStorage.getItem("savedTabs"));
    if (savedTabs) {
        tabsList = savedTabs;
        updateTabsList();
    }
}

// Function to save tabs (either all tabs or just the current tab)
function saveTabs(saveAll = true) {
    if (saveAll) {
        saveAllTabs();
    } else {
        saveCurrentTab();
    }
}

function saveAllTabs() {
    chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
        const currentTabs = currentWindow.tabs;
        const savedTabsData = currentTabs.map(tab => ({ url: tab.url, title: tab.title }));

        tabsList.push(...savedTabsData);
        updateTabsList();
        saveTabsToLocalStorage();
    });
}

function saveCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (currentTabs) => {
        const currentTab = currentTabs[0];
        const tabData = { url: currentTab.url, title: currentTab.title };

        tabsList.push(tabData);
        updateTabsList();
        saveTabsToLocalStorage();
    });
}

function saveTabsToLocalStorage() {
    localStorage.setItem("savedTabs", JSON.stringify(tabsList));
}

// Function to update the tabs list in the popup
function updateTabsList() {
    const tabsListElement = document.getElementById("tabs-list");
    tabsListElement.innerHTML = '';

    tabsList.forEach((tabData, index) => {
        const listItem = document.createElement("li");
        listItem.classList.add("custom-li-class");
        const link = document.createElement("a");
        link.href = tabData.url;
        link.target = "_blank";
        link.textContent = `${index + 1}. ${tabData.title}`;

        const deleteIcon = createDeleteIcon(index);
        deleteIcon.addEventListener("click", () => {
            removeTab(index);
            updateTabsList();
            saveTabsToLocalStorage();
        });

        listItem.appendChild(link);
        listItem.appendChild(deleteIcon);
        tabsListElement.appendChild(listItem);
    });

   // Conditionally show/hide the "Delete All" button
   const deleteAllButton = document.getElementById("delete-all");
   deleteAllButton.style.display = tabsList.length > 0 ? "block" : "none";
}

function createDeleteIcon(index) {
    const deleteIcon = document.createElement("img");
    deleteIcon.className = "delete-icon";
    deleteIcon.src = "images/delete.png";
    deleteIcon.alt = "Delete";
    return deleteIcon;
}

function removeTab(index) {
    tabsList.splice(index, 1);
}

// Function to delete all saved tabs
function deleteAllTabs() {
    // Ask the user for confirmation
    const isConfirmed = confirm("Are you sure you want to delete all saved tabs?");

    if (isConfirmed) {
        tabsList = [];
        updateTabsList();
        localStorage.removeItem("savedTabs");
    }
}

// Event listeners
document.getElementById("save-current-tab").addEventListener("click", () => {
    saveTabs(false);
});

document.getElementById("save-tabs").addEventListener("click", () => {
    saveTabs();
});

document.getElementById("delete-all").addEventListener("click", deleteAllTabs);

// Initial load of saved tabs
loadSavedTabs();
