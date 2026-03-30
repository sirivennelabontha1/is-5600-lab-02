// Global state
let userData = [];
let stocksData = [];
let selectedUser = null;

/**
 * Render Users List
 */
function renderUserList(users, listElement) {
  listElement.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = `${user.lastname}, ${user.firstname}`;
    li.setAttribute('data-id', user.id);
    listElement.appendChild(li);
  });
}

/**
 * Highlight selected user
 */
function highlightUser(selectedItem, listElement) {
  const items = listElement.querySelectorAll('li');
  items.forEach(i => i.classList.remove('selected'));
  selectedItem.classList.add('selected');
}

/**
 * Populate Form
 */
function populateForm(user, formInputs) {
  formInputs.userID.value = user.id || '';
  formInputs.firstname.value = user.firstname || '';
  formInputs.lastname.value = user.lastname || '';
  formInputs.address.value = user.address || '';
  formInputs.city.value = user.city || '';
  formInputs.email.value = user.email || '';
}

/**
 * Render Portfolio (FINAL FIXED)
 */
function renderPortfolio(portfolio, stocksData, container, detailsElements) {
  // Reset layout properly
  container.innerHTML = `
    <div>Symbol</div>
    <div># Shares</div>
    <div>Actions</div>
  `;

  if (!portfolio || portfolio.length === 0) return;

  portfolio.forEach((holding) => {
    const stock = stocksData.find(s => s.symbol === holding.symbol);

    // SYMBOL
    const symbol = document.createElement('div');
    symbol.innerText = holding.symbol;
    symbol.style.cursor = 'pointer';

    // SHARES
    const shares = document.createElement('div');
    shares.innerText = holding.shares || holding.owned || 0;

    // ACTION
    const action = document.createElement('div');
    const btn = document.createElement('button');
    btn.innerText = 'View';

    // CLICK EVENTS (both work)
    symbol.addEventListener('click', () => {
      showStockDetails(holding.symbol, stocksData, detailsElements);
    });

    btn.addEventListener('click', () => {
      showStockDetails(holding.symbol, stocksData, detailsElements);
    });

    action.appendChild(btn);

    container.appendChild(symbol);
    container.appendChild(shares);
    container.appendChild(action);
  });
}

/**
 * Show Stock Details
 */
function showStockDetails(symbol, stocksData, detailsElements) {
  const stock = stocksData.find(s => s.symbol === symbol);
  if (!stock) return;

  detailsElements.stockName.innerText = stock.name || '';
  detailsElements.stockSector.innerText = stock.sector || '';
  detailsElements.stockIndustry.innerText = stock.subIndustry || '';
  detailsElements.stockAddress.innerText = stock.address || '';
}

/**
 * Save User
 */
function handleSave(formInputs, listElement) {
  if (!selectedUser) return;

  selectedUser.firstname = formInputs.firstname.value;
  selectedUser.lastname = formInputs.lastname.value;
  selectedUser.address = formInputs.address.value;
  selectedUser.city = formInputs.city.value;
  selectedUser.email = formInputs.email.value;

  renderUserList(userData, listElement);

  const selectedLi = listElement.querySelector(`li[data-id="${selectedUser.id}"]`);
  if (selectedLi) highlightUser(selectedLi, listElement);
}

/**
 * Delete User
 */
function handleDelete(users, listElement, portfolioContainer, formInputs, detailsElements) {
  if (!selectedUser) return;

  const index = users.findIndex(u => u.id === selectedUser.id);
  if (index !== -1) users.splice(index, 1);

  selectedUser = null;

  renderUserList(users, listElement);

  // Clear portfolio
  portfolioContainer.innerHTML = `
    <div>Symbol</div>
    <div># Shares</div>
    <div>Actions</div>
  `;

  // Clear details
  detailsElements.stockName.innerText = '';
  detailsElements.stockSector.innerText = '';
  detailsElements.stockIndustry.innerText = '';
  detailsElements.stockAddress.innerText = '';

  // Clear form
  formInputs.userID.value = '';
  formInputs.firstname.value = '';
  formInputs.lastname.value = '';
  formInputs.address.value = '';
  formInputs.city.value = '';
  formInputs.email.value = '';
}

/**
 * INIT APP
 */
document.addEventListener('DOMContentLoaded', () => {

  const usersContainer = document.querySelector('.user-list');
  const portfolioContainer = document.querySelector('.portfolio-list');
  const formElement = document.querySelector('.userEntry');

  const formInputs = {
    userID: document.getElementById('userID'),
    firstname: document.getElementById('firstname'),
    lastname: document.getElementById('lastname'),
    address: document.getElementById('address'),
    city: document.getElementById('city'),
    email: document.getElementById('email')
  };

  const detailsElements = {
    stockName: document.getElementById('stockName'),
    stockSector: document.getElementById('stockSector'),
    stockIndustry: document.getElementById('stockIndustry'),
    stockAddress: document.getElementById('stockAddress')
  };

  const saveBtn = document.getElementById('btnSave');
  const deleteBtn = document.getElementById('btnDelete');

  // Load data
  Promise.all([
    fetch('/data/users.js').then(r => r.text()),
    fetch('/data/stocks-complete.js').then(r => r.text())
  ]).then(([userText, stockText]) => {

    const userMatch = userText.match(/const userContent = `([\s\S]*)`/);
    const stockMatch = stockText.match(/const stockContent = `([\s\S]*)`/);

    if (userMatch) {
      const rawUsers = JSON.parse(userMatch[1]);
      userData = rawUsers.map(u => ({
        id: u.id,
        firstname: u.user.firstname,
        lastname: u.user.lastname,
        email: u.user.email,
        address: u.user.address,
        city: u.user.city,
        portfolio: u.portfolio
      }));
    }

    if (stockMatch) {
      stocksData = JSON.parse(stockMatch[1]);
    }

    renderUserList(userData, usersContainer);

    // CLICK USER
    usersContainer.addEventListener('click', (event) => {
      const li = event.target.closest('li');
      if (!li) return;

      const userId = parseInt(li.getAttribute('data-id'));
      const user = userData.find(u => u.id == userId);
      if (!user) return;

      selectedUser = user;

      highlightUser(li, usersContainer);
      populateForm(user, formInputs);
      renderPortfolio(user.portfolio, stocksData, portfolioContainer, detailsElements);
    });

    // SAVE
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleSave(formInputs, usersContainer);
    });

    // DELETE
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleDelete(userData, usersContainer, portfolioContainer, formInputs, detailsElements);
    });

    formElement.addEventListener('submit', e => e.preventDefault());

  });
});