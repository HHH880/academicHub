// Authentication system for Academic Resource Hub

/**
 * Authentication state management
 */
let isAuthenticated = false;
let currentUser = null;

/**
 * Initialize authentication
 */
function initAuth() {
    currentUser = UserStorage.getCurrentUser();
    isAuthenticated = !!currentUser;
    
    if (isAuthenticated) {
        showApp();
        updateUserDisplay();
    } else {
        showAuthModal();
    }
}

/**
 * Show authentication modal
 */
function showAuthModal() {
    const authModal = document.getElementById('auth-modal');
    const app = document.getElementById('app');
    
    authModal.classList.remove('hidden');
    app.classList.add('hidden');
    
    // Populate department dropdown in register form
    populateDepartmentDropdown();
}

/**
 * Hide authentication modal and show app
 */
function showApp() {
    const authModal = document.getElementById('auth-modal');
    const app = document.getElementById('app');
    
    authModal.classList.add('hidden');
    app.classList.remove('hidden');
}

/**
 * Populate department dropdown
 */
function populateDepartmentDropdown() {
    const registerDeptSelect = document.getElementById('register-department');
    const departments = DepartmentStorage.getDepartments();
    
    registerDeptSelect.innerHTML = '<option value="">Select Department</option>';
    
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.id;
        option.textContent = dept.name;
        registerDeptSelect.appendChild(option);
    });
}

/**
 * Handle user registration
 */
async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const userData = {
        name: document.getElementById('register-name').value.trim(),
        email: document.getElementById('register-email').value.trim().toLowerCase(),
        department: document.getElementById('register-department').value,
        password: document.getElementById('register-password').value
    };
    
    // Validation
    if (!userData.name || !userData.email || !userData.department || !userData.password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(userData.email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    if (userData.password.length < 6) {
        showToast('Password must be at least 6 characters long', 'error');
        return;
    }
    
    // Check if user already exists
    const existingUser = UserStorage.findUserByEmail(userData.email);
    if (existingUser) {
        showToast('An account with this email already exists', 'error');
        return;
    }
    
    // Hash password (simple hash for demo - in real app use proper hashing)
    userData.passwordHash = btoa(userData.password);
    delete userData.password;
    
    // Add user to storage
    const newUser = UserStorage.addUser(userData);
    
    if (newUser) {
        showToast('Account created successfully! Please login.', 'success');
        
        // Switch to login tab
        switchAuthTab('login');
        
        // Pre-fill login form
        document.getElementById('login-email').value = userData.email;
    } else {
        showToast('Failed to create account. Please try again.', 'error');
    }
}

/**
 * Handle user login
 */
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    
    // Validation
    if (!email || !password) {
        showToast('Please enter both email and password', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    // Find user
    const user = UserStorage.findUserByEmail(email);
    if (!user) {
        showToast('No account found with this email address', 'error');
        return;
    }
    
    // Verify password (simple comparison for demo)
    const passwordHash = btoa(password);
    if (user.passwordHash !== passwordHash) {
        showToast('Incorrect password', 'error');
        return;
    }
    
    // Update last login
    UserStorage.updateUser(user.id, { lastLogin: new Date().toISOString() });
    
    // Set current user
    currentUser = user;
    isAuthenticated = true;
    UserStorage.setCurrentUser(user);
    
    showToast(`Welcome back, ${user.name}!`, 'success');
    showApp();
    updateUserDisplay();
    
    // Load dashboard data
    loadDashboardStats();
}

/**
 * Handle logout
 */
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        UserStorage.logout();
        currentUser = null;
        isAuthenticated = false;
        
        showToast('Logged out successfully', 'success');
        showAuthModal();
        
        // Clear forms
        document.getElementById('login-form').reset();
        document.getElementById('register-form').reset();
    }
}

/**
 * Switch between authentication tabs
 */
function switchAuthTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    document.getElementById(`${tabName}-form`).classList.add('active');
}

/**
 * Update user display in header
 */
function updateUserDisplay() {
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.name;
    }
}

/**
 * Check if user is authenticated
 */
function requireAuth() {
    if (!isAuthenticated) {
        showToast('Please login to access this feature', 'warning');
        showAuthModal();
        return false;
    }
    return true;
}

/**
 * Get current user data
 */
function getCurrentUser() {
    return currentUser;
}

/**
 * Initialize authentication event listeners
 */
function initAuthEvents() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchAuthTab(btn.dataset.tab);
        });
    });
    
    // Form submissions
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Modal close
    document.getElementById('close-auth-modal').addEventListener('click', () => {
        if (isAuthenticated) {
            document.getElementById('auth-modal').classList.add('hidden');
        }
    });
    
    // Close modal on outside click
    document.getElementById('auth-modal').addEventListener('click', (e) => {
        if (e.target.id === 'auth-modal' && isAuthenticated) {
            document.getElementById('auth-modal').classList.add('hidden');
        }
    });
}