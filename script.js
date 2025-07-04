// Data storage
let invoiceData = JSON.parse(localStorage.getItem('invoiceData')) || [];

// DOM elements
const form = document.getElementById('invoiceForm');
const dataTable = document.getElementById('dataTable');
const csvOutput = document.getElementById('csvOutput');
const exportBtn = document.getElementById('exportBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');

// Pengerjaan elements
let pengerjaanSelect, pengerjaanTextarea, addPengerjaanBtn, clearPengerjaanBtn, totalHargaSpan, itemQuantityInput, selectedItemsDiv, searchInput, clearSearchBtn;

// Initialize pengerjaan elements
function initializePengerjaanElements() {
    pengerjaanSelect = document.getElementById('pengerjaanSelect');
    pengerjaanTextarea = document.getElementById('pengerjaan');
    addPengerjaanBtn = document.getElementById('addPengerjaan');
    clearPengerjaanBtn = document.getElementById('clearPengerjaan');
    totalHargaSpan = document.getElementById('totalHarga');
    itemQuantityInput = document.getElementById('itemQuantity');
    selectedItemsDiv = document.getElementById('selectedItems');
    searchInput = document.getElementById('searchPengerjaan');
    clearSearchBtn = document.getElementById('clearSearch');
}

// Arrays untuk menyimpan pengerjaan dan harga
let selectedPengerjaan = [];
let totalHarga = 0;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Initialize elements first
    initializePengerjaanElements();
    
    // Wait a bit to ensure all elements are loaded
    setTimeout(function() {
        console.log('Setting up pengerjaan handlers...');
        setupPengerjaanHandlers();
        
        // Test elements
        // console.log('pengerjaanSelect:', pengerjaanSelect);
        // console.log('addPengerjaanBtn:', addPengerjaanBtn);
        // console.log('clearPengerjaanBtn:', clearPengerjaanBtn);
        // console.log('pengerjaanTextarea:', pengerjaanTextarea);
        // console.log('totalHargaSpan:', totalHargaSpan);
        
        displayData();
        // generateCSV();
    }, 100);
});

// Setup pengerjaan handlers
function setupPengerjaanHandlers() {
    // Check if elements exist
    if (!addPengerjaanBtn || !clearPengerjaanBtn || !pengerjaanSelect) {
        console.error('Pengerjaan elements not found');
        return;
    }
    
    // Add pengerjaan
    addPengerjaanBtn.addEventListener('click', function() {
        console.log('Add button clicked');
        const selectedOptions = Array.from(pengerjaanSelect.selectedOptions);
        const quantity = parseInt(itemQuantityInput.value) || 1;
        
        if (selectedOptions.length === 0) {
            alert('Silakan pilih item pengerjaan terlebih dahulu!');
            return;
        }
        
        selectedOptions.forEach(option => {
            addPengerjaanItem(option.value, quantity);
        });
        
        // Clear selection
        pengerjaanSelect.selectedIndex = -1;
        itemQuantityInput.value = 1;
    });
    
    // Clear pengerjaan
    clearPengerjaanBtn.addEventListener('click', function() {
        console.log('Clear button clicked');
        selectedPengerjaan = [];
        totalHarga = 0;
        updatePengerjaanDisplay();
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
}

// Add pengerjaan item
function addPengerjaanItem(value, quantity = 1) {
    console.log('Adding pengerjaan item:', value, 'quantity:', quantity);
    
    // Extract nama dan harga dari value (format: "NAMA|HARGA")
    const parts = value.split('|');
    if (parts.length !== 2) {
        console.error('Invalid format:', value);
        alert('Format tidak valid. Pastikan format: "NAMA|HARGA"');
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
    
    // Auto-update total invoice
    const totalInvoiceInput = document.getElementById('totalInvoice');
    if (totalInvoiceInput) {
        totalInvoiceInput.value = totalHarga.toFixed(2);
    }
    
    // Update selected items display
    updateSelectedItemsDisplay();
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
    
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Add timestamp
    data.timestamp = new Date().toISOString();
    data.id = Date.now().toString();
    
    // Format currency
    data.modal = parseFloat(data.modal).toFixed(2);
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
    
    // Reset form
    form.reset();
    
    // Reset modal to 0
    document.getElementById('modal').value = '0';
    
    // Reset pengerjaan
    selectedPengerjaan = [];
    totalHarga = 0;
    updatePengerjaanDisplay();
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
        
        html += `
            <div class="data-item">
                <div class="data-header">
                    <div><strong>Nomor: ${item.nomor}</strong></div>
                    <div><strong>Client: ${item.namaClient}</strong></div>
                    <div><strong>Total: $${item.totalInvoice}</strong></div>
                    <div class="action-buttons">
                        <button class="export-single-btn" onclick="exportSingleData(${index})">📋 Copy ke Discord</button>
                        <button class="delete-btn" onclick="deleteItem(${index})">🗑️ Hapus</button>
                    </div>
                </div>
                <div class="data-content">
                    <div><strong>Kendaraan:</strong> ${item.jenisKendaraan}</div>
                    <div><strong>Montir:</strong> ${item.namaMontir}</div>
                    <div><strong>Pengerjaan:</strong> ${item.pengerjaan}</div>
                    <div><strong>Modal:</strong> $${item.modal}</div>
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
    
    if (confirm('Apakah Anda yakin ingin menghapus semua data form?')) {
        form.reset();
        
        // Reset modal to 0
        document.getElementById('modal').value = '0';
        
        // Reset pengerjaan
        selectedPengerjaan = [];
        totalHarga = 0;
        updatePengerjaanDisplay();
        
        showSuccessMessage('Form berhasil di-reset!');
    }
});

// Delete item function
function deleteItem(index) {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        invoiceData.splice(index, 1);
        localStorage.setItem('invoiceData', JSON.stringify(invoiceData));
        displayData();
        generateCSV();
        showSuccessMessage('Data berhasil dihapus!');
    }
}

// Show success message
function showSuccessMessage(message) {
    // Remove existing message
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message show';
    messageDiv.textContent = message;
    
    // Insert at top of form container
    const formContainer = document.querySelector('.form-container');
    formContainer.insertBefore(messageDiv, formContainer.firstChild);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        messageDiv.classList.remove('show');
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, 3000);
}

// Export single data for Discord
function exportSingleData(index) {
    const item = invoiceData[index];
    
    const discordFormat = `\`\`\`Nomor           : ${item.nomor}
Nama Client     : ${item.namaClient}
Jenis Kendaraan : ${item.jenisKendaraan}

Nama Montir     : ${item.namaMontir}
Pengerjaan      : ${item.pengerjaan}
Modal           : ${item.modal}
Total Invoice   : $${item.totalInvoice}\`\`\``;
    
    // Copy to clipboard
    try {
        navigator.clipboard.writeText(discordFormat).then(function() {
            showSuccessMessage(`Data ${item.namaClient} berhasil di-copy untuk Discord!`);
        }).catch(function() {
            // Fallback method
            const textArea = document.createElement('textarea');
            textArea.value = discordFormat;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showSuccessMessage(`Data ${item.namaClient} berhasil di-copy untuk Discord!`);
        });
    } catch (err) {
        // Show in textarea for manual copy
        // csvOutput.value = discordFormat;
        showSuccessMessage(`Format Discord untuk ${item.namaClient} ditampilkan di textarea. Silakan copy manual.`);
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
