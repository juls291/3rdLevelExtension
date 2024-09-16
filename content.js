function findScrollableContainer() {
  const rows = document.querySelectorAll('.grid-row');
  
  if (rows.length > 0) {
    let currentElement = rows[0].parentElement;

    while (currentElement) {
      const overflowY = window.getComputedStyle(currentElement).overflowY;
      
      if (overflowY === 'auto' || overflowY === 'scroll') {
        console.log('Scrollable container found:', currentElement);
        return currentElement;
      }
      
      currentElement = currentElement.parentElement;
    }
  }
  
  console.warn('Scrollable container not found');
  return null;
}

function searchInLoadedRows(targetID) {
  const rows = document.querySelectorAll('.grid-row');
  
  for (let row of rows) {
    const idCell = row.querySelector('div[role="gridcell"][style*="width: 70px;"]');
    
    if (idCell && idCell.textContent.trim() === String(targetID)) {
      return row;
    }
  }
  
  return null; // Not found in current rows
}

/* OBSOLETE

function loadAllRows(container) {
  return new Promise((resolve) => {
    let previousScrollHeight = container.scrollHeight;
    
    // Step 1: Scroll to the bottom and wait for the rows to load
    container.scrollTop = container.scrollHeight;
    
    const interval = setInterval(() => {
      if (container.scrollHeight === previousScrollHeight) {
        clearInterval(interval);

        // Step 2: Scroll back to the top to ensure top rows are loaded
        container.scrollTop = 0;
        setTimeout(() => {
          resolve();
        }, 300);
      } else {
        previousScrollHeight = container.scrollHeight;
        container.scrollTop = container.scrollHeight;
      }
    }, 200);
  });
}

*/

async function searchForID(targetID) {
  const container = findScrollableContainer();
  if (!container) {
    alert('Scrollable container not found');
    return null;
  }

  let rowFound = null;
  let previousScrollHeight = -1;
  
  while (!rowFound) {
    rowFound = searchInLoadedRows(targetID);

    if (rowFound) {
      rowFound.scrollIntoView({ behavior: 'smooth', block: 'center' });
      rowFound.classList.add('highlighted-row');
      return rowFound;
    }
    
    if (container.scrollHeight > container.clientHeight && previousScrollHeight !== container.scrollHeight) {
      previousScrollHeight = container.scrollHeight;
      
      container.scrollTop = container.scrollHeight;

      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      // nothing found
      break;
    }
  }

  alert(`Row with ID ${targetID} not found.`);
  return null;
}

function addSearchInterface() {
  const panelRegion = document.querySelector('.panel-region');
  
  if (!panelRegion) {
    console.error('Panel region not found');
    return;
  }

  // Check if search container already exists in the .panel-region
  let existingSearchContainer = document.querySelector('.search-container');
  if (existingSearchContainer) {
    return;
  }

  // Create the search container
  const searchContainer = document.createElement('div');
  searchContainer.classList.add('search-container');

  // Create input element for ID
  const searchInput = document.createElement('input');
  searchInput.type = 'number';
  searchInput.placeholder = 'Enter ID to search';
  searchInput.classList.add('modern-input');

  // Create search button
  const searchButton = document.createElement('button');
  searchButton.textContent = 'Search';
  searchButton.classList.add('modern-button');

  // Add event listener to search button
  searchButton.addEventListener('click', () => {
    const targetID = searchInput.value;
    if (targetID) {
      searchForID(targetID);
    } else {
      alert('Please enter a valid ID.');
    }
  });

  // Append input and button to search container
  searchContainer.appendChild(searchInput);
  searchContainer.appendChild(searchButton);

  // First, move the add-panel-data to the start if it exists
  const addPanelData = document.querySelector('.add-panel-data');
  if (addPanelData) {
    panelRegion.appendChild(addPanelData);
  }

  // Then append the search container as the second element
  panelRegion.appendChild(searchContainer);
}

const style = document.createElement('style');
style.textContent = `
/* Modern input styling */
.modern-input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 200px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
  margin-right: 10px;
}

.modern-input:focus {
  border-color: #007BFF;
}

/* Modern button styling */
.modern-button {
  padding: 10px 20px;
  line-height: 0px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.modern-button:hover {
  background-color: #0056b3;
}

.search-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

/* Highlighted row styling */
.highlighted-row {
  background-color: yellow !important;
}

/* Flexbox to align .add-panel-data and .search-container side by side */
.panel-region {
  display: flex;
  gap: 10px; /* Adds space between the elements */
}

.add-panel-data {
  flex-grow: 1; /* Takes up the space it needs */
}

.search-container {
  flex-shrink: 0; /* Keeps the search container fixed in size */
}
`;

document.head.appendChild(style);

window.addEventListener('load', addSearchInterface);

function processRows() {
  const rows = document.querySelectorAll('.grid-row');

  rows.forEach(row => {
    const statusElement = row.querySelector('.workitem-state-value');
    let statusText = '';

    if (statusElement) {
      statusText = statusElement.textContent.trim();
    }

    const specificDivElement = row.querySelector('div[role="gridcell"][style*="width: 300px;"]');
    let specificDivText = '';

    if (specificDivElement) {
      specificDivText = specificDivElement.textContent.trim();
    }

    const assignedToElement = row.querySelector('div[role="gridcell"][style*="width: 125px;"]');
    let assignedToText = '';

    if (assignedToElement) {
      assignedToText = assignedToElement.textContent.trim();
    }

    const tags = row.querySelectorAll('.tag-item .tag-box');
    let containsIFTag = false;

    tags.forEach(tag => {
      if (tag.textContent.trim().includes('IF')) {
        containsIFTag = true;
      }
    });

    if (statusText === 'Waiting') {
      const dateCells = row.querySelectorAll('div[role="gridcell"][style*="width: 120px;"]');
      if (dateCells.length >= 2) {
        const stateChangeDateText = dateCells[1].textContent.trim();

        if (stateChangeDateText && /^\d{2}\/\d{2}\/\d{4}/.test(stateChangeDateText)) {
          const [day, month, year] = stateChangeDateText.split(' ')[0].split('/').map(Number);
          const stateChangeDate = new Date(year, month - 1, day);
          const today = new Date();

          stateChangeDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);

          const daysWaiting = Math.floor((today - stateChangeDate) / (1000 * 60 * 60 * 24));

          if (!isNaN(daysWaiting)) {
            dateCells[1].textContent = `WAIT: ${daysWaiting}`;
          }
        }
      }
    }

    if (containsIFTag) {
      row.style.backgroundColor = '#F5B7B1';
    } else if (specificDivText.includes('3rd Tagessprint')) {
      row.style.backgroundColor = '#A9DFBF';
    } else if (assignedToText && !specificDivText.includes('3rd Tagessprint') && statusText != 'Waiting') {
      row.style.backgroundColor = '#D2B48C';
    } else if (statusText === 'Active') {
      row.style.backgroundColor = '#FFF9C4';
    } else if (statusText === 'Waiting') {
      row.style.backgroundColor = '#F5B7B1';
    } else if (statusText === 'Closed') {
      row.style.backgroundColor = '';
    } else {
      // Do nothing
    }
  });
}

processRows();

const observer = new MutationObserver((mutations) => {
  let hasChanges = false;

  mutations.forEach(() => {
    hasChanges = true;
  });

  if (hasChanges) {
    observer.disconnect();
    processRows();
    addSearchInterface();
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});