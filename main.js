// Main Application Logic for ContractFlow Lending Platform

const LOAN_REQUESTS_KEY = 'loanRequests';
const LOAN_DRAFT_KEY = 'loanApplicationDraft';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();

    if (document.getElementById('loanApplicationForm')) {
        initLoanApplicationForm();
    }

    if (document.getElementById('loanRequestsTableBody')) {
        renderLenderDashboard();
    }
});

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

function initLoanApplicationForm() {
    const form = document.getElementById('loanApplicationForm');
    const previewBtn = document.getElementById('previewBtn');
    const previewModal = document.getElementById('previewModal');
    const closeModal = document.getElementById('closeModal');
    const confirmSend = document.getElementById('confirmSend');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const draftStatus = document.getElementById('draftStatus');

    const fields = {
        fullName: document.getElementById('fullName'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        idType: document.getElementById('idType'),
        idNumber: document.getElementById('idNumber'),
        employmentStatus: document.getElementById('employmentStatus'),
        monthlyIncome: document.getElementById('monthlyIncome'),
        loanAmount: document.getElementById('loanAmount'),
        interestRate: document.getElementById('interestRate'),
        repaymentMonths: document.getElementById('repaymentMonths'),
        address: document.getElementById('address'),
        loanPurpose: document.getElementById('loanPurpose'),
        termsAccepted: document.getElementById('termsAccepted')
    };

    let statusTimer;
    let selectedFiles = [];

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', event => {
        event.preventDefault();
        dropZone.style.borderColor = 'var(--accent-light)';
        dropZone.style.background = 'rgba(0, 217, 255, 0.15)';
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--accent)';
        dropZone.style.background = 'rgba(0, 217, 255, 0.05)';
    });
    dropZone.addEventListener('drop', event => {
        event.preventDefault();
        handleFiles(event.dataTransfer.files);
    });
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    function setDraftStatus(message, persist = false) {
        draftStatus.textContent = message;
        if (statusTimer) {
            clearTimeout(statusTimer);
        }
        if (!persist) {
            statusTimer = setTimeout(() => {
                draftStatus.textContent = '';
            }, 2500);
        }
    }

    function handleFiles(files) {
        selectedFiles = Array.from(files).slice(0, 10);
        fileList.innerHTML = '';
        if (selectedFiles.length === 0) {
            return;
        }

        const list = document.createElement('ul');
        selectedFiles.forEach(file => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fa-solid fa-file"></i> ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
            list.appendChild(li);
        });
        fileList.appendChild(list);
    }

    function getFormData() {
        return {
            fullName: fields.fullName.value.trim(),
            email: fields.email.value.trim(),
            phone: fields.phone.value.trim(),
            idType: fields.idType.value,
            idNumber: fields.idNumber.value.trim(),
            employmentStatus: fields.employmentStatus.value,
            monthlyIncome: Number(fields.monthlyIncome.value),
            loanAmount: Number(fields.loanAmount.value),
            interestRate: Number(fields.interestRate.value),
            repaymentMonths: Number(fields.repaymentMonths.value),
            address: fields.address.value.trim(),
            loanPurpose: fields.loanPurpose.value.trim(),
            termsAccepted: fields.termsAccepted.checked,
            uploadedFiles: selectedFiles.map(file => file.name)
        };
    }

    function saveDraft(showStatus = false) {
        const draft = getFormData();
        localStorage.setItem(LOAN_DRAFT_KEY, JSON.stringify({
            ...draft,
            updatedAt: Date.now()
        }));
        if (showStatus) {
            setDraftStatus('Draft saved');
        }
    }

    function restoreDraft() {
        const draft = JSON.parse(localStorage.getItem(LOAN_DRAFT_KEY) || 'null');
        if (!draft) {
            return;
        }

        fields.fullName.value = draft.fullName || '';
        fields.email.value = draft.email || '';
        fields.phone.value = draft.phone || '';
        fields.idType.value = draft.idType || '';
        fields.idNumber.value = draft.idNumber || '';
        fields.employmentStatus.value = draft.employmentStatus || '';
        fields.monthlyIncome.value = draft.monthlyIncome || '';
        fields.loanAmount.value = draft.loanAmount || '';
        fields.interestRate.value = draft.interestRate || '';
        fields.repaymentMonths.value = draft.repaymentMonths || '';
        fields.address.value = draft.address || '';
        fields.loanPurpose.value = draft.loanPurpose || '';
        fields.termsAccepted.checked = Boolean(draft.termsAccepted);

        if (Array.isArray(draft.uploadedFiles) && draft.uploadedFiles.length > 0) {
            fileList.innerHTML = `<ul>${draft.uploadedFiles.map(file => `<li><i class="fa-solid fa-file"></i> ${file}</li>`).join('')}</ul>`;
        }

        setDraftStatus('Draft restored', true);
    }

    function setFieldError(fieldKey, message) {
        const field = fields[fieldKey];
        const errorElement = document.getElementById(`${fieldKey}Error`);
        if (!field || !errorElement) {
            return;
        }
        if (message) {
            field.classList.add('has-error');
            errorElement.textContent = message;
            return;
        }
        field.classList.remove('has-error');
        errorElement.textContent = '';
    }

    function validateForm() {
        const data = getFormData();
        let valid = true;

        if (data.fullName.length < 2) {
            setFieldError('fullName', 'Borrower full name is required.');
            valid = false;
        } else {
            setFieldError('fullName', '');
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(data.email)) {
            setFieldError('email', 'A valid email address is required.');
            valid = false;
        } else if (!data.email.toLowerCase().endsWith('@gmail.com')) {
            setFieldError('email', 'Please enter a Gmail address for contract delivery.');
            valid = false;
        } else {
            setFieldError('email', '');
        }

        if (data.phone.length < 8) {
            setFieldError('phone', 'Contact number is required.');
            valid = false;
        } else {
            setFieldError('phone', '');
        }

        if (!data.idType) {
            setFieldError('idType', 'Select a valid ID type.');
            valid = false;
        } else {
            setFieldError('idType', '');
        }

        if (data.idNumber.length < 4) {
            setFieldError('idNumber', 'Valid ID number is required.');
            valid = false;
        } else {
            setFieldError('idNumber', '');
        }

        if (!data.employmentStatus) {
            setFieldError('employmentStatus', 'Select employment status.');
            valid = false;
        } else {
            setFieldError('employmentStatus', '');
        }

        if (!Number.isFinite(data.monthlyIncome) || data.monthlyIncome <= 0) {
            setFieldError('monthlyIncome', 'Monthly income must be greater than 0.');
            valid = false;
        } else {
            setFieldError('monthlyIncome', '');
        }

        if (!Number.isFinite(data.loanAmount) || data.loanAmount < 100) {
            setFieldError('loanAmount', 'Loan amount must be at least 100.');
            valid = false;
        } else {
            setFieldError('loanAmount', '');
        }

        if (!Number.isFinite(data.interestRate) || data.interestRate < 0 || data.interestRate > 100) {
            setFieldError('interestRate', 'Interest rate must be between 0 and 100.');
            valid = false;
        } else {
            setFieldError('interestRate', '');
        }

        if (!Number.isInteger(data.repaymentMonths) || data.repaymentMonths < 1) {
            setFieldError('repaymentMonths', 'Select repayment term.');
            valid = false;
        } else {
            setFieldError('repaymentMonths', '');
        }

        if (data.address.length < 8) {
            setFieldError('address', 'Complete address is required.');
            valid = false;
        } else {
            setFieldError('address', '');
        }

        if (data.loanPurpose.length < 20) {
            setFieldError('loanPurpose', 'Loan purpose must be at least 20 characters.');
            valid = false;
        } else {
            setFieldError('loanPurpose', '');
        }

        if (!data.termsAccepted) {
            setFieldError('termsAccepted', 'You must agree to the lending terms.');
            valid = false;
        } else {
            setFieldError('termsAccepted', '');
        }

        return valid;
    }

    function renderPreview() {
        const data = getFormData();
        const previewContent = document.getElementById('previewContent');
        previewContent.innerHTML = `
            <div style="font-family: serif; color: #ffffff;">
                <h1 style="text-align:center; border-bottom: 2px solid #00d9ff; padding-bottom: 1rem; margin-bottom: 1.5rem;">LOAN APPLICATION SUMMARY</h1>
                <p><strong>Borrower:</strong> ${escapeHtml(data.fullName)}</p>
                <p><strong>Gmail:</strong> ${escapeHtml(data.email)}</p>
                <p><strong>Contact:</strong> ${escapeHtml(data.phone)}</p>
                <p><strong>Loan Amount:</strong> ${formatCurrency(data.loanAmount)}</p>
                <p><strong>Interest Rate:</strong> ${data.interestRate.toFixed(2)}% per annum</p>
                <p><strong>Repayment Term:</strong> ${data.repaymentMonths} months</p>
                <p><strong>Monthly Income:</strong> ${formatCurrency(data.monthlyIncome)}</p>
                <p><strong>ID:</strong> ${escapeHtml(data.idType)} - ${escapeHtml(data.idNumber)}</p>
                <p><strong>Employment:</strong> ${escapeHtml(data.employmentStatus)}</p>
                <p><strong>Address:</strong> ${escapeHtml(data.address)}</p>
                <p style="margin-top: 1rem;"><strong>Loan Purpose</strong></p>
                <p style="white-space: pre-wrap;">${escapeHtml(data.loanPurpose)}</p>
            </div>
        `;
        previewModal.style.display = 'flex';
    }

    function submitLoanRequest() {
        if (!validateForm()) {
            return;
        }

        const data = getFormData();
        const loanRequests = JSON.parse(localStorage.getItem(LOAN_REQUESTS_KEY) || '[]');
        loanRequests.unshift({
            id: Date.now(),
            ...data,
            status: 'Pending Review',
            createdAt: new Date().toISOString(),
            contractSent: false
        });
        localStorage.setItem(LOAN_REQUESTS_KEY, JSON.stringify(loanRequests));
        localStorage.removeItem(LOAN_DRAFT_KEY);

        alert('Loan application submitted successfully. The lender will review your request.');
        window.location.href = 'dashboard.html';
    }

    Object.entries(fields).forEach(([key, field]) => {
        const eventName = field.type === 'checkbox' ? 'change' : 'input';
        field.addEventListener(eventName, () => {
            setFieldError(key, '');
            saveDraft(true);
        });
    });

    previewBtn.addEventListener('click', () => {
        if (!validateForm()) {
            return;
        }
        renderPreview();
    });

    closeModal.addEventListener('click', () => {
        previewModal.style.display = 'none';
    });

    confirmSend.addEventListener('click', () => {
        submitLoanRequest();
    });

    form.addEventListener('submit', event => {
        event.preventDefault();
        submitLoanRequest();
    });

    setInterval(() => saveDraft(false), 5000);
    restoreDraft();
}

function renderLenderDashboard() {
    const tableBody = document.getElementById('loanRequestsTableBody');
    const loanRequests = JSON.parse(localStorage.getItem(LOAN_REQUESTS_KEY) || '[]');

    if (loanRequests.length === 0) {
        return;
    }

    tableBody.innerHTML = '';
    loanRequests.forEach(request => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(request.fullName)}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(request.email)}</div>
            </td>
            <td>${formatCurrency(request.loanAmount)}</td>
            <td>${request.repaymentMonths} months</td>
            <td>${Number(request.interestRate).toFixed(2)}%</td>
            <td><span class="status-pill ${getStatusClass(request.status)}">${escapeHtml(request.status)}</span></td>
            <td>${formatDate(request.createdAt)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-secondary action-btn" onclick="viewLoanRequest(${request.id})"><i class="fa-solid fa-eye"></i> View</button>
                    <button class="btn btn-primary action-btn" onclick="approveLoanRequest(${request.id})"><i class="fa-solid fa-check"></i> Approve</button>
                    <button class="btn btn-secondary action-btn reject-btn" onclick="rejectLoanRequest(${request.id})"><i class="fa-solid fa-xmark"></i> Reject</button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function getStatusClass(status) {
    if (status === 'Approved') {
        return 'status-approved';
    }
    if (status === 'Rejected') {
        return 'status-rejected';
    }
    return 'status-pending';
}

function getContractSummary(request) {
    const principal = Number(request.loanAmount);
    const annualRate = Number(request.interestRate) / 100;
    const months = Number(request.repaymentMonths);
    const totalInterest = principal * annualRate * (months / 12);
    const totalRepayment = principal + totalInterest;
    const monthlyPayment = totalRepayment / months;
    const scheduleLines = [];

    for (let i = 1; i <= months; i += 1) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        scheduleLines.push(`Installment ${i}: ${formatCurrency(monthlyPayment)} due on ${dueDate.toLocaleDateString('en-US')}`);
    }

    return {
        principal,
        annualRate: annualRate * 100,
        totalInterest,
        totalRepayment,
        monthlyPayment,
        scheduleLines
    };
}

function sendContractEmail(request) {
    const contract = getContractSummary(request);
    const emailBody = [
        `Dear ${request.fullName},`,
        '',
        'Your loan request has been approved. Below is your digital contract summary:',
        '',
        `Loan Amount: ${formatCurrency(contract.principal)}`,
        `Interest Rate: ${contract.annualRate.toFixed(2)}% per annum`,
        `Repayment Term: ${request.repaymentMonths} months`,
        `Total Interest: ${formatCurrency(contract.totalInterest)}`,
        `Total Repayment: ${formatCurrency(contract.totalRepayment)}`,
        `Monthly Payment: ${formatCurrency(contract.monthlyPayment)}`,
        '',
        'Payment Schedule:',
        ...contract.scheduleLines,
        '',
        'Terms and Conditions:',
        '1. Borrower agrees to pay installments on or before each due date.',
        '2. Late payments may incur additional charges as defined by the lender.',
        '3. Lender reserves the right to apply legal remedies for unpaid balances.',
        '4. Borrower confirms all submitted information is accurate and verifiable.',
        '',
        'Please reply to this email for confirmation.',
        '',
        'ContractFlow Lending Team'
    ].join('\n');

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(request.email)}&su=${encodeURIComponent('Approved Loan Contract - ContractFlow')}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailUrl, '_blank');
}

window.viewLoanRequest = function(id) {
    const loanRequests = JSON.parse(localStorage.getItem(LOAN_REQUESTS_KEY) || '[]');
    const request = loanRequests.find(item => item.id === id);
    if (!request) {
        return;
    }

    const details = [
        `Borrower: ${request.fullName}`,
        `Email: ${request.email}`,
        `Phone: ${request.phone}`,
        `Loan Amount: ${formatCurrency(request.loanAmount)}`,
        `Interest: ${Number(request.interestRate).toFixed(2)}%`,
        `Repayment Term: ${request.repaymentMonths} months`,
        `Monthly Income: ${formatCurrency(request.monthlyIncome)}`,
        `Status: ${request.status}`,
        '',
        `Address: ${request.address}`,
        '',
        `Purpose: ${request.loanPurpose}`
    ].join('\n');

    alert(details);
};

window.approveLoanRequest = function(id) {
    const loanRequests = JSON.parse(localStorage.getItem(LOAN_REQUESTS_KEY) || '[]');
    const request = loanRequests.find(item => item.id === id);

    if (!request) {
        return;
    }

    if (request.status === 'Approved') {
        alert('This loan request is already approved.');
        return;
    }

    request.status = 'Approved';
    request.approvedAt = new Date().toISOString();
    request.contractSent = true;
    request.contractSentAt = new Date().toISOString();

    localStorage.setItem(LOAN_REQUESTS_KEY, JSON.stringify(loanRequests));
    sendContractEmail(request);
    renderLenderDashboard();

    alert('Loan approved. Digital contract draft has been opened in Gmail.');
};

window.rejectLoanRequest = function(id) {
    const loanRequests = JSON.parse(localStorage.getItem(LOAN_REQUESTS_KEY) || '[]');
    const request = loanRequests.find(item => item.id === id);

    if (!request) {
        return;
    }

    if (request.status === 'Rejected') {
        alert('This loan request is already rejected.');
        return;
    }

    request.status = 'Rejected';
    request.rejectedAt = new Date().toISOString();
    localStorage.setItem(LOAN_REQUESTS_KEY, JSON.stringify(loanRequests));
    renderLenderDashboard();

    alert('Loan request rejected.');
};

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(Number(amount) || 0);
}

function formatDate(value) {
    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
