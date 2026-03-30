/**
 * Renders the list of users in the user list container
 * @param {Array} users - Array of user objects
 * @param {HTMLElement} listElement - The ul element for user list
 */
function renderUserList(users, listElement) {
  // Clear the user list container before rendering
  listElement.innerHTML = '';

  // Loop through the users array and create list items
  users.forEach((user, index) => {
    const listItem = document.createElement('li');
    listItem.innerText = user.user.lastname + ', ' + user.user.firstname;
    listItem.setAttribute('data-id', user.id); // Add data-id attribute for the user ID
    listItem.setAttribute('data-index', index); // Add data-index for the array index
    listElement.appendChild(listItem);
  });
}

/**
 * Handles the click event on the user list
 * @param {Event} event - The click event
 * @param {Array} users - Array of user objects
 * @param {Array} stocksData - Array of stock data
 * @param {HTMLElement} listElement - The ul element
 * @param {HTMLElement} stockListElement - The portfolio container
 * @param {Object} formInputs - Object with form input elements
 */
function handleUserClick(event, users, stocksData, listElement, stockListElement, formInputs) {
  const clickedItem = event.target;
  if (clickedItem.tagName !== 'LI') return; // Only handle clicks on li elements

  const userId = clickedItem.getAttribute('data-id');
  const user = users.find(u => u.id == userId);

  if (user) {
    selectedUser = user; // Store the selected user
    highlightUser(clickedItem, listElement); // Highlight the selected user
    renderPortfolio(user.portfolio, stocksData, stockListElement); // Display the user's portfolio
    populateForm(user, formInputs); // Fill the form with the user's data
  }
}

/**
 * Highlights the selected user and removes highlight from others
 * @param {HTMLElement} selectedItem - The selected list item
 * @param {HTMLElement} listElement - The ul element
 */
function highlightUser(selectedItem, listElement) {
  // Remove 'selected' class from all list items
  const allItems = listElement.querySelectorAll('li');
  allItems.forEach(item => item.classList.remove('selected'));

  // Add 'selected' class to the clicked item
  selectedItem.classList.add('selected');
}

/**
 * Renders the user's portfolio in the stock list container
 * @param {Array} portfolio - Array of portfolio objects
 * @param {Array} stocksData - Array of stock data
 * @param {HTMLElement} stockListElement - The portfolio container
 */
function renderPortfolio(portfolio, stocksData, stockListElement) {
  // Clear the portfolio list (but keep the headers)
  const headers = stockListElement.querySelectorAll('h3');
  stockListElement.innerHTML = '';
  headers.forEach(header => stockListElement.appendChild(header)); // Re-add headers

  // Loop through portfolio and create rows
  portfolio.forEach(holding => {
    const stock = stocksData.find(s => s.symbol === holding.symbol);
    const stockName = stock ? stock.name : 'Unknown Stock';

    const row = document.createElement('div');
    row.classList.add('portfolio-row');

    const symbolDiv = document.createElement('div');
    symbolDiv.innerText = `${stockName} (${holding.symbol})`; // Display stock name and symbol

    const sharesDiv = document.createElement('div');
    sharesDiv.innerText = holding.owned; // Display number of shares

    const actionsDiv = document.createElement('div');
    // Placeholder for actions (e.g., buttons for future functionality)
    actionsDiv.innerText = '';

    row.appendChild(symbolDiv);
    row.appendChild(sharesDiv);
    row.appendChild(actionsDiv);

    // Add click event to the row to show stock details
    row.addEventListener('click', () => showStockDetails(holding.symbol, stocksData));

    stockListElement.appendChild(row);
  });
}

/**
 * Shows the details of a selected stock in the stock details section
 * @param {string} symbol - The stock symbol
 * @param {Array} stocksData - Array of stock data
 */
function showStockDetails(symbol, stocksData) {
  const stock = stocksData.find(s => s.symbol === symbol);
  if (!stock) return;

  // Update the stock details elements
  const logoImg = document.getElementById('logo');
  logoImg.src = ''; // Placeholder for logo (no images provided)

  const stockNameP = document.getElementById('stockName');
  stockNameP.innerText = stock.name;

  const stockSectorP = document.getElementById('stockSector');
  stockSectorP.innerText = stock.sector;

  const stockIndustryP = document.getElementById('stockIndustry');
  stockIndustryP.innerText = stock.subIndustry; // Using subIndustry as industry

  const stockAddressP = document.getElementById('stockAddress');
  stockAddressP.innerText = stock.address;

/**
 * Populates the form with the user's data
 * @param {Object} user - The user object
 * @param {Object} formInputs - Object with form input elements
 */
function populateForm(user, formInputs) {
  formInputs.userId.value = user.id;
  formInputs.firstname.value = user.user.firstname;
  formInputs.lastname.value = user.user.lastname;
  formInputs.address.value = user.user.address;
  formInputs.city.value = user.user.city;
  formInputs.email.value = user.user.email;
}

/**
 * Handles the save button click to update the selected user's data
 * @param {Object} formInputs - Object with form input elements
 * @param {HTMLElement} listElement - The ul element
 */
function handleSave(formInputs, listElement) {
  if (!selectedUser) return; // No user selected

  // Read values from form inputs
  selectedUser.user.firstname = formInputs.firstname.value;
  selectedUser.user.lastname = formInputs.lastname.value;
  selectedUser.user.address = formInputs.address.value;
  selectedUser.user.city = formInputs.city.value;
  selectedUser.user.email = formInputs.email.value;

  // Re-render the user list to reflect changes (e.g., updated name)
  renderUserList(userData, listElement);

  // Keep the selected user active by re-highlighting
  const selectedLi = listElement.querySelector(`li[data-id="${selectedUser.id}"]`);
  if (selectedLi) {
    highlightUser(selectedLi, listElement);
  }

  // Displayed data (portfolio and form) remains updated since selectedUser is modified
}

/**
 * Handles the delete button click to remove the selected user
 * @param {Array} users - Array of user objects
 * @param {HTMLElement} listElement - The ul element
 * @param {HTMLElement} stockListElement - The portfolio container
 * @param {Object} formInputs - Object with form input elements
 */
function handleDelete(users, listElement, stockListElement, formInputs) {
  if (!selectedUser) return; // No user selected

  // Remove selected user from users array
  const index = users.findIndex(user => user.id === selectedUser.id);
  if (index !== -1) {
    users.splice(index, 1);
  }

  // Clear selected user
  selectedUser = null;

  // Re-render user list
  renderUserList(users, listElement);

  // Clear portfolio
  const headers = stockListElement.querySelectorAll('h3');
  stockListElement.innerHTML = '';
  headers.forEach(header => stockListElement.appendChild(header)); // Re-add headers, but no rows

  // Clear stock details
  const logoImg = document.getElementById('logo');
  logoImg.src = '';
  document.getElementById('stockName').innerText = '';
  document.getElementById('stockSector').innerText = '';
  document.getElementById('stockIndustry').innerText = '';
  document.getElementById('stockAddress').innerText = '';

  // Clear form inputs
  formInputs.userId.value = '';
  formInputs.firstname.value = '';
  formInputs.lastname.value = '';
  formInputs.address.value = '';
  formInputs.city.value = '';
  formInputs.email.value = '';
}

let userData;
let selectedUser = null;

document.addEventListener('DOMContentLoaded', () => {
  // Parse the JSON data from the included script files
  userData = JSON.parse(userContent);
  const stocksData = JSON.parse(stockContent);

  // Select and store reference to the user list container (ul element where user names are displayed)
  const userList = document.querySelector('.user-list');

  // Select and store reference to the stock list container (div where portfolio holdings are shown)
  const stockList = document.querySelector('.portfolio-list');

  // Select and store reference to the stock details container (div where selected stock info is displayed)
  const stockDetails = document.querySelector('.stock-form');

  // Select and store references to user form inputs
  const formInputs = {
    userId: document.getElementById('userID'),
    firstname: document.getElementById('firstname'),
    lastname: document.getElementById('lastname'),
    address: document.getElementById('address'),
    city: document.getElementById('city'),
    email: document.getElementById('email')
  };

  // Select and store reference to the save button (button to save user changes)
  const saveButton = document.getElementById('btnSave');

  // Select and store reference to the delete button (button to delete a user)
  const deleteButton = document.getElementById('btnDelete');

  // Add event listeners
  userList.addEventListener('click', (event) => handleUserClick(event, userData, stocksData, userList, stockList, formInputs));
  saveButton.addEventListener('click', () => handleSave(formInputs, userList));
  deleteButton.addEventListener('click', () => handleDelete(userData, userList, stockList, formInputs));

  // Render the user list on page load
  renderUserList(userData, userList);
});

