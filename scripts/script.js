// Global Variables
let items = [];
let totalPrice = 0;
let editIndex = -1;
let modalCallback = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

// Initialize Application
function initializeApp() {
  // File input handling
  document.getElementById('image').addEventListener('change', handleFileSelect);
  
  // Close modal when clicking outside
  document.getElementById('modalOverlay').addEventListener('click', handleModalOverlayClick);
  
  // Escape key to close modal
  document.addEventListener('keydown', handleKeyDown);
  
  // Initialize render
  renderItems();
}

// File Selection Handler
function handleFileSelect(e) {
  const label = document.getElementById('fileLabel');
  if (e.target.files.length > 0) {
    label.textContent = `${e.target.files[0].name}`;
    label.classList.add('has-file');
  } else {
    label.textContent = 'Choose Image';
    label.classList.remove('has-file');
  }
}

// Modal Overlay Click Handler
function handleModalOverlayClick(e) {
  if (e.target === document.getElementById('modalOverlay')) {
    closeModal();
  }
}

// Keyboard Event Handler
function handleKeyDown(e) {
  if (e.key === 'Escape') {
    closeModal();
  }
}

// Utility Functions
function sanitize(input) {
  const div = document.createElement('div');
  div.innerText = input;
  return div.innerHTML;
}

function getCurrencySymbol() {
  const currency = document.getElementById('currency').value;
  const symbols = {
    "USD": "$",
    "EUR": "€", 
    "IDR": "Rp",
    "JPY": "¥",
    "GBP": "£"
  };
  return symbols[currency] || "Rp";
}

function formatCurrency(amount) {
  const symbol = getCurrencySymbol();
  const currency = document.getElementById('currency').value;
  
  if (currency === 'IDR') {
    return `${symbol}${amount.toLocaleString('id-ID')}`;
  } else if (currency === 'JPY') {
    return `${symbol}${Math.round(amount).toLocaleString('ja-JP')}`;
  } else {
    return `${symbol}${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  }
}

// Form Management
function resetForm() {
  document.getElementById('itemName').value = '';
  document.getElementById('price').value = '';
  document.getElementById('quantity').value = '';
  document.getElementById('image').value = '';
  document.getElementById('fileLabel').textContent = 'Choose Image';
  document.getElementById('fileLabel').classList.remove('has-file');
  editIndex = -1;
  document.getElementById('btnAdd').innerHTML = "Add Item";
  document.getElementById('btnCancel').style.display = "none";
}

// Render Items
function renderItems() {
  const output = document.getElementById('output');
  const emptyState = document.getElementById('emptyState');
  
  if (items.length === 0) {
    output.innerHTML = '';
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    output.innerHTML = items.map((item, index) => `
      <tr class="${index === editIndex ? 'editing' : ''}">
        <td>
          <img src="${item.image}" class="item-image" alt="${item.name}" 
               style="width:40px; height:40px; cursor:pointer;" 
               onclick="viewFullImage('${encodeURIComponent(item.image)}')">
        </td>
        <td>${item.name}</td>
        <td>${formatCurrency(item.price)}</td>
        <td>${item.quantity.toLocaleString()}</td>
        <td>${formatCurrency(item.price * item.quantity)}</td>
        <td>
          <button class="btn btn-secondary btn-small" onclick="editItem(${index})">Edit</button>
          <button class="btn btn-danger btn-small" onclick="deleteItem(${index})">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  calculateTotal();
  updateItemCounts();
}

// Calculate Total
function calculateTotal() {
  totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  let taxRate = parseFloat(document.getElementById('taxRate').value);
  if (isNaN(taxRate) || taxRate < 0) {
    taxRate = 0;
    document.getElementById('taxRate').value = 0;
  }

  const tax = totalPrice * (taxRate / 100);
  const finalTotal = totalPrice + tax;

  document.getElementById('total').innerHTML = `
    <div class="total-line">
      <span>Subtotal:</span>
      <span>${formatCurrency(totalPrice)}</span>
    </div>
    <div class="total-line">
      <span>Tax (${taxRate}%):</span>
      <span>${formatCurrency(tax)}</span>
    </div>
    <div class="total-line final">
      <span>Total:</span>
      <span>${formatCurrency(finalTotal)}</span>
    </div>
  `;
}

// Update Item Counts
function updateItemCounts() {
  document.getElementById('itemTypesCount').textContent = items.length;
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('totalItemsCount').textContent = totalItemsCount.toLocaleString();
}

// Modal Functions
function showModal(title, message, type = 'warning', callback = null) {
  const modal = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalIcon = document.getElementById('modalIcon');
  const confirmBtn = document.getElementById('modalConfirmBtn');

  modalTitle.textContent = title;
  modalBody.textContent = message;
  modalCallback = callback;

  // Set icon and style based on type
  modalIcon.className = `modal-icon ${type}`;
  if (type === 'error') {
    modalIcon.textContent = '❌';
    confirmBtn.textContent = 'OK';
    confirmBtn.className = 'btn btn-danger';
  } else if (type === 'success') {
    modalIcon.textContent = '✅';
    confirmBtn.textContent = 'OK';
    confirmBtn.className = 'btn btn-primary';
  } else {
    modalIcon.textContent = '❗';
    confirmBtn.textContent = 'Confirm';
    confirmBtn.className = 'btn btn-danger';
  }

  modal.classList.add('show');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
  modalCallback = null;
}

function confirmAction() {
  if (modalCallback) {
    modalCallback();
  }
  closeModal();
}

// Validation Functions
function validateItemName(itemName) {
  if (!itemName) {
    showModal('Validation Error', 'Item name cannot be empty', 'error');
    return false;
  }
  return true;
}

function validatePrice(price) {
  if (isNaN(price) || price <= 0) {
    showModal('Validation Error', 'Price must be greater than 0', 'error');
    return false;
  }
  return true;
}

function validateQuantity(quantity) {
  if (isNaN(quantity) || quantity <= 0) {
    showModal('Validation Error', 'Quantity must be greater than 0', 'error');
    return false;
  }
  return true;
}

function validateImageFile(imageFile, isRequired = false) {
  if (isRequired && !imageFile) {
    showModal('Validation Error', 'You must upload an image', 'error');
    return false;
  }
  
  if (imageFile) {
    const ext = imageFile.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      showModal('Validation Error', 'Only image files (.jpg, .jpeg, .png, .gif, .webp) are allowed', 'error');
      return false;
    }
  }
  
  return true;
}

// CRUD Operations
function addItem() {
  const itemName = sanitize(document.getElementById('itemName').value.trim());
  const price = parseFloat(document.getElementById('price').value);
  const quantity = parseInt(document.getElementById('quantity').value);
  const imageFile = document.getElementById('image').files[0];

  // Validation
  if (!validateItemName(itemName)) return;
  if (!validatePrice(price)) return;
  if (!validateQuantity(quantity)) return;

  let imageURL;

  if (editIndex === -1) {
    // Adding new item
    if (!validateImageFile(imageFile, true)) return;
    
    imageURL = URL.createObjectURL(imageFile);
    items.push({ name: itemName, price: price, quantity: quantity, image: imageURL });
    showModal('Success', 'Item added successfully!', 'success');
  } else {
    // Updating existing item
    if (!validateImageFile(imageFile, false)) return;
    
    if (imageFile) {
      imageURL = URL.createObjectURL(imageFile);
    } else {
      imageURL = items[editIndex].image;
    }

    items[editIndex] = { name: itemName, price: price, quantity: quantity, image: imageURL };
    showModal('Success', 'Item updated successfully!', 'success');
  }

  resetForm();
  renderItems();
}

function editItem(index) {
  const item = items[index];

  document.getElementById('itemName').value = item.name;
  document.getElementById('price').value = item.price;
  document.getElementById('quantity').value = item.quantity;

  editIndex = index;
  document.getElementById('btnAdd').innerHTML = "Update Item";
  document.getElementById('btnCancel').style.display = "inline-block";
  renderItems();
  
  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });

  renderItems();
}

function cancelEdit() {
  resetForm();
  renderItems();
}

function deleteItem(index) {
  const item = items[index];
  showModal(
    'Delete Item',
    `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
    'warning',
    () => {
      items.splice(index, 1);
      renderItems();
      resetForm();
    }
  );
}

function resetData() {
  showModal(
    'Reset All Data',
    'Are you sure you want to clear all items? This will permanently delete all your data.',
    'warning',
    () => {
      items = [];
      renderItems();
      resetForm();
    }
  );
}
