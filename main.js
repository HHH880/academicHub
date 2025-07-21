// Main application entry point for Academic Resource Hub

/**
 * Application initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    // Show loading screen briefly for better UX
    setTimeout(() => {
        initializeApp();
    }, 1500);
});

/**
 * Initialize the application
 */
function initializeApp() {
    try {
        // Initialize storage with default data
        initializeDefaultData();
        
        // Initialize authentication
        initAuthEvents();
        initAuth();
        
        // Initialize UI components
        initUI();
        initUpload();
        initSearch();
        
        // Hide loading screen
        hideLoadingScreen();
        
        console.log('Academic Resource Hub initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showToast('Failed to load application. Please refresh the page.', 'error');
    }
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.opacity = '0';
    
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 500);
}

/**
 * Global error handler
 */
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showToast('An unexpected error occurred. Please try again.', 'error');
});

/**
 * Handle offline/online status
 */
window.addEventListener('online', () => {
    showToast('Connection restored', 'success');
});

window.addEventListener('offline', () => {
    showToast('You are now offline. Some features may be limited.', 'warning');
});

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + shortcuts
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case '1':
                e.preventDefault();
                switchView('dashboard');
                break;
            case '2':
                e.preventDefault();
                switchView('browse');
                break;
            case '3':
                e.preventDefault();
                switchView('upload');
                break;
            case '4':
                e.preventDefault();
                switchView('search');
                document.getElementById('search-input').focus();
                break;
            case 'k':
                e.preventDefault();
                switchView('search');
                document.getElementById('search-input').focus();
                break;
        }
    }
    
    // Escape key to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
            modal.classList.add('hidden');
        });
    }
});

/**
 * Service worker registration (for future offline support)
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker would be registered here for offline support
        console.log('Service worker support detected');
    });
}

/**
 * Performance monitoring
 */
function logPerformance() {
    if ('performance' in window) {
        const perfData = window.performance.getEntriesByType('navigation')[0];
        console.log('App load time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
    }
}

// Log performance after page load
window.addEventListener('load', () => {
    setTimeout(logPerformance, 1000);
});

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
    // Cleanup any ongoing operations
    console.log('Application shutting down...');
});

/**
 * Export global functions for HTML onclick handlers
 */
window.switchView = switchView;
window.resetBrowseState = resetBrowseState;
window.browseToDepartment = browseToDepartment;
window.browseToCourse = browseToCourse;
window.downloadResource = downloadResource;
window.deleteResource = deleteResource;
window.showResourceModal = showResourceModal;