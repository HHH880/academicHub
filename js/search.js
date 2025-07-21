// Search and filter functionality for Academic Resource Hub

let searchResults = [];
let searchFilters = {};

/**
 * Initialize search functionality
 */
function initSearch() {
    setupSearchHandlers();
    populateSearchFilters();
}

/**
 * Setup search event handlers
 */
function setupSearchHandlers() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    // Search button click
    searchBtn.addEventListener('click', performSearch);
    
    // Enter key in search input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Debounced search as user types
    const debouncedSearch = debounce(performSearch, 500);
    searchInput.addEventListener('input', debouncedSearch);
    
    // Filter change handlers
    document.getElementById('search-dept-filter').addEventListener('change', performSearch);
    document.getElementById('search-type-filter').addEventListener('change', performSearch);
    document.getElementById('search-year-filter').addEventListener('change', performSearch);
}

/**
 * Populate search filter dropdowns
 */
function populateSearchFilters() {
    populateSearchDepartmentFilter();
}

/**
 * Populate department filter dropdown
 */
function populateSearchDepartmentFilter() {
    const deptSelect = document.getElementById('search-dept-filter');
    const departments = DepartmentStorage.getDepartments();
    
    deptSelect.innerHTML = '<option value="">All Departments</option>';
    
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.id;
        option.textContent = dept.name;
        deptSelect.appendChild(option);
    });
}

/**
 * Perform search based on current input and filters
 */
function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    
    // Get current filters
    searchFilters = {
        department: document.getElementById('search-dept-filter').value,
        type: document.getElementById('search-type-filter').value,
        year: document.getElementById('search-year-filter').value
    };
    
    // Perform search
    searchResults = ResourceStorage.searchResources(query, searchFilters);
    
    // Display results
    displaySearchResults(searchResults, query);
}

/**
 * Display search results
 */
function displaySearchResults(results, query) {
    const resultsContainer = document.getElementById('search-results');
    
    if (results.length === 0) {
        if (query || Object.values(searchFilters).some(filter => filter)) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No resources found matching your criteria</p>
                    <small>Try adjusting your search terms or filters</small>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>Enter a search term to find resources</p>
                </div>
            `;
        }
        return;
    }
    
    // Group results by relevance or date
    const sortedResults = sortSearchResults(results, query);
    
    resultsContainer.innerHTML = `
        <div class="search-results-header">
            <h3>Found ${results.length} resource${results.length !== 1 ? 's' : ''}</h3>
            ${query ? `<p>Results for "${sanitizeString(query)}"</p>` : ''}
        </div>
        <div class="resource-grid">
            ${sortedResults.map(resource => createResourceCard(resource)).join('')}
        </div>
    `;
    
    // Add click handlers for resource cards
    addResourceCardHandlers();
}

/**
 * Sort search results by relevance
 */
function sortSearchResults(results, query) {
    if (!query) {
        // Sort by upload date if no query
        return results.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    }
    
    const searchTerm = query.toLowerCase();
    
    return results.sort((a, b) => {
        // Calculate relevance score
        let scoreA = 0;
        let scoreB = 0;
        
        // Title match (highest priority)
        if (a.title.toLowerCase().includes(searchTerm)) scoreA += 10;
        if (b.title.toLowerCase().includes(searchTerm)) scoreB += 10;
        
        // Exact title match
        if (a.title.toLowerCase() === searchTerm) scoreA += 20;
        if (b.title.toLowerCase() === searchTerm) scoreB += 20;
        
        // Description match
        if (a.description.toLowerCase().includes(searchTerm)) scoreA += 5;
        if (b.description.toLowerCase().includes(searchTerm)) scoreB += 5;
        
        // Filename match
        if (a.fileName.toLowerCase().includes(searchTerm)) scoreA += 3;
        if (b.fileName.toLowerCase().includes(searchTerm)) scoreB += 3;
        
        // If scores are equal, sort by date
        if (scoreA === scoreB) {
            return new Date(b.uploadDate) - new Date(a.uploadDate);
        }
        
        return scoreB - scoreA;
    });
}

/**
 * Advanced search functionality
 */
function performAdvancedSearch(criteria) {
    const results = ResourceStorage.getResources().filter(resource => {
        let matches = true;
        
        // Text search across multiple fields
        if (criteria.query) {
            const searchTerm = criteria.query.toLowerCase();
            const textMatch = 
                resource.title.toLowerCase().includes(searchTerm) ||
                resource.description.toLowerCase().includes(searchTerm) ||
                resource.fileName.toLowerCase().includes(searchTerm);
            matches = matches && textMatch;
        }
        
        // Department filter
        if (criteria.department) {
            matches = matches && resource.departmentId === criteria.department;
        }
        
        // Course filter
        if (criteria.course) {
            matches = matches && resource.courseId === criteria.course;
        }
        
        // Lecturer filter
        if (criteria.lecturer) {
            matches = matches && resource.lecturerId === criteria.lecturer;
        }
        
        // Type filter
        if (criteria.type) {
            matches = matches && resource.type === criteria.type;
        }
        
        // Year filter
        if (criteria.year) {
            matches = matches && resource.year === criteria.year;
        }
        
        // Date range filter
        if (criteria.dateFrom) {
            matches = matches && new Date(resource.uploadDate) >= new Date(criteria.dateFrom);
        }
        
        if (criteria.dateTo) {
            matches = matches && new Date(resource.uploadDate) <= new Date(criteria.dateTo);
        }
        
        // File type filter
        if (criteria.fileType) {
            const extension = resource.fileName.split('.').pop().toLowerCase();
            matches = matches && extension === criteria.fileType.toLowerCase();
        }
        
        return matches;
    });
    
    return results;
}

/**
 * Get search suggestions based on input
 */
function getSearchSuggestions(query) {
    if (!query || query.length < 2) return [];
    
    const resources = ResourceStorage.getResources();
    const departments = DepartmentStorage.getDepartments();
    const courses = CourseStorage.getCourses();
    const lecturers = LecturerStorage.getLecturers();
    
    const suggestions = new Set();
    const searchTerm = query.toLowerCase();
    
    // Resource titles
    resources.forEach(resource => {
        if (resource.title.toLowerCase().includes(searchTerm)) {
            suggestions.add(resource.title);
        }
    });
    
    // Department names
    departments.forEach(dept => {
        if (dept.name.toLowerCase().includes(searchTerm)) {
            suggestions.add(dept.name);
        }
    });
    
    // Course names and codes
    courses.forEach(course => {
        if (course.name.toLowerCase().includes(searchTerm) || 
            course.code.toLowerCase().includes(searchTerm)) {
            suggestions.add(`${course.code} - ${course.name}`);
        }
    });
    
    // Lecturer names
    lecturers.forEach(lecturer => {
        if (lecturer.name.toLowerCase().includes(searchTerm)) {
            suggestions.add(lecturer.name);
        }
    });
    
    return Array.from(suggestions).slice(0, 8);
}

/**
 * Filter resources by multiple criteria
 */
function filterResources(resources, filters) {
    return resources.filter(resource => {
        // Apply all active filters
        return Object.entries(filters).every(([key, value]) => {
            if (!value) return true; // Skip empty filters
            
            switch (key) {
                case 'department':
                    return resource.departmentId === value;
                case 'course':
                    return resource.courseId === value;
                case 'lecturer':
                    return resource.lecturerId === value;
                case 'type':
                    return resource.type === value;
                case 'year':
                    return resource.year === value;
                case 'fileType':
                    const extension = resource.fileName.split('.').pop().toLowerCase();
                    return extension === value.toLowerCase();
                default:
                    return true;
            }
        });
    });
}

/**
 * Save search query for history
 */
function saveSearchHistory(query, filters) {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    
    const searchEntry = {
        query,
        filters,
        timestamp: new Date().toISOString(),
        resultsCount: searchResults.length
    };
    
    // Add to beginning of array
    searchHistory.unshift(searchEntry);
    
    // Keep only last 20 searches
    searchHistory.splice(20);
    
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

/**
 * Get search history
 */
function getSearchHistory() {
    return JSON.parse(localStorage.getItem('searchHistory') || '[]');
}

/**
 * Clear search results
 */
function clearSearchResults() {
    document.getElementById('search-input').value = '';
    document.getElementById('search-dept-filter').value = '';
    document.getElementById('search-type-filter').value = '';
    document.getElementById('search-year-filter').value = '';
    
    searchResults = [];
    searchFilters = {};
    
    document.getElementById('search-results').innerHTML = `
        <div class="no-results">
            <i class="fas fa-search"></i>
            <p>Enter a search term to find resources</p>
        </div>
    `;
}

/**
 * Export search results
 */
function exportSearchResults() {
    if (searchResults.length === 0) {
        showToast('No search results to export', 'warning');
        return;
    }
    
    const exportData = searchResults.map(resource => ({
        title: resource.title,
        type: resource.type,
        department: DepartmentStorage.findDepartmentById(resource.departmentId)?.name,
        course: CourseStorage.findCourseById(resource.courseId)?.name,
        lecturer: LecturerStorage.findLecturerById(resource.lecturerId)?.name,
        year: resource.year,
        uploadDate: resource.uploadDate,
        fileName: resource.fileName,
        fileSize: formatFileSize(resource.fileSize),
        downloads: resource.downloads
    }));
    
    const csvContent = convertToCSV(exportData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Search results exported', 'success');
}

/**
 * Convert array to CSV format
 */
function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
        headers.map(header => {
            const value = row[header] || '';
            // Escape commas and quotes
            return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
}