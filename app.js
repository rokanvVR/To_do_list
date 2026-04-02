/**
 * To-Do Application Logic
 * Encapsulated via an IIFE to restrict scope.
 * Utilizes arrays, nested functions, and Local Storage API.
 */
const TodoApp = (function() {
    // 1. Data Store (Array)
    let tasks = [];

    // Keys
    const STORAGE_KEY = 'todo_app_tasks';

    // DOM Elements
    const elements = {
        taskForm: document.getElementById('task-form'),
        taskInput: document.getElementById('task-input'),
        categorySelect: document.getElementById('category-select'),
        tasksContainer: document.getElementById('tasks-container')
    };

    /**
     * Local Storage Operations (Nested Function pattern context)
     */
    function loadTasks() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                tasks = JSON.parse(stored);
            } catch (e) {
                console.error("Local Storage parse error", e);
                tasks = [];
            }
        }
    }

    function saveTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    /**
     * Core Logic Operations
     */
    function addTask(text, category) {
        const newTask = {
            id: Date.now().toString(),
            text: text,
            category: category,
            createdAt: new Date().toISOString()
        };
        // Array operation
        tasks.push(newTask);
        saveTasks();
        render();
    }

    function removeTask(id) {
        // Array operation
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        render();
    }

    /**
     * Grouping Data
     */
    function groupTasksByCategory() {
        // Here we demonstrate another nested function to handle the grouping
        const groupBy = (array, keyFn) => {
            return array.reduce((result, item) => {
                const key = keyFn(item);
                if (!result[key]) {
                    result[key] = [];
                }
                result[key].push(item);
                return result;
            }, {});
        };

        return groupBy(tasks, task => task.category);
    }

    /**
     * UI Rendering Engine
     */
    function render() {
        elements.tasksContainer.innerHTML = '';
        
        if (tasks.length === 0) {
            elements.tasksContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
                    No tasks found. Take a break!
                </div>
            `;
            return;
        }

        const groupedTasks = groupTasksByCategory();

        // Object.entries helps us iterate over the distinct groups
        for (const [category, categoryTasks] of Object.entries(groupedTasks)) {
            // Nested rendering function for section
            const renderGroupSection = (catName, tasksArr) => {
                const section = document.createElement('div');
                section.className = 'group-section';
                
                // Group Header
                const header = document.createElement('div');
                header.className = 'group-header';
                
                const title = document.createElement('h2');
                title.className = 'group-title';
                title.textContent = catName;

                const badge = document.createElement('span');
                badge.className = `group-badge ${catName}-badge`;
                badge.textContent = tasksArr.length;

                header.appendChild(title);
                header.appendChild(badge);
                section.appendChild(header);

                // Group List
                const list = document.createElement('ul');
                list.className = 'task-list';

                tasksArr.forEach(task => {
                    const listItem = document.createElement('li');
                    listItem.className = 'task-item';

                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'task-content';
                    
                    const textSpan = document.createElement('span');
                    textSpan.className = 'task-text';
                    textSpan.textContent = task.text;
                    
                    contentDiv.appendChild(textSpan);

                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'btn-delete';
                    deleteBtn.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    `;
                    // Event listener mapped to private function
                    deleteBtn.addEventListener('click', () => {
                        removeTask(task.id);
                    });

                    listItem.appendChild(contentDiv);
                    listItem.appendChild(deleteBtn);
                    list.appendChild(listItem);
                });

                section.appendChild(list);
                elements.tasksContainer.appendChild(section);
            };

            renderGroupSection(category, categoryTasks);
        }
    }

    /**
     * App Initialization
     */
    function setupEventListeners() {
        elements.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = elements.taskInput.value.trim();
            const category = elements.categorySelect.value;
            
            if (text) {
                addTask(text, category);
                elements.taskInput.value = '';
            }
        });
    }

    // Expose public initialization
    return {
        init: function() {
            loadTasks();
            setupEventListeners();
            render();
        }
    };
})();

// Bootstrap the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    TodoApp.init();
});
