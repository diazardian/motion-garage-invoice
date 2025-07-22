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

// DOM elements - akan diinisialisasi setelah main app di-render
let form, dataTable, csvOutput, exportBtn, copyBtn, clearBtn, deleteAllBtn;

// Pengerjaan elements
// DOM elements for pengerjaan
let partNameInput, partPriceInput, servicePriceInput, pengerjaanTextarea, addPengerjaanBtn, clearPengerjaanBtn, totalHargaSpan, itemQuantityInput, selectedItemsDiv, resetManualFormBtn;

// Initialize pengerjaan elements
function initializePengerjaanElements() {
    console.log('Initializing pengerjaan elements...');
    
    partNameInput = document.getElementById('partName');
    partPriceInput = document.getElementById('partPrice');
    servicePriceInput = document.getElementById('servicePrice');
    pengerjaanTextarea = document.getElementById('pengerjaan');
    addPengerjaanBtn = document.getElementById('addPengerjaan');
    clearPengerjaanBtn = document.getElementById('clearPengerjaan');
    totalHargaSpan = document.getElementById('totalHarga');
    itemQuantityInput = document.getElementById('itemQuantity');
    selectedItemsDiv = document.getElementById('selectedItems');
    resetManualFormBtn = document.getElementById('resetManualForm');
    
    // Log which elements were found
    console.log('Elements found:');
    console.log('- partNameInput:', !!partNameInput);
    console.log('- partPriceInput:', !!partPriceInput);
    console.log('- servicePriceInput:', !!servicePriceInput);
    console.log('- addPengerjaanBtn:', !!addPengerjaanBtn);
    console.log('- clearPengerjaanBtn:', !!clearPengerjaanBtn);
    console.log('- itemQuantityInput:', !!itemQuantityInput);
    console.log('- resetManualFormBtn:', !!resetManualFormBtn);
    
    // If key elements are missing, try to find them again after a delay
    if (!partNameInput || !addPengerjaanBtn) {
        console.warn('Key elements not found, will retry...');
        setTimeout(() => {
            partNameInput = partNameInput || document.getElementById('partName');
            partPriceInput = partPriceInput || document.getElementById('partPrice');
            servicePriceInput = servicePriceInput || document.getElementById('servicePrice');
            addPengerjaanBtn = addPengerjaanBtn || document.getElementById('addPengerjaan');
            clearPengerjaanBtn = clearPengerjaanBtn || document.getElementById('clearPengerjaan');
            itemQuantityInput = itemQuantityInput || document.getElementById('itemQuantity');
            resetManualFormBtn = resetManualFormBtn || document.getElementById('resetManualForm');
            
            console.log('Retry - Elements found:');
            console.log('- partNameInput:', !!partNameInput);
            console.log('- addPengerjaanBtn:', !!addPengerjaanBtn);
        }, 200);
    }
}

// Initialize DOM elements setelah main app di-render
function initializeDOMElements() {
    console.log('Initializing DOM elements...');
    
    form = document.getElementById('invoiceForm');
    dataTable = document.getElementById('dataTable');
    csvOutput = document.getElementById('csvOutput');
    exportBtn = document.getElementById('exportBtn');
    copyBtn = document.getElementById('copyBtn');
    clearBtn = document.getElementById('clearBtn');
    deleteAllBtn = document.getElementById('deleteAllBtn');
    
    console.log('DOM elements found:');
    console.log('- form:', !!form);
    console.log('- dataTable:', !!dataTable);
    console.log('- clearBtn:', !!clearBtn);
    console.log('- deleteAllBtn:', !!deleteAllBtn);
    
    // Setup form event listener
    if (form) {
        setupFormEventListener();
    }
    
    // Setup clear button event listener
    if (clearBtn) {
        setupClearButtonEventListener();
    }
    
    // Setup delete all button event listener
    if (deleteAllBtn) {
        setupDeleteAllButtonEventListener();
    }
}

// Setup delete all button event listener
function setupDeleteAllButtonEventListener() {
    deleteAllBtn.addEventListener('click', function() {
        if (confirm('Apakah kamu yakin ingin menghapus semua data?')) {
            try {
                invoiceData = [];
                localStorage.removeItem('invoiceData');
                showSuccessAlert('Semua data berhasil dihapus!');
                displayData();
            } catch (error) {
                console.error('Error deleting all data:', error);
                showErrorMessage('Terjadi kesalahan saat menghapus semua data. Silakan coba lagi.');
            }
        }
    });
}

// Setup form event listener
function setupFormEventListener() {
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
}

// Setup clear button event listener
function setupClearButtonEventListener() {
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
}

// Arrays untuk menyimpan pengerjaan dan harga
let selectedPengerjaan = [];
let totalHarga = 0;

// Initialize app

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
    if (!addPengerjaanBtn || !clearPengerjaanBtn || !partNameInput || !partPriceInput) {
        console.error('Pengerjaan elements not found');
        console.log('addPengerjaanBtn:', addPengerjaanBtn);
        console.log('clearPengerjaanBtn:', clearPengerjaanBtn);
        console.log('partNameInput:', partNameInput);
        console.log('partPriceInput:', partPriceInput);
        return;
    }
    
    console.log('Setting up pengerjaan handlers - elements found');
    
    // Auto-calculate service price when part price changes
    partPriceInput.addEventListener('input', function() {
        const partPrice = parseFloat(this.value) || 0;
        const servicePrice = partPrice * 1.5;
        servicePriceInput.value = servicePrice.toFixed(2);
    });
    
    // Add pengerjaan item
    addPengerjaanBtn.addEventListener('click', function() {
        console.log('Add button clicked');
        addManualPengerjaanItem();
    });
    
    // Reset form
    if (resetManualFormBtn) {
        resetManualFormBtn.addEventListener('click', function() {
            resetManualForm();
        });
    }
    
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
    
    // Enter key handlers
    partNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            partPriceInput.focus();
        }
    });
    
    partPriceInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            itemQuantityInput.focus();
        }
    });
    
    itemQuantityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addPengerjaanBtn.click();
        }
    });
    
    // Tax rate change listener
    const taxRateInput = document.getElementById('taxRate');
    if (taxRateInput) {
        taxRateInput.addEventListener('input', function() {
            updateTaxCalculations();
        });
    }
}

// Add manual pengerjaan item
function addManualPengerjaanItem() {
    const partName = partNameInput.value.trim();
    const partPrice = parseFloat(partPriceInput.value) || 0;
    const servicePrice = parseFloat(servicePriceInput.value) || 0;
    const quantity = parseInt(itemQuantityInput.value) || 1;
    
    // Validation
    if (!partName) {
        showErrorMessage('Silakan masukkan nama part atau service!');
        partNameInput.focus();
        return;
    }
    
    if (partPrice <= 0 && servicePrice <= 0) {
        showErrorMessage('Silakan masukkan harga part yang valid!');
        partPriceInput.focus();
        return;
    }
    
    if (quantity < 1) {
        showErrorMessage('Quantity minimal adalah 1!');
        itemQuantityInput.focus();
        return;
    }
    
    // Total price is only the service price (part × 1.5)
    const totalPricePerItem = servicePrice;
    
    // Create item object
    const newItem = {
        nama: partName.toUpperCase(),
        partPrice: partPrice,
        servicePrice: servicePrice,
        totalPrice: totalPricePerItem,
        quantity: quantity
    };
    
    // Check if item already exists
    const existingIndex = selectedPengerjaan.findIndex(item => item.nama === newItem.nama);
    
    if (existingIndex !== -1) {
        // Update existing item - ask user if they want to add to quantity or replace
        const existingItem = selectedPengerjaan[existingIndex];
        const action = confirm(`${partName} sudah ada dalam daftar.\n\nKlik OK untuk menambah quantity (+${quantity})\nKlik Cancel untuk mengganti dengan data baru`);
        
        if (action) {
            // Add to quantity
            selectedPengerjaan[existingIndex].quantity += quantity;
            showSuccessAlert(`Quantity untuk ${partName} berhasil ditambahkan! Total: ${selectedPengerjaan[existingIndex].quantity}`);
        } else {
            // Replace with new data
            selectedPengerjaan[existingIndex] = newItem;
            showSuccessAlert(`Data ${partName} berhasil diperbarui!`);
        }
    } else {
        // Add new item
        selectedPengerjaan.push(newItem);
        showSuccessAlert(`${partName} berhasil ditambahkan ke pengerjaan!`);
    }
    
    // Update display
    updatePengerjaanDisplay();
    
    // Reset form
    resetManualForm();
}

// Reset manual form
function resetManualForm() {
    partNameInput.value = '';
    partPriceInput.value = '';
    servicePriceInput.value = '';
    itemQuantityInput.value = 1;
    partNameInput.focus();
}

// Apply preset values
function applyPreset(partName, partPrice) {
    if (partNameInput && partPriceInput && servicePriceInput) {
        partNameInput.value = partName;
        partPriceInput.value = partPrice.toFixed(2);
        
        // Auto-calculate service price
        const servicePrice = partPrice * 1.5;
        servicePriceInput.value = servicePrice.toFixed(2);
        
        // Focus on quantity input
        if (itemQuantityInput) {
            itemQuantityInput.focus();
        }
        
        showSuccessAlert(`Preset ${partName} berhasil diterapkan! Part: $${partPrice} + Service: $${servicePrice.toFixed(2)}`);
    }
}

// Make applyPreset globally accessible
window.applyPreset = applyPreset;

// Update pengerjaan display
function updatePengerjaanDisplay() {
    console.log('Updating display, selected items:', selectedPengerjaan);
    
    let text = '';
    totalHarga = 0;
    
    selectedPengerjaan.forEach(item => {
        const itemTotal = item.totalPrice * item.quantity;
        totalHarga += itemTotal;
        
        if (item.quantity > 1) {
            text += `${item.nama} ${item.quantity}x ($${item.servicePrice.toFixed(2)}), `;
        } else {
            text += `${item.nama} ($${item.servicePrice.toFixed(2)}), `;
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
        const subtotal = item.totalPrice * item.quantity;
        html += `
            <div class="selected-item">
                <div class="selected-item-info">
                    <span class="selected-item-name">${item.nama}</span>
                    <span class="selected-item-price">Part: $${item.partPrice.toFixed(2)} → Service: $${item.servicePrice.toFixed(2)} (Part × 1.5)</span>
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

// Form submission will be handled in setupFormEventListener()

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

// Clear form - will be handled in setupClearButtonEventListener()

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

// PIN/Passkey System
const DEFAULT_PIN = '132435';
let currentPIN = localStorage.getItem('userPIN') || DEFAULT_PIN;
let isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - initializing authentication...');
    console.log('Is authenticated:', isAuthenticated);
    console.log('Current PIN:', currentPIN);
    
    // Initialize login functionality first with delay to ensure elements exist
    setTimeout(() => {
        console.log('Attempting to initialize login...');
        initializeLogin();
    }, 200);
    
    if (isAuthenticated) {
        console.log('User is authenticated, showing main app...');
        showMainApp();
        // Initialize main app after content is rendered
        setTimeout(() => {
            initializeMainApp();
        }, 300);
    } else {
        console.log('User not authenticated, showing login overlay...');
        showLoginOverlay();
    }
});

function initializeLogin() {
    console.log('=== INITIALIZING LOGIN ===');
    
    const pinInput = document.getElementById('pinInput');
    const loginBtn = document.getElementById('loginBtn');
    const togglePinBtn = document.getElementById('togglePinVisibility');
    const loginError = document.getElementById('loginError');

    // Check if elements exist
    console.log('Login elements check:');
    console.log('- pinInput:', pinInput ? 'FOUND' : 'NOT FOUND');
    console.log('- loginBtn:', loginBtn ? 'FOUND' : 'NOT FOUND');
    console.log('- togglePinBtn:', togglePinBtn ? 'FOUND' : 'NOT FOUND');
    console.log('- loginError:', loginError ? 'FOUND' : 'NOT FOUND');

    if (!pinInput || !loginBtn || !togglePinBtn || !loginError) {
        console.error('❌ Login elements not found!');
        // Retry after a delay
        setTimeout(() => {
            console.log('🔄 Retrying login initialization...');
            initializeLogin();
        }, 500);
        return;
    }

    console.log('✅ All login elements found, setting up handlers...');

    // Remove any existing listeners first
    const newLoginBtn = loginBtn.cloneNode(true);
    loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
    
    const newToggleBtn = togglePinBtn.cloneNode(true);
    togglePinBtn.parentNode.replaceChild(newToggleBtn, togglePinBtn);

    // Get references to new elements
    const freshLoginBtn = document.getElementById('loginBtn');
    const freshToggleBtn = document.getElementById('togglePinVisibility');

    // Toggle PIN visibility
    freshToggleBtn.onclick = function() {
        console.log('👁️ Toggle PIN visibility clicked');
        if (pinInput.type === 'password') {
            pinInput.type = 'text';
            freshToggleBtn.textContent = '🙈';
        } else {
            pinInput.type = 'password';
            freshToggleBtn.textContent = '👁️';
        }
    };

    // Handle Enter key press
    pinInput.onkeypress = function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            console.log('⌨️ Enter key pressed, attempting login...');
            attemptLogin();
        }
        
        // Hide error message when typing
        if (loginError.style.display !== 'none') {
            loginError.style.display = 'none';
        }
    };

    // Login button click
    freshLoginBtn.onclick = function() {
        console.log('🔘 Login button clicked, attempting login...');
        attemptLogin();
    };

    // Also add addEventListener as backup
    freshLoginBtn.addEventListener('click', function() {
        console.log('🔘 Login button addEventListener triggered');
        attemptLogin();
    });

    freshToggleBtn.addEventListener('click', function() {
        console.log('👁️ Toggle addEventListener triggered');
        if (pinInput.type === 'password') {
            pinInput.type = 'text';
            freshToggleBtn.textContent = '🙈';
        } else {
            pinInput.type = 'password';
            freshToggleBtn.textContent = '👁️';
        }
    });

    // Focus on PIN input
    setTimeout(() => {
        pinInput.focus();
        console.log('🎯 PIN input focused');
    }, 100);
    
    console.log('✅ Login initialization complete!');
}

function attemptLogin() {
    console.log('attemptLogin function called');
    
    const pinInput = document.getElementById('pinInput');
    const loginError = document.getElementById('loginError');
    
    if (!pinInput || !loginError) {
        console.error('Login elements not found in attemptLogin');
        return;
    }
    
    const enteredPIN = pinInput.value.trim();
    console.log('Entered PIN length:', enteredPIN.length);
    console.log('Current PIN:', currentPIN);
    console.log('PIN match:', enteredPIN === currentPIN);

    if (enteredPIN === currentPIN) {
        console.log('Login successful!');
        
        // Successful login
        sessionStorage.setItem('isAuthenticated', 'true');
        isAuthenticated = true;
        
        // Hide login overlay with animation
        const loginOverlay = document.getElementById('loginOverlay');
        if (loginOverlay) {
            loginOverlay.style.animation = 'slideOutUp 0.5s ease-out';
        }
        
        setTimeout(() => {
            if (loginOverlay) {
                loginOverlay.style.display = 'none';
            }
            showMainApp();
            // Initialize main app after content is rendered
            setTimeout(() => {
                initializeMainApp();
                showSuccessAlert('Login berhasil! Selamat datang di Motion Garage System.');
            }, 100);
        }, 500);
    } else {
        console.log('Login failed - incorrect PIN');
        
        // Failed login
        loginError.style.display = 'block';
        pinInput.value = '';
        pinInput.focus();
        
        // Add shake animation to container
        const loginContainer = document.querySelector('.login-container');
        if (loginContainer) {
            loginContainer.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                loginContainer.style.animation = '';
            }, 500);
        }
    }
}

function showLoginOverlay() {
    const loginOverlay = document.getElementById('loginOverlay');
    const mainApp = document.getElementById('mainApp');
    
    loginOverlay.style.display = 'flex';
    mainApp.innerHTML = ''; // Clear main app content
}

function showMainApp() {
    const loginOverlay = document.getElementById('loginOverlay');
    const mainApp = document.getElementById('mainApp');
    
    loginOverlay.style.display = 'none';
    
    // Render main app content dinamis hanya setelah login berhasil
    mainApp.innerHTML = getMainAppHTML();
    mainApp.style.display = 'block';
}

function logout() {
    sessionStorage.removeItem('isAuthenticated');
    isAuthenticated = false;
    
    // Clear main app content completely
    const mainApp = document.getElementById('mainApp');
    mainApp.innerHTML = '';
    
    showLoginOverlay();
    
    // Clear PIN input
    const pinInput = document.getElementById('pinInput');
    if (pinInput) {
        pinInput.value = '';
        pinInput.focus();
    }
    
    showSuccessAlert('Berhasil logout. Silakan login kembali untuk mengakses sistem.');
}

function changePIN() {
    if (!isAuthenticated) {
        showErrorAlert('Anda harus login terlebih dahulu.');
        return;
    }

    const currentPinPrompt = prompt('Masukkan PIN saat ini:');
    if (currentPinPrompt !== currentPIN) {
        showErrorAlert('PIN saat ini salah.');
        return;
    }

    const newPIN = prompt('Masukkan PIN baru (6 digit):');
    if (!newPIN || newPIN.length !== 6 || !/^\d{6}$/.test(newPIN)) {
        showErrorAlert('PIN harus terdiri dari 6 digit angka.');
        return;
    }

    const confirmPIN = prompt('Konfirmasi PIN baru:');
    if (newPIN !== confirmPIN) {
        showErrorAlert('Konfirmasi PIN tidak cocok.');
        return;
    }

    // Save new PIN
    localStorage.setItem('userPIN', newPIN);
    currentPIN = newPIN;
    showSuccessAlert('PIN berhasil diubah!');
}

// Add logout and change PIN buttons to the app
function addSecurityControls() {
    // Add security controls to header
    const header = document.querySelector('header');
    if (header && !header.querySelector('.security-controls')) {
        const securityControls = document.createElement('div');
        securityControls.className = 'security-controls';
        securityControls.innerHTML = `
            <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button type="button" id="changePinBtn" class="btn btn-secondary" style="display: none; font-size: 0.9rem; padding: 8px 15px;">
                    🔑 Ubah PIN
                </button>
                <button type="button" id="logoutBtn" class="btn btn-danger" style="font-size: 0.9rem; padding: 8px 15px;">
                    🚪 Logout
                </button>
            </div>
        `;
        header.appendChild(securityControls);

        // Add event listeners
        // document.getElementById('changePinBtn').addEventListener('click', changePIN);
        document.getElementById('logoutBtn').addEventListener('click', logout);
    }
}

function initializeMainApp() {
    // Add security controls
    addSecurityControls();
    
    // Continue with existing initialization
    console.log('Initializing main app...');
    
    // Initialize DOM elements first
    initializeDOMElements();
    
    // Initialize alert close buttons
    initializeAlertCloseButtons();
    
    // Initialize image upload
    initializeImageUpload();
    
    // Initialize elements first
    initializePengerjaanElements();
    
    // Wait a bit to ensure all elements are loaded, then setup handlers
    setTimeout(function() {
        console.log('Setting up pengerjaan handlers...');
        setupPengerjaanHandlers();
        
        displayData();
    }, 200);
    
    // Additional retry mechanism for critical elements
    setTimeout(function() {
        if (!addPengerjaanBtn || !partNameInput) {
            console.log('Retrying element initialization...');
            initializePengerjaanElements();
            setupPengerjaanHandlers();
        }
    }, 500);
}

// Template untuk main app content - hanya di-render setelah login berhasil
function getMainAppHTML() {
    return `
        <div class="container">
            <header>
                <h1>📋 Motion Garage Invoice Data Entry System</h1>
                <p>Input data invoice dan export ke format CSV untuk Discord</p>
            </header>

            <div style="padding: 30px 60px 0px 60px">
                <div class="animated-announcement">
                    Harga Part Baru!!!!
                </div>
            </div>

            <div class="form-container">
                <form id="invoiceForm">
                    <div class="section">
                        <h2>📝 Data Invoice</h2>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="nomor">Nomor:</label>
                                <input type="number" id="nomor" name="nomor" required>
                            </div>
                            <div class="form-group">
                                <label for="namaClient">Nama Client:</label>
                                <input type="text" id="namaClient" name="namaClient" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="jenisKendaraan">Jenis Kendaraan:</label>
                                <input type="text" id="jenisKendaraan" name="jenisKendaraan" required>
                            </div>
                            <div class="form-group">
                                <label for="namaMontir">Nama Montir:</label>
                                <input type="text" id="namaMontir" name="namaMontir" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="pengerjaan">Pengerjaan:</label>
                                <div class="pengerjaan-container">
                                    <div class="manual-pengerjaan-container">
                                        
                                        <div class="input-row">
                                            <div class="input-group">
                                                <label for="partName">Nama Part/Service:</label>
                                                <input type="text" id="partName" placeholder="Masukkan nama part atau service..." class="part-input">
                                            </div>
                                            <div class="input-group">
                                                <label for="partPrice">Harga Part ($):</label>
                                                <input type="number" id="partPrice" placeholder="0.00" step="0.01" min="0" class="price-input">
                                            </div>
                                        </div>
                                        <div class="input-row">
                                            <div class="input-group">
                                                <label for="servicePrice">Harga Final - Service (Auto: Part × 1.5):</label>
                                                <input type="number" id="servicePrice" placeholder="0.00" step="0.01" min="0" class="price-input" readonly>
                                            </div>
                                            <div class="input-group">
                                                <label for="itemQuantity">Quantity:</label>
                                                <input type="number" id="itemQuantity" value="1" min="1" max="99" class="quantity-input">
                                            </div>
                                        </div>
                                        <div class="pengerjaan-controls">
                                            <button type="button" id="addPengerjaan" class="add-btn">➕ Tambah Item</button>
                                            <button type="button" id="resetManualForm" class="reset-btn">🔄 Reset Form</button>
                                        </div>
                                    </div>
                                </div>
                                <textarea id="pengerjaan" name="pengerjaan" rows="4" placeholder="Daftar pengerjaan akan muncul di sini..." required readonly></textarea>
                                <div class="pengerjaan-actions">
                                    <button type="button" id="clearPengerjaan" class="clear-btn">🗑️ Clear All</button>
                                    <span id="totalHarga" class="total-harga">Total: $0</span>
                                </div>
                                <div id="selectedItems" class="selected-items"></div>
                            </div>
                            <div class="form-group">
                                <label for="modal">Modal:</label>
                                <input type="number" id="modal" name="modal" step="0.01" value="0" required>
                            </div>
                            <div class="form-group">
                                <label for="billScreenshot">📸 Upload Bill Screenshot:</label>
                                <div class="file-upload-container">
                                    <input type="file" id="billScreenshot" name="billScreenshot" accept="image/*" class="file-input">
                                    <div class="file-upload-display">
                                        <div id="imagePreview" class="image-preview" style="display: none;">
                                            <img id="previewImg" src="" alt="Preview">
                                            <button type="button" id="removeImage" class="remove-image-btn">❌ Remove</button>
                                        </div>
                                        <div id="uploadPrompt" class="upload-prompt">
                                            <span>📁 Pilih file gambar atau drag & drop di sini</span>
                                            <small>Format: JPG, PNG, GIF (Max: 5MB)</small>
                                            <small style="display: block; margin-top: 5px; color: #667eea;">
                                                ⌨️ Atau tekan <strong>Ctrl+V</strong> untuk paste screenshot
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="taxRate">Tax Rate (%):</label>
                                <input type="number" id="taxRate" name="taxRate" step="0.01" value="5" min="0" max="100" required>
                            </div>
                            <div class="form-group">
                                <label for="subtotal">Subtotal:</label>
                                <input type="number" id="subtotal" name="subtotal" step="0.01" readonly>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="taxAmount">Tax Amount:</label>
                                <input type="number" id="taxAmount" name="taxAmount" step="0.01" readonly>
                            </div>
                            <div class="form-group">
                                <label for="totalInvoice">Total Invoice:</label>
                                <input type="number" id="totalInvoice" name="totalInvoice" step="0.01" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="billNumber">💳 Bill Number (Optional):</label>
                                <input type="text" id="billNumber" name="billNumber" placeholder="Masukkan nomor bill dari game...">
                                <small style="color: #666; font-size: 12px; margin-top: 5px; display: block;">
                                    Bill number bisa diedit setelah data disimpan sebelum di-copy
                                </small>
                            </div>
                        </div>
                    </div>

                    <div class="button-group">
                        <button type="submit" class="btn btn-primary">💾 Simpan Data</button>
                        <button type="button" id="clearBtn" class="btn btn-danger">🗑️ Clear Form</button>
                    </div>
                </form>
            </div>

            <div class="data-container">
                <div style="display: flex; justify-content: space-between; align-items: center">
                    <h2>📊 Data Tersimpan</h2>
                    <button id="deleteAllBtn" class="btn btn-danger" style="margin-left: auto; margin-bottom: 15px;">🗑️ Hapus Semua Data</button>
                </div>
                <div id="dataTable"></div>
            </div>

            <div class="export-container">
                <h2>📋 Export Options</h2>
                <div class="export-options">
                    <div class="export-section">
                        <h3>📝 Export Data Individual</h3>
                        <p>Untuk export data individual, gunakan tombol <strong>"📋 Copy ke Discord"</strong> pada setiap data di atas.</p>
                        <p>Format yang akan di-copy:</p>
                        <pre class="format-example">\`\`\`css
Nomor           : 3
Nama Client     : William Lottin
Jenis Kendaraan : mobil

Nama Montir     : Gobi Alexander
Pengerjaan      : VEHICLE WHEELS 1, Extras
Modal           : 0
Bill Number     : BILL123456

Subtotal        : $540.00
Tax Rate        : 5.00%
Tax Amount      : $27.00
Total Invoice   : $567.00\`\`\`</pre>
                    </div>
                </div>
            </div>
            <div class="footer">
                <p>© 2025 Motion Garage | Diaz Ardian. All rights reserved.</p>
                <p>Created by <a href="https://github.com/diazardian" target="_blank">Gobi Alexander | Diaz Ardian</a></p>
            </div>
        </div>

        <!-- for alert -->
        <div>
            <div id="alert" class="alert">
                <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                <strong>Info!</strong> Data berhasil disimpan.
            </div>
            <div id="alertError" class="alert error">
                <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                <strong>Error!</strong> Terjadi kesalahan saat menyimpan data.
            </div>
            <div id="alertExport" class="alert export">
                <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                <strong>Exported!</strong> Data berhasil diexport ke CSV.
            </div>
        </div>
    `;
}

// PIN/Passkey System