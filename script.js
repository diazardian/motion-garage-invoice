// Data storage
let invoiceData = JSON.parse(localStorage.getItem('invoiceData')) || [];

// Alert Functions
// Queue system for multiple alerts
let alertQueue = [];
let currentAlert = null;

function showAlert(type, message, duration = 3000) {
    const alertId = type === 'success' ? 'alert' : 
                   type === 'error' ? 'alertError' : 
                   type === 'export' ? 'alertExport' : 'alert';
    
    // Add to queue
    alertQueue.push({ type, message, duration, alertId });
    
    // Process queue if no current alert
    if (!currentAlert) {
        processAlertQueue();
    }
}

function processAlertQueue() {
    if (alertQueue.length === 0) {
        currentAlert = null;
        return;
    }
    
    const { type, message, duration, alertId } = alertQueue.shift();
    currentAlert = alertId;
    
    const alertElement = document.getElementById(alertId);
    
    if (!alertElement) {
        console.error(`Alert element with ID ${alertId} not found`);
        processAlertQueue(); // Process next in queue
        return;
    }
    
    // Update message content
    const messageContent = alertElement.querySelector('strong').nextSibling;
    messageContent.textContent = ` ${message}`;
    
    // Show alert
    alertElement.style.display = 'block';
    alertElement.classList.add('show');
    
    // Auto hide after duration
    setTimeout(() => {
        hideAlertWithAnimation(alertId);
        setTimeout(processAlertQueue, 300); // Process next after animation
    }, duration);
}

function hideAlertWithAnimation(alertId) {
    const alertElement = document.getElementById(alertId);
    if (alertElement) {
        alertElement.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            alertElement.style.display = 'none';
            alertElement.classList.remove('show');
            alertElement.style.animation = '';
        }, 300);
    }
}

function hideAlert(alertId) {
    const alertElement = document.getElementById(alertId);
    if (alertElement) {
        alertElement.style.display = 'none';
        alertElement.classList.remove('show');
    }
}

function showSuccessAlert(message, duration = 3000) {
    showAlert('success', message, duration);
}

function showErrorAlert(message, duration = 5000) {
    showAlert('error', message, duration);
}

function showExportAlert(message, duration = 3000) {
    showAlert('export', message, duration);
}

// Enhanced showSuccessMessage function to use both old and new alert systems
function showSuccessMessage(message) {
    // Use the new alert system
    showSuccessAlert(message);
    
    // Keep the old floating message for backward compatibility
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message show';
    messageDiv.textContent = message;
    
    const formContainer = document.querySelector('.form-container');
    formContainer.insertBefore(messageDiv, formContainer.firstChild);
    
    setTimeout(() => {
        messageDiv.classList.remove('show');
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, 3000);
}

// Enhanced error handling function
function showErrorMessage(message) {
    showErrorAlert(message);
    
    // Also show in console for debugging
    console.error('Error:', message);
}

// DOM elements
const form = document.getElementById('invoiceForm');
const dataTable = document.getElementById('dataTable');
const csvOutput = document.getElementById('csvOutput');
const exportBtn = document.getElementById('exportBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const deleteAllBtn = document.getElementById('deleteAllBtn');

// Pengerjaan elements
let pengerjaanSelect, pengerjaanTextarea, addPengerjaanBtn, clearPengerjaanBtn, totalHargaSpan, itemQuantityInput, selectedItemsDiv, searchInput, clearSearchBtn;

// Initialize pengerjaan elements
function initializePengerjaanElements() {
    console.log('Initializing pengerjaan elements...');
    
    pengerjaanSelect = document.getElementById('pengerjaanSelect');
    pengerjaanTextarea = document.getElementById('pengerjaan');
    addPengerjaanBtn = document.getElementById('addPengerjaan');
    clearPengerjaanBtn = document.getElementById('clearPengerjaan');
    totalHargaSpan = document.getElementById('totalHarga');
    itemQuantityInput = document.getElementById('itemQuantity');
    selectedItemsDiv = document.getElementById('selectedItems');
    searchInput = document.getElementById('searchPengerjaan');
    clearSearchBtn = document.getElementById('clearSearch');
    
    // Log which elements were found
    console.log('Elements found:');
    console.log('- pengerjaanSelect:', !!pengerjaanSelect);
    console.log('- addPengerjaanBtn:', !!addPengerjaanBtn);
    console.log('- clearPengerjaanBtn:', !!clearPengerjaanBtn);
    console.log('- itemQuantityInput:', !!itemQuantityInput);
    
    // If key elements are missing, try to find them again after a delay
    if (!pengerjaanSelect || !addPengerjaanBtn) {
        console.warn('Key elements not found, will retry...');
        setTimeout(() => {
            pengerjaanSelect = pengerjaanSelect || document.getElementById('pengerjaanSelect');
            addPengerjaanBtn = addPengerjaanBtn || document.getElementById('addPengerjaan');
            clearPengerjaanBtn = clearPengerjaanBtn || document.getElementById('clearPengerjaan');
            itemQuantityInput = itemQuantityInput || document.getElementById('itemQuantity');
            
            console.log('Retry - Elements found:');
            console.log('- pengerjaanSelect:', !!pengerjaanSelect);
            console.log('- addPengerjaanBtn:', !!addPengerjaanBtn);
        }, 200);
    }
}

// Arrays untuk menyimpan pengerjaan dan harga
let selectedPengerjaan = [];
let totalHarga = 0;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Initialize alert close buttons
    initializeAlertCloseButtons();
    
    // Initialize image upload
    initializeImageUpload();
    
    // Initialize elements first
    initializePengerjaanElements();

    bulkDeleteAllData();
    
    // Wait a bit to ensure all elements are loaded, then setup handlers
    setTimeout(function() {
        console.log('Setting up pengerjaan handlers...');
        setupPengerjaanHandlers();
        
        displayData();
        // generateCSV();
    }, 200);
    
    // Additional retry mechanism for critical elements
    setTimeout(function() {
        if (!addPengerjaanBtn || !pengerjaanSelect) {
            console.log('Retrying element initialization...');
            initializePengerjaanElements();
            setupPengerjaanHandlers();
        }
        
        // Always ensure backup handler is in place
        // ensureButtonWorks();
    }, 500);
});

// Initialize alert close buttons
function initializeAlertCloseButtons() {
    const closeButtons = document.querySelectorAll('.alert .closebtn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            hideAlertWithAnimation(this.parentElement.id);
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Hide all visible alerts
            const visibleAlerts = document.querySelectorAll('.alert.show');
            visibleAlerts.forEach(alert => {
                hideAlertWithAnimation(alert.id);
            });
        }
    });
}

// Setup pengerjaan handlers
function setupPengerjaanHandlers() {
    // Check if elements exist
    if (!addPengerjaanBtn || !clearPengerjaanBtn || !pengerjaanSelect) {
        console.error('Pengerjaan elements not found');
        console.log('addPengerjaanBtn:', addPengerjaanBtn);
        console.log('clearPengerjaanBtn:', clearPengerjaanBtn);
        console.log('pengerjaanSelect:', pengerjaanSelect);
        return;
    }
    
    console.log('Setting up pengerjaan handlers - elements found');
    
    // Add pengerjaan
    addPengerjaanBtn.addEventListener('click', function() {
        console.log('Add button clicked');
        const selectedOptions = Array.from(pengerjaanSelect.selectedOptions);
        const quantity = parseInt(itemQuantityInput.value) || 1;
        
        console.log('Selected options:', selectedOptions.length);
        console.log('Quantity:', quantity);
        
        if (selectedOptions.length === 0) {
            showErrorMessage('Silakan pilih item pengerjaan terlebih dahulu!');
            return;
        }
        
        selectedOptions.forEach(option => {
            addPengerjaanItem(option.value, quantity);
        });
        
        // Clear selection
        pengerjaanSelect.selectedIndex = -1;
        itemQuantityInput.value = 1;
        
        // Show success message
        showSuccessAlert(`${selectedOptions.length} item berhasil ditambahkan ke pengerjaan!`);
    });
    
    // Clear pengerjaan
    clearPengerjaanBtn.addEventListener('click', function() {
        console.log('Clear button clicked');
        if (selectedPengerjaan.length > 0) {
            if (confirm('Apakah kamu yakin ingin menghapus semua item pengerjaan?')) {
                selectedPengerjaan = [];
                totalHarga = 0;
                updatePengerjaanDisplay();
                showSuccessAlert('Semua item pengerjaan berhasil dihapus!');
            }
        } else {
            showErrorMessage('Tidak ada item pengerjaan yang perlu dihapus!');
        }
    });
    
    // Enter key on quantity input
    itemQuantityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addPengerjaanBtn.click();
        }
    });
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterPengerjaanOptions(this.value);
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Auto-select first visible option if only one result
                const visibleOptions = Array.from(pengerjaanSelect.options).filter(option => 
                    !option.hidden && !option.disabled && option.value
                );
                if (visibleOptions.length === 1) {
                    visibleOptions[0].selected = true;
                    addPengerjaanBtn.click();
                    searchInput.value = '';
                    filterPengerjaanOptions('');
                }
            }
        });
    }
    
    // Clear search
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';
            filterPengerjaanOptions('');
            searchInput.focus();
        });
    }
    
    // Tax rate change listener
    const taxRateInput = document.getElementById('taxRate');
    if (taxRateInput) {
        taxRateInput.addEventListener('input', function() {
            updateTaxCalculations();
        });
    }
}

// Add pengerjaan item
function addPengerjaanItem(value, quantity = 1) {
    console.log('Adding pengerjaan item:', value, 'quantity:', quantity);
    
    // Extract nama dan harga dari value (format: "NAMA|HARGA")
    const parts = value.split('|');
    if (parts.length !== 2) {
        console.error('Invalid format:', value);
        showErrorMessage('Format tidak valid. Pastikan format: "NAMA|HARGA"');
        return;
    }
    
    const nama = parts[0].trim().toUpperCase();
    const harga = parseFloat(parts[1]) || 0;
    
    console.log('Parsed - Nama:', nama, 'Harga:', harga);
    
    // Check if already exists
    const exists = selectedPengerjaan.find(item => item.nama === nama);
    if (exists) {
        exists.quantity += quantity;
        console.log('Updated quantity for:', nama, 'to', exists.quantity);
    } else {
        selectedPengerjaan.push({
            nama: nama,
            harga: harga,
            quantity: quantity
        });
        console.log('Added new item:', nama);
    }
    
    updatePengerjaanDisplay();
}

// Update pengerjaan display
function updatePengerjaanDisplay() {
    console.log('Updating display, selected items:', selectedPengerjaan);
    
    let text = '';
    totalHarga = 0;
    
    selectedPengerjaan.forEach(item => {
        const subtotal = item.harga * item.quantity;
        totalHarga += subtotal;
        
        if (item.quantity > 1) {
            text += `${item.nama} ${item.quantity}x, `;
        } else {
            text += `${item.nama}, `;
        }
    });
    
    // Remove trailing comma and space
    text = text.replace(/, $/, '');
    
    console.log('Generated text:', text);
    console.log('Total harga:', totalHarga);
    
    if (pengerjaanTextarea) {
        pengerjaanTextarea.value = text;
    }
    
    if (totalHargaSpan) {
        totalHargaSpan.textContent = `Total: $${totalHarga.toFixed(2)}`;
    }
    
    // Update tax calculations
    updateTaxCalculations();
    
    // Update selected items display
    updateSelectedItemsDisplay();
}

// Update tax calculations
function updateTaxCalculations() {
    const taxRateInput = document.getElementById('taxRate');
    const subtotalInput = document.getElementById('subtotal');
    const taxAmountInput = document.getElementById('taxAmount');
    const totalInvoiceInput = document.getElementById('totalInvoice');
    
    if (!taxRateInput || !subtotalInput || !taxAmountInput || !totalInvoiceInput) {
        return;
    }
    
    const subtotal = totalHarga;
    const taxRate = parseFloat(taxRateInput.value) || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalWithTax = subtotal + taxAmount;
    
    subtotalInput.value = subtotal.toFixed(2);
    taxAmountInput.value = taxAmount.toFixed(2);
    totalInvoiceInput.value = totalWithTax.toFixed(2);
}

// Update selected items display with individual controls
function updateSelectedItemsDisplay() {
    if (!selectedItemsDiv) return;
    
    if (selectedPengerjaan.length === 0) {
        selectedItemsDiv.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">Belum ada item yang dipilih</p>';
        return;
    }
    
    let html = '<h4 style="margin: 0 0 10px 0; color: #333;">Selected Items:</h4>';
    
    selectedPengerjaan.forEach((item, index) => {
        const subtotal = item.harga * item.quantity;
        html += `
            <div class="selected-item">
                <div class="selected-item-info">
                    <span class="selected-item-name">${item.nama}</span>
                    <span class="selected-item-price">$${item.harga.toFixed(2)} each</span>
                </div>
                <div class="quantity-controls">
                    <button type="button" class="qty-btn" onclick="changeQuantity(${index}, -1)">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button type="button" class="qty-btn" onclick="changeQuantity(${index}, 1)">+</button>
                    <button type="button" class="remove-item-btn" onclick="removeItem(${index})">🗑️</button>
                </div>
            </div>
        `;
    });
    
    selectedItemsDiv.innerHTML = html;
}

// Change quantity of selected item
function changeQuantity(index, change) {
    if (selectedPengerjaan[index]) {
        selectedPengerjaan[index].quantity += change;
        if (selectedPengerjaan[index].quantity <= 0) {
            selectedPengerjaan.splice(index, 1);
        }
        updatePengerjaanDisplay();
    }
}

// Remove item from selected items
function removeItem(index) {
    if (selectedPengerjaan[index]) {
        selectedPengerjaan.splice(index, 1);
        updatePengerjaanDisplay();
    }
}

// Filter pengerjaan options based on search
function filterPengerjaanOptions(searchTerm) {
    if (!pengerjaanSelect) return;
    
    const options = pengerjaanSelect.querySelectorAll('option');
    const optgroups = pengerjaanSelect.querySelectorAll('optgroup');
    let hasVisibleResults = false;
    
    // Convert search term to lowercase for case-insensitive search
    const search = searchTerm.toLowerCase().trim();
    
    if (search === '') {
        // Show all options if search is empty
        options.forEach(option => {
            option.hidden = false;
            option.classList.remove('search-highlight');
        });
        optgroups.forEach(optgroup => {
            optgroup.hidden = false;
        });
        return;
    }
    
    // Hide all optgroups first
    optgroups.forEach(optgroup => {
        optgroup.hidden = true;
    });
    
    // Filter options
    options.forEach(option => {
        if (!option.value) {
            option.hidden = true;
            return;
        }
        
        const optionText = option.textContent.toLowerCase();
        const searchData = option.dataset.search ? option.dataset.search.toLowerCase() : '';
        const optionValue = option.value.toLowerCase();
        
        // Check if search term matches option text, search data, or value
        const matches = optionText.includes(search) || 
                       searchData.includes(search) || 
                       optionValue.includes(search);
        
        if (matches) {
            option.hidden = false;
            option.classList.add('search-highlight');
            hasVisibleResults = true;
            
            // Show parent optgroup
            const parentOptgroup = option.closest('optgroup');
            if (parentOptgroup) {
                parentOptgroup.hidden = false;
            }
        } else {
            option.hidden = true;
            option.classList.remove('search-highlight');
        }
    });
    
    // Show message if no results
    if (!hasVisibleResults) {
        console.log('No results found for:', searchTerm);
        // You could add a "no results" option here if needed
    }
    
    // Update clear search button visibility
    if (clearSearchBtn) {
        clearSearchBtn.style.display = search ? 'block' : 'none';
    }
}

// Quick search shortcuts
function quickSearch(category) {
    if (searchInput) {
        searchInput.value = category;
        filterPengerjaanOptions(category);
        searchInput.focus();
    }
}

// Form submission
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Validate required fields
        if (!data.nomor || !data.namaClient || !data.jenisKendaraan || !data.namaMontir || !data.pengerjaan) {
            showErrorMessage('Semua field wajib diisi!');
            return;
        }
        
        // Add uploaded image data if exists
        if (uploadedImageData) {
            data.billScreenshot = uploadedImageData;
        }
        
        // Add timestamp
        data.timestamp = new Date().toISOString();
        data.id = Date.now().toString();
        
        // Format currency
        data.modal = parseFloat(data.modal).toFixed(2);
        data.taxRate = parseFloat(data.taxRate).toFixed(2);
        data.subtotal = parseFloat(data.subtotal).toFixed(2);
        data.taxAmount = parseFloat(data.taxAmount).toFixed(2);
        data.totalInvoice = parseFloat(data.totalInvoice).toFixed(2);
        
        // Add to array
        invoiceData.push(data);
        
        // Save to localStorage
        localStorage.setItem('invoiceData', JSON.stringify(invoiceData));
        
        // Update display
        displayData();
        // generateCSV();
        
        // Show success message
        showSuccessMessage('Data berhasil disimpan!');
        
    } catch (error) {
        console.error('Error saving data:', error);
        showErrorMessage('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
    }
    
    // Reset form
    form.reset();
    
    // Reset modal to 0
    document.getElementById('modal').value = '0';
    
    // Reset tax rate to 5
    document.getElementById('taxRate').value = '5';
    
    // Reset pengerjaan
    selectedPengerjaan = [];
    totalHarga = 0;
    updatePengerjaanDisplay();
    
    // Reset uploaded image
    if (uploadedImageData) {
        removeImage();
    }
});

// Display data function
function displayData() {
    if (invoiceData.length === 0) {
        dataTable.innerHTML = '<div class="empty-state">Belum ada data yang tersimpan</div>';
        return;
    }
    
    let html = '';
    
    invoiceData.forEach((item, index) => {
        const statusClass = 'status-active';
        const hasImage = item.billScreenshot && item.billScreenshot.data;
        
        html += `
            <div class="data-item">
                <div class="data-header">
                    <div><strong>Nomor: ${item.nomor}</strong></div>
                    <div><strong>Client: ${item.namaClient}</strong></div>
                    <div><strong>Total: $${item.totalInvoice}</strong></div>
                    <div class="action-buttons">
                        <button class="export-single-btn" onclick="exportSingleData(${index})">📋 Copy Text</button>
                        ${hasImage ? `<button class="copy-with-image-btn" onclick="copyWithImage(${index})">🖼️ Copy dengan Gambar</button>` : ''}
                        <button class="delete-btn" onclick="deleteItem(${index})">🗑️ Hapus</button>
                    </div>
                </div>
                <div class="data-content">
                    <div><strong>Kendaraan:</strong> ${item.jenisKendaraan}</div>
                    <div><strong>Montir:</strong> ${item.namaMontir}</div>
                    <div><strong>Pengerjaan:</strong> ${item.pengerjaan}</div>
                    <div><strong>Modal:</strong> $${item.modal}</div>
                    <div class="bill-number-section">
                        <strong>💳 Bill Number:</strong>
                        <div class="bill-input-container">
                            <input type="text" 
                                   id="billInput_${index}" 
                                   class="bill-input" 
                                   value="${item.billNumber || ''}" 
                                   placeholder="Masukkan bill number..."
                                   onchange="updateBillNumber(${index}, this.value)"
                                   onblur="saveBillNumber(${index}, this.value)">
                            <button class="update-bill-btn" onclick="focusBillInput(${index})">✏️ Edit</button>
                        </div>
                    </div>
                    <div><strong>Subtotal:</strong> $${item.subtotal || '0.00'}</div>
                    <div><strong>Tax Rate:</strong> ${item.taxRate || '5.00'}%</div>
                    <div><strong>Tax Amount:</strong> $${item.taxAmount || '0.00'}</div>
                    ${hasImage ? `
                    <div class="bill-screenshot">
                        <strong>Bill Screenshot:</strong>
                        <div class="saved-image-preview">
                            <img src="${item.billScreenshot.data}" alt="Bill Screenshot" onclick="showImageModal('${item.billScreenshot.data}', '${item.billScreenshot.name}')">
                            <small>${item.billScreenshot.name} (${(item.billScreenshot.size / 1024).toFixed(1)} KB)</small>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    dataTable.innerHTML = html;
}

// Generate CSV function
// function generateCSV() {
//     if (invoiceData.length === 0) {
//         csvOutput.value = 'Belum ada data untuk di-export';
//         return;
//     }
    
//     // CSV Header
//     const headers = [
//         'Nomor',
//         'Nama Client',
//         'Jenis Kendaraan',
//         'Nama Montir',
//         'Pengerjaan',
//         'Modal',
//         'Total Invoice'
//     ];
    
//     // Build CSV content
//     let csvContent = '```csv\n';
//     csvContent += headers.join(',') + '\n';
    
//     invoiceData.forEach(item => {
//         const row = [
//             item.nomor,
//             `"${item.namaClient}"`,
//             `"${item.jenisKendaraan}"`,
//             `"${item.namaMontir}"`,
//             `"${item.pengerjaan}"`,
//             item.modal,
//             item.totalInvoice
//         ];
//         csvContent += row.join(',') + '\n';
//     });
    
//     csvContent += '```';
    
//     csvOutput.value = csvContent;
// }

// Export CSV
// exportBtn.addEventListener('click', function() {
//     generateCSV();
//     showSuccessMessage('CSV berhasil di-generate! Siap untuk di-copy ke Discord.');
// });

// Copy to clipboard
// copyBtn.addEventListener('click', function() {
//     csvOutput.select();
//     csvOutput.setSelectionRange(0, 99999); // For mobile devices
    
//     try {
//         document.execCommand('copy');
//         showSuccessMessage('CSV berhasil di-copy ke clipboard! Paste ke Discord sekarang.');
//     } catch (err) {
//         // Fallback for modern browsers
//         navigator.clipboard.writeText(csvOutput.value).then(function() {
//             showSuccessMessage('CSV berhasil di-copy ke clipboard! Paste ke Discord sekarang.');
//         }).catch(function() {
//             showSuccessMessage('Gagal copy. Silakan select text dan copy manual.');
//         });
//     }
// });

// Clear form
clearBtn.addEventListener('click', function() {
    console.log('Clear button clicked');
    
    if (confirm('Apakah kamu yakin ingin menghapus semua data form?')) {
        try {
            form.reset();
            
            // Reset modal to 0
            document.getElementById('modal').value = '0';
            
            // Reset tax rate to 5
            document.getElementById('taxRate').value = '5';
            
            // Reset pengerjaan
            selectedPengerjaan = [];
            totalHarga = 0;
            updatePengerjaanDisplay();
            
            // Reset uploaded image
            if (uploadedImageData) {
                removeImage();
            }
            
            showSuccessMessage('Form berhasil di-reset!');
        } catch (error) {
            console.error('Error clearing form:', error);
            showErrorMessage('Terjadi kesalahan saat mereset form. Silakan coba lagi.');
        }
    }
});

// Delete item function
function deleteItem(index) {
    if (confirm('Apakah kamu yakin ingin menghapus data ini?')) {
        try {
            const deletedItem = invoiceData[index];
            invoiceData.splice(index, 1);
            localStorage.setItem('invoiceData', JSON.stringify(invoiceData));
            displayData();
            // generateCSV();
            showSuccessMessage(`Data ${deletedItem.namaClient} berhasil dihapus!`);
        } catch (error) {
            console.error('Error deleting item:', error);
            showErrorMessage('Terjadi kesalahan saat menghapus data. Silakan coba lagi.');
        }
    }
}

// Export single data for Discord
function exportSingleData(index) {
    try {
        const item = invoiceData[index];
        
        const discordFormat = `\`\`\`css
Nomor           : ${item.nomor}
Nama Client     : ${item.namaClient}
Jenis Kendaraan : ${item.jenisKendaraan}

Nama Montir     : ${item.namaMontir}
Pengerjaan      : ${item.pengerjaan}
Modal           : ${item.modal}
${item.billNumber ? `Bill Number     : ${item.billNumber}` : ''}

Subtotal        : $${item.subtotal || '0.00'}
Tax Rate        : ${item.taxRate || '5.00'}%
Tax Amount      : $${item.taxAmount || '0.00'}
Total Invoice   : $${item.totalInvoice}\`\`\``;
        
        // Copy to clipboard
        navigator.clipboard.writeText(discordFormat).then(function() {
            showExportAlert(`Data ${item.namaClient} berhasil di-copy untuk Discord!`);
        }).catch(function() {
            // Fallback method
            const textArea = document.createElement('textarea');
            textArea.value = discordFormat;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showExportAlert(`Data ${item.namaClient} berhasil di-copy untuk Discord!`);
        });
    } catch (error) {
        console.error('Error exporting data:', error);
        showErrorMessage('Terjadi kesalahan saat mengexport data. Silakan coba lagi.');
    }
}

// Enhanced CSV export with better formatting
function generateAdvancedCSV() {
    if (invoiceData.length === 0) {
        return 'Belum ada data untuk di-export';
    }
    
    let output = '```csv\n';
    output += '📊 INVOICE DATA EXPORT\n';
    output += `📅 Generated: ${new Date().toLocaleString('id-ID')}\n`;
    output += `📈 Total Records: ${invoiceData.length}\n`;
    output += '─'.repeat(50) + '\n\n';
    
    // Headers
    output += 'Nomor,Nama_Client,Jenis_Kendaraan,Nama_Montir,Pengerjaan,Modal,Total_Invoice\n';
    
    // Data rows
    invoiceData.forEach((item, index) => {
        const row = [
            item.nomor,
            item.namaClient.replace(/"/g, '""'),
            item.jenisKendaraan.replace(/"/g, '""'),
            item.namaMontir.replace(/"/g, '""'),
            item.pengerjaan.replace(/"/g, '""'),
            `$${item.modal}`,
            `$${item.totalInvoice}`
        ];
        output += `"${row.join('","')}"\n`;
    });
    
    // Summary
    const totalModal = invoiceData.reduce((sum, item) => sum + parseFloat(item.modal), 0);
    const totalInvoice = invoiceData.reduce((sum, item) => sum + parseFloat(item.totalInvoice), 0);
    const totalProfit = totalInvoice - totalModal;
    
    output += '\n📊 SUMMARY:\n';
    output += `💰 Total Modal: $${totalModal.toFixed(2)}\n`;
    output += `💵 Total Invoice: $${totalInvoice.toFixed(2)}\n`;
    output += `📈 Total Profit: $${totalProfit.toFixed(2)}\n`;
    output += '```';
    
    return output;
}

// Update export button to use advanced CSV
// exportBtn.addEventListener('click', function() {
//     csvOutput.value = generateAdvancedCSV();
//     showSuccessMessage('CSV berhasil di-generate! Siap untuk Discord.');
// });

// Image upload functionality
let uploadedImageData = null;

// Initialize image upload functionality
function initializeImageUpload() {
    const fileInput = document.getElementById('billScreenshot');
    const uploadContainer = document.querySelector('.file-upload-container');
    const uploadPrompt = document.getElementById('uploadPrompt');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeBtn = document.getElementById('removeImage');

    if (!fileInput || !uploadContainer || !uploadPrompt || !imagePreview || !previewImg || !removeBtn) {
        console.error('Image upload elements not found');
        return;
    }

    // File input change handler
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop handlers
    uploadContainer.addEventListener('dragover', handleDragOver);
    uploadContainer.addEventListener('dragleave', handleDragLeave);
    uploadContainer.addEventListener('drop', handleFileDrop);
    
    // Click to upload
    uploadPrompt.addEventListener('click', () => fileInput.click());
    
    // Remove image
    removeBtn.addEventListener('click', removeImage);
    
    // Clipboard paste functionality
    document.addEventListener('paste', handleClipboardPaste);
    uploadContainer.addEventListener('paste', handleClipboardPaste);
}

function handleClipboardPaste(e) {
    // Only handle paste if focus is on upload area or no specific focus
    const isUploadAreaFocused = e.target.closest('.file-upload-container') || 
                                e.target === document.body ||
                                !e.target.closest('input, textarea');
    
    if (!isUploadAreaFocused) return;
    
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.type.indexOf('image') !== -1) {
            e.preventDefault();
            const file = item.getAsFile();
            
            if (file) {
                processImageFile(file);
                showSuccessAlert('Gambar berhasil di-paste dari clipboard!');
            }
            break;
        }
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processImageFile(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            processImageFile(file);
        } else {
            showErrorAlert('File yang dipilih bukan gambar. Silakan pilih file JPG, PNG, atau GIF.');
        }
    }
}

function processImageFile(file) {
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        showErrorAlert('Ukuran file terlalu besar. Maksimal 5MB.');
        return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        showErrorAlert('Format file tidak didukung. Gunakan JPG, PNG, atau GIF.');
        return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageData = {
            name: file.name,
            size: file.size,
            type: file.type,
            data: e.target.result
        };
        
        displayImagePreview(e.target.result, file);
        showSuccessAlert(`Gambar ${file.name} berhasil diupload!`);
    };
    
    reader.onerror = function() {
        showErrorAlert('Gagal membaca file gambar. Silakan coba lagi.');
    };
    
    reader.readAsDataURL(file);
}

function displayImagePreview(dataUrl, file) {
    const uploadPrompt = document.getElementById('uploadPrompt');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    previewImg.src = dataUrl;
    uploadPrompt.style.display = 'none';
    imagePreview.style.display = 'block';
    
    // Add file info
    let infoDiv = document.querySelector('.image-info');
    if (!infoDiv) {
        infoDiv = document.createElement('div');
        infoDiv.className = 'image-info';
        imagePreview.appendChild(infoDiv);
    }
    
    infoDiv.innerHTML = `
        <strong>${file.name}</strong><br>
        Size: ${(file.size / 1024).toFixed(1)} KB | Type: ${file.type}
    `;
}

function removeImage() {
    uploadedImageData = null;
    
    const uploadPrompt = document.getElementById('uploadPrompt');
    const imagePreview = document.getElementById('imagePreview');
    const fileInput = document.getElementById('billScreenshot');
    
    uploadPrompt.style.display = 'block';
    imagePreview.style.display = 'none';
    fileInput.value = '';
    
    const infoDiv = document.querySelector('.image-info');
    if (infoDiv) {
        infoDiv.remove();
    }
    
    showSuccessAlert('Gambar berhasil dihapus!');
}

// Copy data with image functionality
async function copyWithImage(index) {
    try {
        const item = invoiceData[index];
        
        if (!item.billScreenshot || !item.billScreenshot.data) {
            showErrorMessage('Tidak ada gambar yang tersedia untuk item ini.');
            return;
        }
        
        const textData = `\`\`\`css
Nomor           : ${item.nomor}
Nama Client     : ${item.namaClient}
Jenis Kendaraan : ${item.jenisKendaraan}

Nama Montir     : ${item.namaMontir}
Pengerjaan      : ${item.pengerjaan}
Modal           : ${item.modal}
${item.billNumber ? `Bill Number     : ${item.billNumber}` : ''}

Subtotal        : $${item.subtotal || '0.00'}
Tax Rate        : ${item.taxRate || '5.00'}%
Tax Amount      : $${item.taxAmount || '0.00'}
Total Invoice   : $${item.totalInvoice}\`\`\``;
        
        // Convert base64 to blob
        const response = await fetch(item.billScreenshot.data);
        const blob = await response.blob();
        
        // Try using the modern Clipboard API with both text and image
        if (navigator.clipboard && navigator.clipboard.write) {
            const clipboardItems = [
                new ClipboardItem({
                    'text/plain': new Blob([textData], { type: 'text/plain' }),
                    [blob.type]: blob
                })
            ];
            
            await navigator.clipboard.write(clipboardItems);
            showExportAlert(`Data dan gambar ${item.namaClient} berhasil di-copy!`);
        } else {
            // Fallback: copy text only and show image separately
            await navigator.clipboard.writeText(textData);
            showImageForManualCopy(item.billScreenshot.data, item.billScreenshot.name);
            showExportAlert(`Text berhasil di-copy! Gambar ditampilkan untuk copy manual.`);
        }
        
    } catch (error) {
        console.error('Error copying with image:', error);
        
        // Final fallback: show both text and image for manual copy
        const item = invoiceData[index];
        const textData = `\`\`\`css
Nomor           : ${item.nomor}
Nama Client     : ${item.namaClient}
Jenis Kendaraan : ${item.jenisKendaraan}

Nama Montir     : ${item.namaMontir}
Pengerjaan      : ${item.pengerjaan}
Modal           : ${item.modal}
${item.billNumber ? `Bill Number     : ${item.billNumber}` : ''}

Subtotal        : $${item.subtotal || '0.00'}
Tax Rate        : ${item.taxRate || '5.00'}%
Tax Amount      : $${item.taxAmount || '0.00'}
Total Invoice   : $${item.totalInvoice}\`\`\``;
        
        showTextAndImageModal(textData, item.billScreenshot.data, item.billScreenshot.name);
        showErrorMessage('Copy otomatis gagal. Silakan copy manual dari popup yang muncul.');
    }
}

// Show image modal for viewing
function showImageModal(imageSrc, imageName) {
    const modal = createModal();
    modal.innerHTML = `
        <div class="modal-content image-modal">
            <div class="modal-header">
                <h3>📸 ${imageName}</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <img src="${imageSrc}" alt="${imageName}" style="width: 100%; height: auto; max-height: 70vh; object-fit: contain;">
                <div class="modal-actions">
                    <button onclick="downloadImage('${imageSrc}', '${imageName}')" class="btn btn-primary">💾 Download</button>
                    <button onclick="copyImageToClipboard('${imageSrc}')" class="btn btn-secondary">📋 Copy Image</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupModalEvents(modal);
}

// Show image for manual copy
function showImageForManualCopy(imageSrc, imageName) {
    const modal = createModal();
    modal.innerHTML = `
        <div class="modal-content image-modal">
            <div class="modal-header">
                <h3>📸 Copy Gambar Manual</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <p>Text sudah di-copy ke clipboard. Silakan copy gambar di bawah ini secara manual:</p>
                <img src="${imageSrc}" alt="${imageName}" style="width: 100%; height: auto; max-height: 60vh; object-fit: contain; border: 2px solid #667eea; border-radius: 8px;">
                <div class="modal-actions">
                    <button onclick="copyImageToClipboard('${imageSrc}')" class="btn btn-primary">📋 Copy Image</button>
                    <button onclick="downloadImage('${imageSrc}', '${imageName}')" class="btn btn-secondary">💾 Download</button>
                </div>
                <small style="color: #666; margin-top: 10px; display: block;">
                    Tip: Klik kanan pada gambar → "Copy Image" untuk browser yang mendukung
                </small>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupModalEvents(modal);
}

// Show text and image modal for manual copy
function showTextAndImageModal(textData, imageSrc, imageName) {
    const modal = createModal();
    modal.innerHTML = `
        <div class="modal-content text-image-modal">
            <div class="modal-header">
                <h3>📋 Copy Manual - Text & Image</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="copy-section">
                    <h4>📝 Text Data:</h4>
                    <textarea readonly style="width: 100%; height: 200px; font-family: monospace; font-size: 12px; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">${textData}</textarea>
                    <button onclick="copyTextFromModal(this)" class="btn btn-primary" style="margin-top: 10px;">📋 Copy Text</button>
                </div>
                <div class="copy-section" style="margin-top: 20px;">
                    <h4>📸 Image:</h4>
                    <img src="${imageSrc}" alt="${imageName}" style="width: 100%; height: auto; max-height: 300px; object-fit: contain; border: 1px solid #ddd; border-radius: 4px;">
                    <div class="modal-actions" style="margin-top: 10px;">
                        <button onclick="copyImageToClipboard('${imageSrc}')" class="btn btn-primary">📋 Copy Image</button>
                        <button onclick="downloadImage('${imageSrc}', '${imageName}')" class="btn btn-secondary">💾 Download</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupModalEvents(modal);
}

// Utility functions for modal
function createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    return modal;
}

function setupModalEvents(modal) {
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.onclick = () => modal.remove();
    }
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
    
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

// Copy image to clipboard
async function copyImageToClipboard(imageSrc) {
    try {
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        
        if (navigator.clipboard && navigator.clipboard.write) {
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob
                })
            ]);
            showSuccessAlert('Gambar berhasil di-copy ke clipboard!');
        } else {
            throw new Error('Clipboard API not supported');
        }
    } catch (error) {
        console.error('Error copying image:', error);
        showErrorMessage('Copy gambar tidak didukung di browser ini. Silakan klik kanan → Copy Image atau download gambar.');
    }
}

// Download image
function downloadImage(imageSrc, imageName) {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = imageName || 'bill-screenshot.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessAlert('Gambar berhasil didownload!');
}

// Copy text from modal
function copyTextFromModal(button) {
    const textarea = button.parentElement.querySelector('textarea');
    textarea.select();
    document.execCommand('copy');
    showSuccessAlert('Text berhasil di-copy!');
}

// Bill number management functions
function updateBillNumber(index, value) {
    if (invoiceData[index]) {
        invoiceData[index].billNumber = value;
    }
}

function saveBillNumber(index, value) {
    if (invoiceData[index]) {
        invoiceData[index].billNumber = value;
        localStorage.setItem('invoiceData', JSON.stringify(invoiceData));
        
        if (value.trim()) {
            showSuccessAlert('Bill number berhasil disimpan!');
        }
    }
}

function focusBillInput(index) {
    const billInput = document.getElementById(`billInput_${index}`);
    if (billInput) {
        billInput.focus();
        billInput.select();
    }
}

function bulkDeleteAllData() {
    deleteAllBtn.addEventListener('click', function() {
        if (confirm('Apakah kamu yakin ingin menghapus semua data?')) {
            try {
                invoiceData = [];
                localStorage.removeItem('invoiceData');
                showSuccessAlert('Semua data berhasil dihapus!');
                displayData();
                // generateCSV();
            } catch (error) {
                console.error('Error deleting all data:', error);
                showErrorMessage('Terjadi kesalahan saat menghapus semua data. Silakan coba lagi.');
            }
        }
    });
}

function showSuccessMessage(message) {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerText = message;
    document.body.appendChild(successMessage);
    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

// Fallback function to ensure button works
// function ensureButtonWorks() {
//     const addBtn = document.getElementById('addPengerjaan');
//     const selectEl = document.getElementById('pengerjaanSelect');
//     const quantityInput = document.getElementById('itemQuantity');
    
//     if (addBtn && selectEl && quantityInput) {
//         // Remove any existing listeners to avoid duplicates
//         addBtn.onclick = null;
        
//         // Add direct onclick handler as backup
//         addBtn.onclick = function() {
//             console.log('Backup handler triggered');
//             const selectedOptions = Array.from(selectEl.selectedOptions);
//             const quantity = parseInt(quantityInput.value) || 1;
//             if (selectedPengerjaan.length === 0) {
//                 showErrorAlert('Silakan pilih item pengerjaan terlebih dahulu!');
//                 return;
//             }
            
//             selectedOptions.forEach(option => {
//                 addPengerjaanItem(option.value, quantity);
//             });
            
//             // Clear selection
//             selectEl.selectedIndex = -1;
//             quantityInput.value = 1;
            
//             showSuccessAlert(`${selectedOptions.length} item berhasil ditambahkan ke pengerjaan!`);
//         };
        
//         console.log('Backup handler attached to add button');
//     }
// }

// Call the fallback function after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // ensureButtonWorks();
});
