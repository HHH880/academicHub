// Local Storage Management for Academic Resource Hub

/**
 * Storage keys
 */
const STORAGE_KEYS = {
    USERS: 'academicHub_users',
    RESOURCES: 'academicHub_resources',
    DEPARTMENTS: 'academicHub_departments',
    COURSES: 'academicHub_courses',
    LECTURERS: 'academicHub_lecturers',
    CURRENT_USER: 'academicHub_currentUser',
    SETTINGS: 'academicHub_settings'
};

/**
 * Initialize default data
 */
function initializeDefaultData() {
    // Initialize departments if not exists
    if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
        const defaultDepartments = [
            { id: 'comp-sci', name: 'Computer Science', icon: 'fas fa-laptop-code' },
            { id: 'engineering', name: 'Engineering', icon: 'fas fa-cogs' },
            { id: 'mathematics', name: 'Mathematics', icon: 'fas fa-calculator' },
            { id: 'physics', name: 'Physics', icon: 'fas fa-atom' },
            { id: 'chemistry', name: 'Chemistry', icon: 'fas fa-flask' },
            { id: 'biology', name: 'Biology', icon: 'fas fa-dna' },
            { id: 'economics', name: 'Economics', icon: 'fas fa-chart-line' },
            { id: 'business', name: 'Business Administration', icon: 'fas fa-briefcase' },
            { id: 'psychology', name: 'Psychology', icon: 'fas fa-brain' },
            { id: 'literature', name: 'Literature', icon: 'fas fa-book-open' }
        ];
        localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(defaultDepartments));
    }

    // Initialize courses if not exists
    if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
        const defaultCourses = [
            // Computer Science
            { id: 'cs101', departmentId: 'comp-sci', code: 'CS101', name: 'Introduction to Programming', level: 100 },
            { id: 'cs201', departmentId: 'comp-sci', code: 'CS201', name: 'Data Structures', level: 200 },
            { id: 'cs301', departmentId: 'comp-sci', code: 'CS301', name: 'Algorithms', level: 300 },
            { id: 'cs401', departmentId: 'comp-sci', code: 'CS401', name: 'Software Engineering', level: 400 },
            
            // Engineering
            { id: 'eng101', departmentId: 'engineering', code: 'ENG101', name: 'Engineering Mathematics I', level: 100 },
            { id: 'eng201', departmentId: 'engineering', code: 'ENG201', name: 'Thermodynamics', level: 200 },
            { id: 'eng301', departmentId: 'engineering', code: 'ENG301', name: 'Control Systems', level: 300 },
            
            // Mathematics
            { id: 'math101', departmentId: 'mathematics', code: 'MATH101', name: 'Calculus I', level: 100 },
            { id: 'math201', departmentId: 'mathematics', code: 'MATH201', name: 'Linear Algebra', level: 200 },
            { id: 'math301', departmentId: 'mathematics', code: 'MATH301', name: 'Abstract Algebra', level: 300 },
            
            // Physics
            { id: 'phys101', departmentId: 'physics', code: 'PHYS101', name: 'General Physics I', level: 100 },
            { id: 'phys201', departmentId: 'physics', code: 'PHYS201', name: 'Quantum Mechanics', level: 200 },
            
            // Chemistry
            { id: 'chem101', departmentId: 'chemistry', code: 'CHEM101', name: 'General Chemistry', level: 100 },
            { id: 'chem201', departmentId: 'chemistry', code: 'CHEM201', name: 'Organic Chemistry', level: 200 }
        ];
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(defaultCourses));
    }

    // Initialize lecturers if not exists
    if (!localStorage.getItem(STORAGE_KEYS.LECTURERS)) {
        const defaultLecturers = [
            // Computer Science
            { id: 'lec001', departmentId: 'comp-sci', name: 'Dr. Sarah Johnson', title: 'Professor' },
            { id: 'lec002', departmentId: 'comp-sci', name: 'Prof. Michael Chen', title: 'Associate Professor' },
            { id: 'lec003', departmentId: 'comp-sci', name: 'Dr. Emily Rodriguez', title: 'Assistant Professor' },
            
            // Engineering
            { id: 'lec004', departmentId: 'engineering', name: 'Prof. David Williams', title: 'Professor' },
            { id: 'lec005', departmentId: 'engineering', name: 'Dr. Jennifer Lee', title: 'Associate Professor' },
            
            // Mathematics
            { id: 'lec006', departmentId: 'mathematics', name: 'Prof. Robert Taylor', title: 'Professor' },
            { id: 'lec007', departmentId: 'mathematics', name: 'Dr. Lisa Anderson', title: 'Assistant Professor' },
            
            // Physics
            { id: 'lec008', departmentId: 'physics', name: 'Prof. James Wilson', title: 'Professor' },
            { id: 'lec009', departmentId: 'physics', name: 'Dr. Maria Garcia', title: 'Associate Professor' },
            
            // Chemistry
            { id: 'lec010', departmentId: 'chemistry', name: 'Prof. Thomas Brown', title: 'Professor' },
            { id: 'lec011', departmentId: 'chemistry', name: 'Dr. Amanda Davis', title: 'Assistant Professor' }
        ];
        localStorage.setItem(STORAGE_KEYS.LECTURERS, JSON.stringify(defaultLecturers));
    }

    // Initialize empty arrays for users and resources if not exists
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.RESOURCES)) {
        localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify([]));
    }
}

/**
 * Get data from localStorage
 */
function getStorageData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return [];
    }
}

/**
 * Set data to localStorage
 */
function setStorageData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error writing to localStorage:', error);
        showToast('Storage error. Please check available space.', 'error');
        return false;
    }
}

/**
 * User management functions
 */
const UserStorage = {
    // Get all users
    getUsers() {
        return getStorageData(STORAGE_KEYS.USERS);
    },

    // Add new user
    addUser(user) {
        const users = this.getUsers();
        const newUser = {
            id: generateId(),
            ...user,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        users.push(newUser);
        return setStorageData(STORAGE_KEYS.USERS, users) ? newUser : null;
    },

    // Find user by email
    findUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email.toLowerCase() === email.toLowerCase());
    },

    // Update user
    updateUser(userId, updates) {
        const users = this.getUsers();
        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            return setStorageData(STORAGE_KEYS.USERS, users);
        }
        return false;
    },

    // Set current user
    setCurrentUser(user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    },

    // Get current user
    getCurrentUser() {
        try {
            const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            return null;
        }
    },

    // Logout user
    logout() {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
};

/**
 * Resource management functions
 */
const ResourceStorage = {
    // Get all resources
    getResources() {
        return getStorageData(STORAGE_KEYS.RESOURCES);
    },

    // Add new resource
    addResource(resource) {
        const resources = this.getResources();
        const newResource = {
            id: generateId(),
            ...resource,
            uploadDate: new Date().toISOString(),
            downloads: 0
        };
        resources.push(newResource);
        return setStorageData(STORAGE_KEYS.RESOURCES, resources) ? newResource : null;
    },

    // Get resources by department
    getResourcesByDepartment(departmentId) {
        const resources = this.getResources();
        return resources.filter(resource => resource.departmentId === departmentId);
    },

    // Get resources by course
    getResourcesByCourse(courseId) {
        const resources = this.getResources();
        return resources.filter(resource => resource.courseId === courseId);
    },

    // Get resources by lecturer
    getResourcesByLecturer(lecturerId) {
        const resources = this.getResources();
        return resources.filter(resource => resource.lecturerId === lecturerId);
    },

    // Get resources by user
    getResourcesByUser(userId) {
        const resources = this.getResources();
        return resources.filter(resource => resource.uploadedBy === userId);
    },

    // Get recent resources
    getRecentResources(limit = 10) {
        const resources = this.getResources();
        return resources
            .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
            .slice(0, limit);
    },

    // Search resources
    searchResources(query, filters = {}) {
        const resources = this.getResources();
        const searchTerm = query.toLowerCase();

        return resources.filter(resource => {
            // Text search
            const matchesText = !query || 
                resource.title.toLowerCase().includes(searchTerm) ||
                resource.description.toLowerCase().includes(searchTerm) ||
                resource.fileName.toLowerCase().includes(searchTerm);

            // Filter by department
            const matchesDepartment = !filters.department || 
                resource.departmentId === filters.department;

            // Filter by type
            const matchesType = !filters.type || 
                resource.type === filters.type;

            // Filter by year
            const matchesYear = !filters.year || 
                resource.year === filters.year;

            return matchesText && matchesDepartment && matchesType && matchesYear;
        });
    },

    // Update resource (increment downloads)
    incrementDownloads(resourceId) {
        const resources = this.getResources();
        const resourceIndex = resources.findIndex(r => r.id === resourceId);
        if (resourceIndex !== -1) {
            resources[resourceIndex].downloads += 1;
            setStorageData(STORAGE_KEYS.RESOURCES, resources);
        }
    },

    // Delete resource
    deleteResource(resourceId) {
        const resources = this.getResources();
        const filteredResources = resources.filter(r => r.id !== resourceId);
        return setStorageData(STORAGE_KEYS.RESOURCES, filteredResources);
    }
};

/**
 * Department management functions
 */
const DepartmentStorage = {
    getDepartments() {
        return getStorageData(STORAGE_KEYS.DEPARTMENTS);
    },

    findDepartmentById(id) {
        const departments = this.getDepartments();
        return departments.find(dept => dept.id === id);
    }
};

/**
 * Course management functions
 */
const CourseStorage = {
    getCourses() {
        return getStorageData(STORAGE_KEYS.COURSES);
    },

    getCoursesByDepartment(departmentId) {
        const courses = this.getCourses();
        return courses.filter(course => course.departmentId === departmentId);
    },

    findCourseById(id) {
        const courses = this.getCourses();
        return courses.find(course => course.id === id);
    }
};

/**
 * Lecturer management functions
 */
const LecturerStorage = {
    getLecturers() {
        return getStorageData(STORAGE_KEYS.LECTURERS);
    },

    getLecturersByDepartment(departmentId) {
        const lecturers = this.getLecturers();
        return lecturers.filter(lecturer => lecturer.departmentId === departmentId);
    },

    findLecturerById(id) {
        const lecturers = this.getLecturers();
        return lecturers.find(lecturer => lecturer.id === id);
    }
};

/**
 * Get storage statistics
 */
function getStorageStats() {
    const users = UserStorage.getUsers();
    const resources = ResourceStorage.getResources();
    const departments = DepartmentStorage.getDepartments();
    const currentUser = UserStorage.getCurrentUser();
    
    const userResources = currentUser ? 
        ResourceStorage.getResourcesByUser(currentUser.id) : [];

    return {
        totalUsers: users.length,
        totalResources: resources.length,
        totalDepartments: departments.length,
        myUploads: userResources.length,
        storageUsed: new Blob([JSON.stringify({
            users,
            resources,
            departments
        })]).size
    };
}

/**
 * Export data for backup
 */
function exportData() {
    const data = {
        users: UserStorage.getUsers(),
        resources: ResourceStorage.getResources(),
        departments: DepartmentStorage.getDepartments(),
        courses: CourseStorage.getCourses(),
        lecturers: LecturerStorage.getLecturers(),
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic-hub-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Data exported successfully');
}

/**
 * Clear all data (with confirmation)
 */
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Reinitialize default data
        initializeDefaultData();
        showToast('All data cleared successfully');
        
        // Reload the page
        window.location.reload();
    }
}

// ...existing code...

// Save backup to localStorage whenever data changes
function backupStorageData() {
    const backup = {
        users: UserStorage.getUsers(),
        resources: ResourceStorage.getResources(),
        departments: DepartmentStorage.getDepartments(),
        courses: CourseStorage.getCourses(),
        lecturers: LecturerStorage.getLecturers()
    };
    localStorage.setItem('academicHub_backup', JSON.stringify(backup));
}

// Call this after every setStorageData
function setStorageData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        backupStorageData(); // <-- Add this line
        return true;
    } catch (error) {
        console.error('Error writing to localStorage:', error);
        showToast('Storage error. Please check available space.', 'error');
        return false;
    }
}

// On page load, restore from backup if main data is missing
function restoreFromBackupIfNeeded() {
    const backup = localStorage.getItem('academicHub_backup');
    if (backup) {
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
            const data = JSON.parse(backup);
            setStorageData(STORAGE_KEYS.USERS, data.users || []);
        }
        if (!localStorage.getItem(STORAGE_KEYS.RESOURCES)) {
            const data = JSON.parse(backup);
            setStorageData(STORAGE_KEYS.RESOURCES, data.resources || []);
        }
        // Repeat for other keys if needed
    }
}

// Call this at the start of your app
restoreFromBackupIfNeeded();

// ...existing code...