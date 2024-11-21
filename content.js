function calculateDaysDifference(dateString) {
  if (!dateString || !/^\d{2}\/\d{2}\/\d{4}/.test(dateString)) return null;

  const [day, month, year] = dateString.split(' ')[0].split('/').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();

  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return Math.floor((today - date) / (1000 * 60 * 60 * 24));
}

function getElementText(row, selector) {
  const element = row.querySelector(selector);
  return element ? element.textContent.trim() : '';
}

function updateCellWithDays(cell, days) {
  if (cell && days !== null) {
    cell.innerHTML = `${days} Tage`;
  }
}

function processRows() {
  const rows = document.querySelectorAll('.grid-row');

  rows.forEach(row => {
    const statusText = getElementText(row, '.workitem-state-value');

    const stateChangeDateText = getElementText(row, 'div.grid-cell-contents-container');
    const stateChangeDays = calculateDaysDifference(stateChangeDateText);
    updateCellWithDays(stateChangeDateText, stateChangeDays);

    const activeDateText = Array.from(row.querySelectorAll('div.grid-cell'))
      .find(cell => /^\d{2}\/\d{2}\/\d{4}/.test(cell.textContent.trim()));

    const activeDateDays = calculateDaysDifference(activeDateText?.textContent.trim());
    updateCellWithDays(activeDateText, activeDateDays);

    const assignedToText = getElementText(row, 'div.identity-view-control span');

    const specificDivText = Array.from(row.querySelectorAll('div[role="gridcell"]'))
      .find(cell => cell.textContent.trim().toLowerCase().includes('backlog'))?.textContent.trim().toLowerCase() || '';

    let backgroundColor = '';

    if (specificDivText.includes('update')) {
      backgroundColor = '#FDBA74';
    }
    else if (statusText.toLowerCase() === 'closed') {
      backgroundColor = '#A7F3D0';
    }
    else if (statusText.toLowerCase() === 'waiting') {
      backgroundColor = '#FCA5A5';
    }
    else if (statusText.toLowerCase() === 'resolved' || statusText.toLowerCase() === 'developed') {
      backgroundColor = '#D1D5DB';
    }
    else if (specificDivText.includes('flight')) {
      backgroundColor = assignedToText ? '#93C5FD' : '#FEF3C7';
    }
    else if (specificDivText.includes('backlog')) {
      backgroundColor = assignedToText ? '#D2B48C' : '';
    }

    if (backgroundColor) {
      row.style.backgroundColor = backgroundColor;
    }
  });
}

const style = document.createElement('style');
style.textContent = `
/* Highlighted row styling */
.highlighted-row 
{
  background-color: yellow !important;
}

.panel-region 
{
  display: flex;
  gap: 10px;
}

.add-panel-data 
{
  flex-grow: 1;
}
`;

document.head.appendChild(style);

window.addEventListener('load', processRows);

const observer = new MutationObserver(() => {
  processRows();
});

observer.observe(document.body,
  {
    childList: true,
    subtree: true
  });
