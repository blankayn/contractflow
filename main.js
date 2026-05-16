// Main Application Logic for ContractFlow

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    
    // Page specific initializers
    if (document.getElementById('contractForm')) {
        initContractForm();
    }
    
    if (document.getElementById('contractsTableBody')) {
        renderDashboard();
    }
});

// Navigation UI Helper
function initNavigation() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Contract Form Logic
function initContractForm() {
    const form = document.getElementById('contractForm');
    const previewBtn = document.getElementById('previewBtn');
    const previewModal = document.getElementById('previewModal');
    const closeModal = document.getElementById('closeModal');
    const confirmSend = document.getElementById('confirmSend');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');

    // Drag and Drop
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent)';
        dropZone.style.background = 'rgba(59, 130, 246, 0.05)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'var(--secondary-bg)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });

    function handleFiles(files) {
        fileList.innerHTML = '';
        if (files.length > 0) {
            const list = document.createElement('ul');
            Array.from(files).forEach(file => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fa-solid fa-file"></i> ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
                list.appendChild(li);
            });
            fileList.appendChild(list);
        }
    }

    // Preview Logic
    previewBtn.addEventListener('click', () => {
        const name = document.getElementById('fullName').value;
        const details = document.getElementById('contractDetails').value;
        
        if (!name || !details) {
            alert('Please fill in the required fields before previewing.');
            return;
        }

        const previewContent = document.getElementById('previewContent');
        previewContent.innerHTML = `
            <div style="font-family: serif; color: #ffffff;">
                <h1 style="text-align: center; border-bottom: 2px solid #00d9ff; padding-bottom: 1rem; margin-bottom: 2rem; color: #ffffff;">SERVICE AGREEMENT</h1>
                <p>This agreement is made between <strong>ContractFlow (Provider)</strong> and <strong>${name} (Recipient)</strong>.</p>
                <div style="margin: 2rem 0; white-space: pre-wrap; line-height: 1.6;">${details}</div>
                <div style="margin-top: 4rem; display: flex; justify-content: space-between;">
                    <div style="border-top: 2px solid #00d9ff; width: 200px; padding-top: 0.5rem; color: #a0aec0;">Provider Signature</div>
                    <div style="border-top: 2px solid #00d9ff; width: 200px; padding-top: 0.5rem; color: #a0aec0;">Recipient Signature</div>
                </div>
            </div>
        `;
        
        previewModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        previewModal.style.display = 'none';
    });

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveContract();
    });

    confirmSend.addEventListener('click', () => {
        saveContract();
    });

    function saveContract() {
        const name = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const details = document.getElementById('contractDetails').value;

        const newContract = {
            id: Date.now(),
            name,
            email,
            details,
            status: 'Sent',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        const existingContracts = JSON.parse(localStorage.getItem('contracts') || '[]');
        existingContracts.unshift(newContract);
        localStorage.setItem('contracts', JSON.stringify(existingContracts));

        alert('Contract sent successfully!');
        window.location.href = 'dashboard.html';
    }
}

// Dashboard Rendering Logic
function renderDashboard() {
    const tableBody = document.getElementById('contractsTableBody');
    const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');

    if (contracts.length === 0) {
        // Keep default empty state or show placeholder
        return;
    }

    tableBody.innerHTML = '';
    contracts.forEach(contract => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: 600;">${contract.name}</td>
            <td style="color: var(--text-muted);">${contract.email}</td>
            <td><span class="status-pill status-sent">${contract.status}</span></td>
            <td style="color: var(--text-muted);">${contract.date}</td>
            <td>
                <button class="btn btn-secondary" style="padding: 0.4rem 0.75rem; font-size: 0.8125rem;" onclick="viewContract(${contract.id})">
                    <i class="fa-solid fa-eye"></i> View
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Global helper for dashboard actions
window.viewContract = function(id) {
    const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
    const contract = contracts.find(c => c.id === id);
    if (contract) {
        alert(`Viewing contract for ${contract.name}\n\nDetails:\n${contract.details}`);
    }
};
