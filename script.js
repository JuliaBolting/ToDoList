document.addEventListener('DOMContentLoaded', () => {
    const currentDateElement = document.getElementById('current-date');
    const newTaskBtn = document.querySelector('.new-task-btn');
    const newTaskModal = document.getElementById('newTaskModal');
    const closeButton = newTaskModal.querySelector('.close-button');
    const cancelBtn = newTaskModal.querySelector('.cancel-btn');
    const newTaskForm = document.getElementById('newTaskForm');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskCategoryInput = document.getElementById('taskCategory');
    const taskPriorityInput = document.getElementById('taskPriority');
    const taskDueDateInput = document.getElementById('taskDueDate');
    const taskList = document.getElementById('task-list');
    const totalTasksCount = document.getElementById('total-tasks-count');
    const completedTasksCount = document.getElementById('completed-tasks-count');
    const pendingTasksCount = document.getElementById('pending-tasks-count');
    const taskSearchInput = document.getElementById('task-search');
    const filterStatusSelect = document.getElementById('filter-status');
    const filterPrioritySelect = document.getElementById('filter-priority');
    const categoryList = document.getElementById('category-list');
    const upcomingDeadlinesList = document.getElementById('upcoming-deadlines-list');

    let tasks = [];

    let editingTaskId = null;

    function getFormattedDate() {
        const date = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = date.toLocaleDateString('pt-BR', options);
        return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        tasks = storedTasks ? JSON.parse(storedTasks) : [];
    }

    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;

        totalTasksCount.textContent = total;
        completedTasksCount.textContent = completed;
        pendingTasksCount.textContent = pending;

        updateCategoryCounts();
        updateUpcomingDeadlines();
    }

    function getCategoryColor(category) {
        switch (category) {
            case 'Trabalho': return 'var(--category-trabalho)';
            case 'Pessoal': return 'var(--category-pessoal)';
            case 'Estudos': return 'var(--category-estudos)';
            case 'Compras': return 'var(--category-compras)';
            default: return 'var(--category-outros)';
        }
    }

    function getPriorityClass(priority) {
        switch (priority) {
            case 'Alta': return 'Alta';
            case 'Média': return 'Média';
            case 'Baixa': return 'Baixa';
            default: return '';
        }
    }

    function getPriorityColor(priority) {
        switch (priority) {
            case 'Alta': return 'var(--priority-alta)';
            case 'Média': return 'var(--priority-media)';
            case 'Baixa': return 'var(--priority-baixa)';
            default: return '';
        }
    }

    function renderTasks() {
        taskList.innerHTML = '';
        const searchTerm = taskSearchInput.value.toLowerCase();
        const filterStatus = filterStatusSelect.value;
        const filterPriority = filterPrioritySelect.value;

        const filteredTasks = tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm);
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'completed' && task.completed) ||
                (filterStatus === 'pending' && !task.completed);
            const matchesPriority = filterPriority === 'all' ||
                task.priority.toLowerCase() === filterPriority.toLowerCase();


            return matchesSearch && matchesStatus && matchesPriority;
        });

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p class="no-tasks-message">Nenhuma tarefa encontrada.</p>';
            return;
        }

        filteredTasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');
            taskItem.style.borderLeft = `6px solid ${getPriorityColor(task.priority)}`;
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            taskItem.dataset.id = task.id;

            const formattedDueDate = task.dueDate ? new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Sem Data';
            const displayDueDate = task.dueDate ? new Date(task.dueDate + 'T00:00:00') : null;
            let dueDateText = `<span class="due-normal">${formattedDueDate}</span>`;
            let calendarClass = 'calendar-normal';

            if (displayDueDate && !task.completed) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const taskDate = new Date(displayDueDate);
                taskDate.setHours(0, 0, 0, 0);

                const diffTime = taskDate - today;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (taskDate.getTime() === today.getTime()) {
                    dueDateText = `<span class="due-warning">Hoje</span>`;
                    calendarClass = 'calendar-warning';
                } else if (diffDays === 1) {
                    dueDateText = `<span class="due-warning">Amanhã</span>`;
                    calendarClass = 'calendar-warning';
                } else if (taskDate < today) {
                    dueDateText = `<span class="due-late">${formattedDueDate} (Atrasada)</span>`;
                    calendarClass = 'calendar-late';
                }
            }

            taskItem.innerHTML = `
                <div class="checkbox-actions">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <h3>${task.title}</h3>
                    <div class="task-actions">
                        <button class="edit-btn" title="Editar Tarefa"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" title="Excluir Tarefa"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div class="task-details">
                    <p>${task.description}</p>
                    <div class="task-meta">
                        <span class="category-tag ${task.category}">${task.category}</span>
                        <span class="priority-tag ${getPriorityClass(task.priority)}" style="background-color: ${getPriorityColor(task.priority)}; color: ${task.priority === 'Média' ? 'var(--text-dark)' : 'var(--white)'};">Prioridade: ${task.priority}</span>
                        <span><i class="fas fa-calendar-alt ${calendarClass}"></i> ${dueDateText}</span>
                    </div>
                </div>
            `;

            taskList.appendChild(taskItem);
        });
        updateStats();
    }

    newTaskBtn.addEventListener('click', () => {
        newTaskModal.classList.add('active');
        newTaskForm.reset();
        editingTaskId = null;
        newTaskModal.querySelector('h2').textContent = 'Nova Tarefa';
        newTaskModal.querySelector('.save-btn').textContent = 'Salvar';
        taskTitleInput.focus();
    });

    closeButton.addEventListener('click', () => {
        newTaskModal.classList.remove('active');
    });

    cancelBtn.addEventListener('click', () => {
        newTaskModal.classList.remove('active');
    });

    newTaskModal.addEventListener('click', (e) => {
        if (e.target === newTaskModal) {
            newTaskModal.classList.remove('active');
        }
    });

    newTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();
        const category = taskCategoryInput.value;
        const priority = taskPriorityInput.value;
        const dueDate = taskDueDateInput.value;
        if (!title) {
            alert('Título é obrigatório!');
            return;
        }

        if (editingTaskId) {
            const taskIndex = tasks.findIndex(task => task.id === editingTaskId);
            if (taskIndex !== -1) {
                tasks[taskIndex] = {
                    ...tasks[taskIndex],
                    title,
                    description,
                    category,
                    priority,
                    dueDate
                };
            }
            editingTaskId = null;
        } else {
            const newTask = {
                id: Date.now(),
                title,
                description,
                category,
                priority,
                dueDate,
                completed: false
            };
            tasks.unshift(newTask);
        }

        saveTasks();
        renderTasks();
        newTaskModal.classList.remove('active');
        newTaskForm.reset();
    });

    document.querySelectorAll('.stats-cards .card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.stats-cards .card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            if (card.classList.contains('total-tasks')) {
                filterStatusSelect.value = 'all';
            } else if (card.classList.contains('completed-tasks')) {
                filterStatusSelect.value = 'completed';
            } else if (card.classList.contains('pending-tasks')) {
                filterStatusSelect.value = 'pending';
            }

            renderTasks();
        });
    });

    taskList.addEventListener('click', (e) => {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        const taskId = parseInt(taskItem.dataset.id);
        const task = tasks.find(t => t.id === taskId);
        taskDueDateInput.value = task.dueDate;

        if (e.target.type === 'checkbox') {
            if (task) {
                task.completed = e.target.checked;
                saveTasks();
                renderTasks();
            }
        } else if (e.target.closest('.edit-btn')) {
            if (task) {
                editingTaskId = task.id;
                taskTitleInput.value = task.title;
                taskDescriptionInput.value = task.description;
                taskCategoryInput.value = task.category;
                taskPriorityInput.value = task.priority;
                taskDueDateInput.value = task.dueDate;

                newTaskModal.classList.add('active');
                newTaskModal.querySelector('h2').textContent = 'Editar Tarefa';
                newTaskModal.querySelector('.save-btn').textContent = 'Salvar Edição';
            }
        } else if (e.target.closest('.delete-btn')) {
            if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                tasks = tasks.filter(t => t.id !== taskId);
                saveTasks();
                renderTasks();
            }
        }
    });

    taskSearchInput.addEventListener('input', renderTasks);
    filterStatusSelect.addEventListener('change', renderTasks);
    filterPrioritySelect.addEventListener('change', renderTasks);

    function updateCategoryCounts() {
        const categoryCounts = {};
        tasks.forEach(task => {
            if (categoryCounts[task.category]) {
                categoryCounts[task.category]++;
            } else {
                categoryCounts[task.category] = 1;
            }
        });

        document.querySelectorAll('.category-count').forEach(span => {
            const categoryName = span.dataset.category;
            span.textContent = categoryCounts[categoryName] || 0;
        });
    }

    function updateUpcomingDeadlines() {
        upcomingDeadlinesList.innerHTML = '';
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = tasks
            .filter(task => !task.completed && task.dueDate)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        let tasksToShow = 0;

        upcoming.forEach(task => {
            if (tasksToShow >= 3) return;

            const taskDate = new Date(task.dueDate + 'T00:00:00');

            if (taskDate < today) return;

            const listItem = document.createElement('li');
            const formattedDate = taskDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

            let displayDate = formattedDate;
            if (taskDate.getTime() === today.getTime()) {
                displayDate = 'Hoje';
            }

            listItem.innerHTML = `
                <span class="deadline-title">${task.title}</span>
                <span class="deadline-date">${displayDate}</span>
            `;
            upcomingDeadlinesList.appendChild(listItem);
            tasksToShow++;
        });

        if (upcomingDeadlinesList.children.length === 0) {
            upcomingDeadlinesList.innerHTML = '<p class="no-deadlines-message">Nenhum prazo próximo.</p>';
        }
    }


    currentDateElement.textContent = getFormattedDate();
    loadTasks();
    renderTasks();
});