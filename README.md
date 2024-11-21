# Row Processing Extension

---

## End-User Guide

### What This Extension Does

This extension colors the items in the iteration "TL\3rd Level Backlog" to make managing them more easily.

### Key Features

1. **Date Calculations**:
   - Displays the number of days since the "State Change Date."
   - Displays the number of days since the "Activated Date."

2. **Color-Coded Rows**:
   - **Orange**: The item is closed and is either awaiting an update or confirmation by the customer.
   - **Green**: The item is closed and needs verification.
   - **Red**: The item is waiting. 
   - **Grey**: The item is either developed or resolved and might need investigation.
   - **Blue**: The item is currently being worked on in the iteration "flight".
   - **Beige**: Someone worked on the item but unassigned themselves; it needs investigation.

3. **Dynamic Updates**:
   - Updates row calculations and colors dynamically whenever changes are detected on the page.

### How to Use

- **Install the Extension**: To install the extension you need to enable the developer mode in the extension options and load the unpacked extension. Once installed, it will automatically process the rows in the table.

---

## Technical Guide

### Overview

This extension uses JavaScript to dynamically process rows in a grid-like structure on the page. It identifies key elements using selectors and applies custom logic to enhance their display.

### How It Works

1. **Row Selection**:
   - The extension identifies all rows (`.grid-row`) in the table.

2. **Date Parsing and Calculations**:
   - For each row, the script extracts dates (like "State Change Date" and "Activated Date") and calculates how many days have passed since those dates using JavaScript's `Date` object.

3. **Color Coding**:
   - The extension analyzes specific content within rows (e.g., statuses, "Flight," or "Backlog" mentions) to determine a background color.
   - Color coding is applied by setting the `style.backgroundColor` property for each row.

4. **Dynamic Updates**:
   - A **MutationObserver** watches for changes in the page's structure and reruns the processing logic to ensure updates are reflected.

5. **Custom Styling**:
   - Adds custom CSS to improve the display of rows, panels, and other elements.

### How to Modify

- **Change Color Logic**:
  - Edit the `backgroundColor` assignment logic in the `processRows()` function.

- **Add New Features**:
  - Add new calculations by defining a helper function (e.g., for additional date columns) and calling it in `processRows()`.

- **Customize Element Selection**:
  - Modify the `getElementText()` function or update the selectors used in `processRows()` to target specific elements more precisely.

### Key Code Components

- **`calculateDaysDifference(dateString)`**:
  - Handles date difference calculation in a reusable way.
- **`getElementText(row, selector)`**:
  - Extracts text content from an element using a given CSS selector.
- **`updateCellWithDays(cell, days)`**:
  - Updates a table cell with the calculated days.

### Dynamic Behavior

- **MutationObserver**:
  - Listens for DOM changes and triggers the processing logic to ensure the table remains updated.

### Dependencies

- Pure JavaScript; no external libraries are required.

---

Feel free to adapt the script logic or enhance it with additional features based on your requirements!