let tasks = [];

// Fetch all tasks from the backend
const fetchTasks = async () => {
    try {
        const response = await fetch('/items');
        tasks = await response.json();
        updateTaskList();
        updateStats();
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
    }
};

// Add a new task (POST request to backend)
const addTask = async () => {
    const taskInput = document.getElementById('taskInput');
    const text = taskInput.value.trim();

    if (text) {
        try {
            const response = await fetch('/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: text, description: '' })
            });
            const newTask = await response.json();
            tasks.push(newTask);
            taskInput.value = "";
            updateTaskList();
            updateStats();
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    }
};

// Toggle task completion (PUT request to backend)
const toggleTaskComplete = async (index) => {
    const task = tasks[index];
    const updatedTask = { ...task, completed: task.completed ? 0 : 1 };

    try {
        const response = await fetch(`/items/${task.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask)
        });
        const updatedTaskFromBackend = await response.json();
        tasks[index] = updatedTaskFromBackend;
        updateTaskList();
        updateStats();
    } catch (error) {
        console.error('Failed to toggle task:', error);
    }
};

// Delete a task (DELETE request to backend)
const deleteTask = async (index) => {
    const task = tasks[index];

    try {
        await fetch(`/items/${task.id}`, { method: 'DELETE' });
        tasks.splice(index, 1);
        updateTaskList();
        updateStats();
    } catch (error) {
        console.error('Failed to delete task:', error);
    }
};

// Edit a task (PUT request to backend)
const editTask = (index) => {
    const taskInput = document.getElementById('taskInput');
    taskInput.value = tasks[index].name; // Load the task text into the input
    deleteTask(index); // Remove the task to simulate editing
};

// Update task list in the UI
const updateTaskList = () => {
    const taskList = document.querySelector('.task-list');
    if (!taskList) {
        console.error("Task list element not found!");
        return;
    }

    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        const listItem = document.createElement('li');

        listItem.innerHTML = `
            <div class="taskItem">
                <div class="task ${task.completed ? "completed" : ""}">
                    <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""}/>
                    <p>${task.name}</p>
                </div>
                <div class="icons">
                    <img src="img/write.png" onClick="editTask(${index})" />
                    <img src="img/delete.png"  onClick="deleteTask(${index})" />
                </div>
            </div>`;

        listItem.querySelector('.checkbox').addEventListener('change', () => toggleTaskComplete(index));
        taskList.appendChild(listItem);
    });
};

// Update task statistics
const updateStats = () => {
    const completedTasks = tasks.filter((task) => task.completed).length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const progressBar = document.getElementById('progress');
    progressBar.style.width = `${progress}%`;
    document.getElementById('numbers').innerText = `${completedTasks} / ${totalTasks}`;
};

// Load tasks when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();

    document.getElementById('newTask').addEventListener('click', function (e) {
        e.preventDefault();
        addTask();
    });
});
