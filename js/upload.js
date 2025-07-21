// File upload functionality for Academic Resource Hub

let selectedFile = null;
let uploadProgress = 0;

/**
 * Initialize upload functionality
 */
function initUpload() {
    setupDropZone();
    setupFormHandlers();
    populateUploadDropdowns();
}

/**
 * Setup drag and drop file upload
 */
function setupDropZone() {
    const dropZone = document.getElementById('file-drop-zone');
    const fileInput = document.getElementById('file-input');

    // Click to browse
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    });

    // Drag and drop events
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    });

    // Remove file button
    document.getElementById('remove-file').addEventListener('click', removeSelectedFile);
}

/**
 * Handle file selection
 */
function handleFileSelection(file) {
    // Validate file type
    if (!isValidFileType(file)) {
        showToast('Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG files.', 'error');
        return;
    }

    // Validate file size
    if (!isValidFileSize(file)) {
        showToast('File size too large. Maximum size is 10MB.', 'error');
        return;
    }

    selectedFile = file;
    showFilePreview(file);
}

/**
 * Show file preview
 */
function showFilePreview(file) {
    const dropZone = document.getElementById('file-drop-zone');
    const filePreview = document.getElementById('file-preview');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');

    dropZone.classList.add('hidden');
    filePreview.classList.remove('hidden');

    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);

    // Update file icon
    const fileIcon = filePreview.querySelector('i');
    fileIcon.className = getFileIcon(file.name);
}

/**
 * Remove selected file
 */
function removeSelectedFile() {
    selectedFile = null;
    
    const dropZone = document.getElementById('file-drop-zone');
    const filePreview = document.getElementById('file-preview');
    const fileInput = document.getElementById('file-input');

    dropZone.classList.remove('hidden');
    filePreview.classList.add('hidden');
    fileInput.value = '';
}

/**
 * Setup form handlers
 */
function setupFormHandlers() {
    const uploadForm = document.getElementById('upload-form');
    uploadForm.addEventListener('submit', handleUpload);

    // Department change handler
    document.getElementById('resource-department').addEventListener('change', (e) => {
        populateCourseDropdown(e.target.value);
        populateLecturerDropdown(e.target.value);
    });
}

/**
 * Populate upload form dropdowns
 */
function populateUploadDropdowns() {
    populateUploadDepartmentDropdown();
}

/**
 * Populate department dropdown in upload form
 */
function populateUploadDepartmentDropdown() {
    const deptSelect = document.getElementById('resource-department');
    const departments = DepartmentStorage.getDepartments();
    
    deptSelect.innerHTML = '<option value="">Select Department</option>';
    
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.id;
        option.textContent = dept.name;
        deptSelect.appendChild(option);
    });
}

/**
 * Populate course dropdown based on selected department
 */
function populateCourseDropdown(departmentId) {
    const courseSelect = document.getElementById('resource-course');
    courseSelect.innerHTML = '<option value="">Select Course</option>';
    
    if (!departmentId) return;
    
    const courses = CourseStorage.getCoursesByDepartment(departmentId);
    
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = `${course.code} - ${course.name}`;
        courseSelect.appendChild(option);
    });
}

/**
 * Populate lecturer dropdown based on selected department
 */
function populateLecturerDropdown(departmentId) {
    const lecturerSelect = document.getElementById('resource-lecturer');
    lecturerSelect.innerHTML = '<option value="">Select Lecturer</option>';
    
    if (!departmentId) return;
    
    const lecturers = LecturerStorage.getLecturersByDepartment(departmentId);
    
    lecturers.forEach(lecturer => {
        const option = document.createElement('option');
        option.value = lecturer.id;
        option.textContent = `${lecturer.title} ${lecturer.name}`;
        lecturerSelect.appendChild(option);
    });
}

/**
 * Handle file upload
 */
async function handleUpload(event) {
    event.preventDefault();

    if (!requireAuth()) return;

    // Validate form
    const formData = getUploadFormData();
    if (!validateUploadForm(formData)) return;

    if (!selectedFile) {
        showToast('Please select a file to upload', 'error');
        return;
    }

    try {
        // Show progress
        showUploadProgress();
        
        // Convert file to base64
        updateProgress(25);
        const fileData = await fileToBase64(selectedFile);
        
        updateProgress(50);
        
        // Prepare resource data
        const resourceData = {
            ...formData,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            fileType: selectedFile.type,
            fileData: fileData,
            uploadedBy: currentUser.id
        };
        
        updateProgress(75);
        
        // Save to storage
        const savedResource = ResourceStorage.addResource(resourceData);
        
        updateProgress(100);
        
        if (savedResource) {
            showToast('Resource uploaded successfully!', 'success');
            resetUploadForm();
            
            // Update dashboard if visible
            if (document.getElementById('dashboard-view').classList.contains('active')) {
                loadDashboardStats();
                loadRecentResources();
            }
        } else {
            throw new Error('Failed to save resource');
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Upload failed. Please try again.', 'error');
    } finally {
        hideUploadProgress();
    }
}

/**
 * Get upload form data
 */
function getUploadFormData() {
    return {
        title: document.getElementById('resource-title').value.trim(),
        type: document.getElementById('resource-type').value,
        departmentId: document.getElementById('resource-department').value,
        courseId: document.getElementById('resource-course').value,
        lecturerId: document.getElementById('resource-lecturer').value,
        year: document.getElementById('resource-year').value,
        description: document.getElementById('resource-description').value.trim()
    };
}

/**
 * Validate upload form
 */
function validateUploadForm(data) {
    if (!data.title) {
        showToast('Please enter a title', 'error');
        return false;
    }
    
    if (!data.type) {
        showToast('Please select a resource type', 'error');
        return false;
    }
    
    if (!data.departmentId) {
        showToast('Please select a department', 'error');
        return false;
    }
    
    if (!data.courseId) {
        showToast('Please select a course', 'error');
        return false;
    }
    
    if (!data.lecturerId) {
        showToast('Please select a lecturer', 'error');
        return false;
    }
    
    if (!data.year) {
        showToast('Please select an academic year', 'error');
        return false;
    }
    
    return true;
}

/**
 * Show upload progress
 */
function showUploadProgress() {
    const progressElement = document.getElementById('upload-progress');
    const submitBtn = document.querySelector('.btn-upload');
    
    progressElement.classList.remove('hidden');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    
    uploadProgress = 0;
    updateProgress(0);
}

/**
 * Update progress
 */
function updateProgress(percent) {
    uploadProgress = percent;
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    progressFill.style.width = `${percent}%`;
    progressText.textContent = `${percent}%`;
}

/**
 * Hide upload progress
 */
function hideUploadProgress() {
    const progressElement = document.getElementById('upload-progress');
    const submitBtn = document.querySelector('.btn-upload');
    
    setTimeout(() => {
        progressElement.classList.add('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Resource';
    }, 1000);
}

/**
 * Reset upload form
 */
function resetUploadForm() {
    document.getElementById('upload-form').reset();
    removeSelectedFile();
    
    // Clear dependent dropdowns
    document.getElementById('resource-course').innerHTML = '<option value="">Select Course</option>';
    document.getElementById('resource-lecturer').innerHTML = '<option value="">Select Lecturer</option>';
}

/**
 * Handle file download
 */
function downloadResource(resourceId) {
    const resources = ResourceStorage.getResources();
    const resource = resources.find(r => r.id === resourceId);
    
    if (!resource) {
        showToast('Resource not found', 'error');
        return;
    }
    
    try {
        // Increment download count
        ResourceStorage.incrementDownloads(resourceId);
        
        // Download file
        downloadFile(resource.fileData, resource.fileName);
        
        showToast('Download started', 'success');
        
        // Update stats if dashboard is visible
        if (document.getElementById('dashboard-view').classList.contains('active')) {
            loadDashboardStats();
        }
        
    } catch (error) {
        console.error('Download error:', error);
        showToast('Download failed. Please try again.', 'error');
    }
}

function populateUploadDepartmentDropdown() {
    const deptSelect = document.getElementById('resource-department');
    const currentUser = UserStorage.getCurrentUser();
    const departments = DepartmentStorage.getDepartments();

    deptSelect.innerHTML = '';

    if (currentUser && currentUser.department) {
        // Find user's department
        const userDept = departments.find(dept => dept.id === currentUser.department);
        if (userDept) {
            const option = document.createElement('option');
            option.value = userDept.id;
            option.textContent = userDept.name;
            deptSelect.appendChild(option);
            deptSelect.value = userDept.id;
            deptSelect.disabled = true; // Restrict selection
            // Populate dependent dropdowns
            populateCourseDropdown(userDept.id);
            populateLecturerDropdown(userDept.id);
        }
    } else {
        // Fallback: allow selection if no user
        deptSelect.innerHTML = '<option value="">Select Department</option>';
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            deptSelect.appendChild(option);
        });
        deptSelect.disabled = false;
    }
}




