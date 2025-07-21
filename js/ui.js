// UI management and navigation for Academic Resource Hub

let currentView = 'dashboard';
let browseState = {
    currentDepartment: null,
    currentCourse: null,
    currentLecturer: null
};

/**
 * Initialize UI
 */
function initUI() {
    setupNavigation();
    setupModalHandlers();
    loadDashboardStats();
    loadRecentResources();
}

/**
 * Setup navigation handlers
 */
function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
            
            // Update active nav button
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

/**
 * Switch between views
 */
function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show selected view
    document.getElementById(`${viewName}-view`).classList.add('active');
    currentView = viewName;
    
    // Load view-specific data
    switch (viewName) {
        case 'dashboard':
            loadDashboardStats();
            loadRecentResources();
            break;
        case 'browse':
            loadBrowseView();
            break;
        case 'upload':
            populateUploadDropdowns();
            break;
        case 'search':
            populateSearchFilters();
            break;
    }
}

/**
 * Load dashboard statistics
 */
function loadDashboardStats() {
    const stats = getStorageStats();
    
    // Animate numbers
    animateNumber(document.getElementById('total-resources'), stats.totalResources);
    animateNumber(document.getElementById('total-users'), stats.totalUsers);
    animateNumber(document.getElementById('total-departments'), stats.totalDepartments);
    animateNumber(document.getElementById('my-uploads'), stats.myUploads);
}

/**
 * Load recent resources for dashboard
 */
function loadRecentResources() {
    const recentResources = ResourceStorage.getRecentResources(8);
    const container = document.getElementById('recent-resources');
    
    if (recentResources.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-file-alt"></i>
                <p>No resources uploaded yet</p>
                <button class="btn btn-primary" onclick="switchView('upload')">
                    <i class="fas fa-upload"></i>
                    Upload First Resource
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentResources.map(resource => createResourceCard(resource)).join('');
    addResourceCardHandlers();
}

/**
 * Load browse view
 */
function loadBrowseView() {
    populateBrowseFilters();
    updateBreadcrumb();
    
    if (!browseState.currentDepartment) {
        loadDepartmentGrid();
    } else if (!browseState.currentCourse) {
        loadCourseList(browseState.currentDepartment);
    } else {
        loadResourceList();
    }
}

/**
 * Populate browse filters
 */
function populateBrowseFilters() {
    const deptFilter = document.getElementById('dept-filter');
    const courseFilter = document.getElementById('course-filter');
    const lecturerFilter = document.getElementById('lecturer-filter');
    
    // Department filter
    const departments = DepartmentStorage.getDepartments();
    deptFilter.innerHTML = '<option value="">All Departments</option>';
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.id;
        option.textContent = dept.name;
        option.selected = dept.id === browseState.currentDepartment;
        deptFilter.appendChild(option);
    });
    
    // Course filter
    courseFilter.innerHTML = '<option value="">All Courses</option>';
    if (browseState.currentDepartment) {
        const courses = CourseStorage.getCoursesByDepartment(browseState.currentDepartment);
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = `${course.code} - ${course.name}`;
            option.selected = course.id === browseState.currentCourse;
            courseFilter.appendChild(option);
        });
    }
    
    // Lecturer filter
    lecturerFilter.innerHTML = '<option value="">All Lecturers</option>';
    if (browseState.currentDepartment) {
        const lecturers = LecturerStorage.getLecturersByDepartment(browseState.currentDepartment);
        lecturers.forEach(lecturer => {
            const option = document.createElement('option');
            option.value = lecturer.id;
            option.textContent = `${lecturer.title} ${lecturer.name}`;
            option.selected = lecturer.id === browseState.currentLecturer;
            lecturerFilter.appendChild(option);
        });
    }
    
    // Add filter change handlers
    deptFilter.addEventListener('change', handleBrowseFilterChange);
    courseFilter.addEventListener('change', handleBrowseFilterChange);
    lecturerFilter.addEventListener('change', handleBrowseFilterChange);
}

/**
 * Handle browse filter changes
 */
function handleBrowseFilterChange() {
    const deptId = document.getElementById('dept-filter').value;
    const courseId = document.getElementById('course-filter').value;
    const lecturerId = document.getElementById('lecturer-filter').value;
    
    // Update browse state
    browseState.currentDepartment = deptId || null;
    browseState.currentCourse = courseId || null;
    browseState.currentLecturer = lecturerId || null;
    
    // Reload browse view
    loadBrowseView();
}

/**
 * Update breadcrumb navigation
 */
function updateBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb');
    let breadcrumbHTML = '<span class="breadcrumb-item" onclick="resetBrowseState()">All Departments</span>';
    
    if (browseState.currentDepartment) {
        const dept = DepartmentStorage.findDepartmentById(browseState.currentDepartment);
        breadcrumbHTML += `<span class="breadcrumb-item" onclick="browseToDepartment('${dept.id}')">${dept.name}</span>`;
        
        if (browseState.currentCourse) {
            const course = CourseStorage.findCourseById(browseState.currentCourse);
            breadcrumbHTML += `<span class="breadcrumb-item active">${course.code}</span>`;
        }
    }
    
    breadcrumb.innerHTML = breadcrumbHTML;
}

/**
 * Load department grid
 */
function loadDepartmentGrid() {
    const container = document.getElementById('browse-content');
    const departments = DepartmentStorage.getDepartments();
    
    container.innerHTML = `
        <div class="department-grid">
            ${departments.map(dept => createDepartmentCard(dept)).join('')}
        </div>
    `;
    
    // Add click handlers
    document.querySelectorAll('.department-card').forEach(card => {
        card.addEventListener('click', () => {
            const deptId = card.dataset.departmentId;
            browseToDepartment(deptId);
        });
    });
}

/**
 * Load course list for department
 */
function loadCourseList(departmentId) {
    const container = document.getElementById('browse-content');
    const courses = CourseStorage.getCoursesByDepartment(departmentId);
    
    if (courses.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-book"></i>
                <p>No courses found in this department</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="course-list">
            ${courses.map(course => createCourseCard(course)).join('')}
        </div>
    `;
    
    // Add click handlers
    document.querySelectorAll('.course-item').forEach(item => {
        item.addEventListener('click', () => {
            const courseId = item.dataset.courseId;
            browseToCourse(courseId);
        });
    });
}

/**
 * Load resource list
 */
function loadResourceList() {
    const container = document.getElementById('browse-content');
    let resources = [];
    
    if (browseState.currentCourse) {
        resources = ResourceStorage.getResourcesByCourse(browseState.currentCourse);
    } else if (browseState.currentDepartment) {
        resources = ResourceStorage.getResourcesByDepartment(browseState.currentDepartment);
    }
    
    // Apply lecturer filter if selected
    if (browseState.currentLecturer) {
        resources = resources.filter(r => r.lecturerId === browseState.currentLecturer);
    }
    
    if (resources.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-file-alt"></i>
                <p>No resources found</p>
                <button class="btn btn-primary" onclick="switchView('upload')">
                    <i class="fas fa-upload"></i>
                    Upload Resource
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="resource-grid">
            ${resources.map(resource => createResourceCard(resource)).join('')}
        </div>
    `;
    
    addResourceCardHandlers();
}

/**
 * Create department card HTML
 */
function createDepartmentCard(department) {
    const resourceCount = ResourceStorage.getResourcesByDepartment(department.id).length;
    
    return `
        <div class="department-card" data-department-id="${department.id}">
            <i class="${department.icon}"></i>
            <h3>${sanitizeString(department.name)}</h3>
            <p class="resource-count">${resourceCount} resource${resourceCount !== 1 ? 's' : ''}</p>
        </div>
    `;
}

/**
 * Create course card HTML
 */
function createCourseCard(course) {
    const resourceCount = ResourceStorage.getResourcesByCourse(course.id).length;
    const lecturers = LecturerStorage.getLecturersByDepartment(course.departmentId);
    const mainLecturer = lecturers[0]; // Simplified - just take first lecturer
    
    return `
        <div class="course-item" data-course-id="${course.id}">
            <div class="course-header">
                <span class="course-code">${sanitizeString(course.code)}</span>
                <span class="resource-count">${resourceCount} resource${resourceCount !== 1 ? 's' : ''}</span>
            </div>
            <h3 class="course-name">${sanitizeString(course.name)}</h3>
            ${mainLecturer ? `<p class="course-lecturer">${sanitizeString(mainLecturer.title)} ${sanitizeString(mainLecturer.name)}</p>` : ''}
        </div>
    `;
}

/**
 * Create resource card HTML
 */
function createResourceCard(resource) {
    const department = DepartmentStorage.findDepartmentById(resource.departmentId);
    const course = CourseStorage.findCourseById(resource.courseId);
    const lecturer = LecturerStorage.findLecturerById(resource.lecturerId);
    
    return `
        <div class="resource-card" data-resource-id="${resource.id}">
            <div class="resource-header">
                <div class="resource-icon">
                    <i class="${getResourceTypeIcon(resource.type)}"></i>
                </div>
                <div class="resource-info">
                    <h3>${sanitizeString(resource.title)}</h3>
                    <div class="resource-meta">
                        <span><i class="fas fa-building"></i> ${sanitizeString(department?.name || 'Unknown')}</span>
                        <span><i class="fas fa-book"></i> ${sanitizeString(course?.code || 'Unknown')}</span>
                        <span><i class="fas fa-user"></i> ${sanitizeString(lecturer?.name || 'Unknown')}</span>
                        <span><i class="fas fa-calendar"></i> ${resource.year}</span>
                    </div>
                </div>
            </div>
            
            ${resource.description ? `
                <p class="resource-description">${sanitizeString(resource.description)}</p>
            ` : ''}
            
            <div class="resource-footer">
                <div class="resource-type ${resource.type}">${resource.type}</div>
                <button class="btn btn-primary download-btn" onclick="downloadResource('${resource.id}')">
                    <i class="fas fa-download"></i>
                    Download
                </button>
            </div>
            
            <div class="resource-stats">
                <small><i class="fas fa-download"></i> ${resource.downloads || 0} downloads</small>
                <small><i class="fas fa-clock"></i> ${formatDate(resource.uploadDate)}</small>
            </div>
        </div>
    `;
}

/**
 * Add click handlers to resource cards
 */
function addResourceCardHandlers() {
    document.querySelectorAll('.resource-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't trigger if download button was clicked
            if (e.target.closest('.download-btn')) return;
            
            const resourceId = card.dataset.resourceId;
            showResourceModal(resourceId);
        });
    });
}

/**
 * Show resource details modal
 */
function showResourceModal(resourceId) {
    const resources = ResourceStorage.getResources();
    const resource = resources.find(r => r.id === resourceId);
    
    if (!resource) {
        showToast('Resource not found', 'error');
        return;
    }
    
    const department = DepartmentStorage.findDepartmentById(resource.departmentId);
    const course = CourseStorage.findCourseById(resource.courseId);
    const lecturer = LecturerStorage.findLecturerById(resource.lecturerId);
    const uploader = UserStorage.getUsers().find(u => u.id === resource.uploadedBy);
    
    const modal = document.getElementById('resource-modal');
    const details = document.getElementById('resource-details');
    
    details.innerHTML = `
        <div class="resource-modal-header">
            <div class="resource-icon">
                <i class="${getResourceTypeIcon(resource.type)}"></i>
            </div>
            <div>
                <h2>${sanitizeString(resource.title)}</h2>
                <div class="resource-type ${resource.type}">${resource.type}</div>
            </div>
        </div>
        
        <div class="resource-modal-info">
            <div class="info-grid">
                <div class="info-item">
                    <label>Department</label>
                    <span>${sanitizeString(department?.name || 'Unknown')}</span>
                </div>
                <div class="info-item">
                    <label>Course</label>
                    <span>${sanitizeString(course?.code || 'Unknown')} - ${sanitizeString(course?.name || 'Unknown')}</span>
                </div>
                <div class="info-item">
                    <label>Lecturer</label>
                    <span>${sanitizeString(lecturer?.title || '')} ${sanitizeString(lecturer?.name || 'Unknown')}</span>
                </div>
                <div class="info-item">
                    <label>Academic Year</label>
                    <span>${resource.year}</span>
                </div>
                <div class="info-item">
                    <label>File Name</label>
                    <span>${sanitizeString(resource.fileName)}</span>
                </div>
                <div class="info-item">
                    <label>File Size</label>
                    <span>${formatFileSize(resource.fileSize)}</span>
                </div>
                <div class="info-item">
                    <label>Upload Date</label>
                    <span>${formatDate(resource.uploadDate)}</span>
                </div>
                <div class="info-item">
                    <label>Uploaded By</label>
                    <span>${sanitizeString(uploader?.name || 'Unknown User')}</span>
                </div>
                <div class="info-item">
                    <label>Downloads</label>
                    <span>${resource.downloads || 0}</span>
                </div>
            </div>
            
            ${resource.description ? `
                <div class="resource-description-full">
                    <label>Description</label>
                    <p>${sanitizeString(resource.description)}</p>
                </div>
            ` : ''}
        </div>
        
        <div class="resource-modal-actions">
            <button class="btn btn-primary" onclick="downloadResource('${resource.id}')">
                <i class="fas fa-download"></i>
                Download Resource
            </button>
            ${currentUser && currentUser.id === resource.uploadedBy ? `
                <button class="btn btn-danger" onclick="deleteResource('${resource.id}')">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            ` : ''}
        </div>
    `;
    
    modal.classList.remove('hidden');
}

/**
 * Setup modal handlers
 */
function setupModalHandlers() {
    // Close resource modal
    document.getElementById('close-resource-modal').addEventListener('click', () => {
        document.getElementById('resource-modal').classList.add('hidden');
    });
    
    // Close modal on outside click
    document.getElementById('resource-modal').addEventListener('click', (e) => {
        if (e.target.id === 'resource-modal') {
            document.getElementById('resource-modal').classList.add('hidden');
        }
    });
}

/**
 * Navigation functions for browse state
 */
function resetBrowseState() {
    browseState = {
        currentDepartment: null,
        currentCourse: null,
        currentLecturer: null
    };
    loadBrowseView();
}

function browseToDepartment(departmentId) {
    browseState.currentDepartment = departmentId;
    browseState.currentCourse = null;
    browseState.currentLecturer = null;
    loadBrowseView();
}

function browseToCourse(courseId) {
    browseState.currentCourse = courseId;
    browseState.currentLecturer = null;
    loadBrowseView();
}

/**
 * Delete resource (only by uploader)
 */
function deleteResource(resourceId) {
    if (!currentUser) return;
    
    const resources = ResourceStorage.getResources();
    const resource = resources.find(r => r.id === resourceId);
    
    if (!resource) {
        showToast('Resource not found', 'error');
        return;
    }
    
    if (resource.uploadedBy !== currentUser.id) {
        showToast('You can only delete your own resources', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
        if (ResourceStorage.deleteResource(resourceId)) {
            showToast('Resource deleted successfully', 'success');
            document.getElementById('resource-modal').classList.add('hidden');
            
            // Refresh current view
            if (currentView === 'dashboard') {
                loadDashboardStats();
                loadRecentResources();
            } else if (currentView === 'browse') {
                loadBrowseView();
            } else if (currentView === 'search') {
                performSearch();
            }
        } else {
            showToast('Failed to delete resource', 'error');
        }
    }
}