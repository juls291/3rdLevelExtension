// Helper function to find the scrollable container
function findScrollableContainer() {
  const rows = document.querySelectorAll('.grid-row');
  
  // Traverse the parents of one of the rows to find the scrollable container
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

// Search in currently loaded rows for the target ID
function searchInLoadedRows(targetID) {
  const rows = document.querySelectorAll('.grid-row');
  
  for (let row of rows) {
    const idCell = row.querySelector('div[role="gridcell"][style*="width: 70px;"]');
    
    if (idCell && idCell.textContent.trim() === String(targetID)) {
      return row; // Return the found row
    }
  }
  
  return null; // Return null if not found in current rows
}

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

// Scroll and search for the target ID
async function searchForID(targetID) {
  const container = findScrollableContainer();
  if (!container) {
    alert('Scrollable container not found');
    return null;
  }

  let rowFound = null;
  let previousScrollHeight = -1;
  
  // Keep scrolling until we either find the row or can't scroll anymore
  while (!rowFound) {
    rowFound = searchInLoadedRows(targetID);

    if (rowFound) {
      // Scroll into view and highlight the row
      rowFound.scrollIntoView({ behavior: 'smooth', block: 'center' });
      rowFound.classList.add('highlighted-row'); // Highlight the found row
      return rowFound;
    }
    
    // Check if scrolling further is possible (to load more rows)
    if (container.scrollHeight > container.clientHeight && previousScrollHeight !== container.scrollHeight) {
      previousScrollHeight = container.scrollHeight;
      
      // Scroll down to load the next batch of rows
      container.scrollTop = container.scrollHeight;

      // Wait for new rows to load (adjust the timeout based on load speed)
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      // If we can't scroll further, we've reached the bottom
      break;
    }
  }

  // If we exit the loop without finding the row, alert the user
  alert(`Row with ID ${targetID} not found.`);
  return null;
}

// Add search button and input box to the page
function addSearchInterface() {
  const panel = document.querySelector('.add-panel-data'); // Place this next to the existing UI panel
  
  if (!panel) {
    console.error('Panel to add search box not found');
    return;
  }

  // Check if search interface already exists
  let existingSearchContainer = document.querySelector('.search-container');
  if (existingSearchContainer) {
    return; // Exit if the search interface is already present
  }

  // Create a container for the search UI
  const searchContainer = document.createElement('div');
  searchContainer.classList.add('search-container');
  searchContainer.style.marginTop = '10px';
  
  // Create an input field
  const searchInput = document.createElement('input');
  searchInput.type = 'number';
  searchInput.placeholder = 'Enter ID to search';
  searchInput.style.marginRight = '10px';
  
  // Create a search button
  const searchButton = document.createElement('button');
  searchButton.textContent = 'Search';
  
  // Attach event listener to the search button
  searchButton.addEventListener('click', () => {
    const targetID = searchInput.value;
    if (targetID) {
      searchForID(targetID);
    } else {
      alert('Please enter a valid ID.');
    }
  });

  // Append input and button to the container
  searchContainer.appendChild(searchInput);
  searchContainer.appendChild(searchButton);
  
  // Add the search container to the existing panel
  panel.appendChild(searchContainer);
}

// Add CSS for highlighting rows
const style = document.createElement('style');
style.textContent = `
  .highlighted-row {
    background-color: yellow !important;
  }
  .search-container {
    margin-top: 10px;
  }
`;
document.head.appendChild(style);

// Call the function to add the search interface on page load
window.addEventListener('load', addSearchInterface);

// MutationObserver to apply existing rules and ensure the search interface remains
function processRows() {
  const rows = document.querySelectorAll('.grid-row');

  rows.forEach(row => {
    // Your existing logic to process rows
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
      row.style.backgroundColor = '#F5B7B1'; // Light red/pink
    } else if (specificDivText.includes('3rd Tagessprint')) {
      row.style.backgroundColor = '#A9DFBF'; // Green for Tagessprint
    } else if (assignedToText && !specificDivText.includes('3rd Tagessprint') && statusText != 'Waiting') {
      row.style.backgroundColor = '#D2B48C'; // Brown for assigned items
    } else if (statusText === 'Active') {
      row.style.backgroundColor = '#FFF9C4'; // Yellow for active
    } else if (statusText === 'Waiting') {
      row.style.backgroundColor = '#F5B7B1'; // Light red/pink for waiting
    } else if (statusText === 'Closed') {
      row.style.backgroundColor = ''; // Default color for closed
    } else {
      // Do nothing
    }
  });
}

// Run the function initially
processRows();

// Observe changes to the document body for dynamic updates
const observer = new MutationObserver((mutations) => {
  let hasChanges = false;

  mutations.forEach(() => {
    hasChanges = true;
  });

  if (hasChanges) {
    observer.disconnect();  // Temporarily stop observing to avoid recursive calls
    processRows();          // Re-apply the processing logic
    addSearchInterface();  // Re-add the search interface if it was removed
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });                      // Restart observing
  }
});

// Start observing the document for changes
observer.observe(document.body, {
  childList: true, // Monitor direct children
  subtree: true    // Monitor all descendants
});