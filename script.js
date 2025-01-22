
let currentUser = null;

function showSection(sectionId) {
    document.querySelectorAll('.todo-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

function login(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[email] && users[email].password === password) {
        currentUser = email;
        localStorage.setItem('currentUser', email);
        showSection('yearly-section');
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('main-nav').style.display = 'block';
        loadUserData();
    } else {
        alert('Invalid email or password');
    }
}

function register(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[email]) {
        alert('User already exists');
    } else {
        users[email] = { password };
        localStorage.setItem('users', JSON.stringify(users));
        login(email, password);
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('main-nav').style.display = 'none';
    showSection('auth-section');
}

function saveUserData() {
    if (currentUser) {
        const userData = {
            yearlyGoals: yearlyGoals,
            monthlyTasks: monthlyTasks,
            dailyTasks: dailyTasks
        };
        localStorage.setItem(`userData_${currentUser}`, JSON.stringify(userData));
    }
}

function loadUserData() {
    if (currentUser) {
        const userData = JSON.parse(localStorage.getItem(`userData_${currentUser}`)) || {};
        yearlyGoals = userData.yearlyGoals || [];
        monthlyTasks = userData.monthlyTasks || {};
        dailyTasks = userData.dailyTasks || [];
        renderYearlyGoals();
        renderMonthlyTasks();
        renderDailyTasks();
    }
}


let yearlyGoals = [];

function addYearlyGoal(goal, steps, monthlyTasks) {
    yearlyGoals.push({ goal, steps, monthlyTasks });
    saveUserData();
    renderYearlyGoals();
}

function renderYearlyGoals() {
    const yearlyGoalsList = document.getElementById('yearly-goals-list');
    yearlyGoalsList.innerHTML = '';
    yearlyGoals.forEach((goal, index) => {
        const goalElement = document.createElement('div');
        goalElement.classList.add('task-item');
        goalElement.innerHTML = `
            <h3>${goal.goal}</h3>
            <p><strong>Steps:</strong> ${goal.steps}</p>
            <h4>Monthly Tasks:</h4>
            <ul>
                ${Object.entries(goal.monthlyTasks).map(([month, task]) => `<li><strong>${month}:</strong> ${task}</li>`).join('')}
            </ul>
            <button onclick="deleteYearlyGoal(${index})">Delete</button>
        `;
        yearlyGoalsList.appendChild(goalElement);
    });
}

function deleteYearlyGoal(index) {
    yearlyGoals.splice(index, 1);
    saveUserData();
    renderYearlyGoals();
}


let monthlyTasks = {};

function addMonthlyTask(month, task, steps, relatedGoal) {
    if (!monthlyTasks[month]) {
        monthlyTasks[month] = [];
    }
    monthlyTasks[month].push({ task, steps, relatedGoal });
    saveUserData();
    renderMonthlyTasks();
}

function renderMonthlyTasks() {
    const monthSelect = document.getElementById('month-select');
    const selectedMonth = monthSelect.value;
    const monthlyTasksList = document.getElementById('monthly-tasks-list');
    monthlyTasksList.innerHTML = '';
    if (monthlyTasks[selectedMonth]) {
        monthlyTasks[selectedMonth].forEach((task, index) => {
            const taskElement = document.createElement('div');
            taskElement.classList.add('task-item');
            taskElement.innerHTML = `
                <h3>${task.task}</h3>
                <p><strong>Steps:</strong> ${task.steps}</p>
                <p><strong>Related Yearly Goal:</strong> ${task.relatedGoal}</p>
                <button onclick="deleteMonthlyTask('${selectedMonth}', ${index})">Delete</button>
            `;
            monthlyTasksList.appendChild(taskElement);
        });
    }
    renderHolidays(selectedMonth);
}

function deleteMonthlyTask(month, index) {
    monthlyTasks[month].splice(index, 1);
    saveUserData();
    renderMonthlyTasks();
}

function renderHolidays(month) {
    const holidays = {
        'January': ['New Year\'s Day'],
        'July': ['Independence Day'],
        'December': ['Christmas Day']
    };
    const holidaysList = document.getElementById('holidays-list');
    holidaysList.innerHTML = '<h3>Holidays:</h3>';
    if (holidays[month]) {
        const holidayItems = holidays[month].map(holiday => `<li>${holiday}</li>`).join('');
        holidaysList.innerHTML += `<ul>${holidayItems}</ul>`;
    } else {
        holidaysList.innerHTML += '<p>No holidays this month.</p>';
    }
}


let dailyTasks = [];

function addDailyTask(task, time) {
    dailyTasks.push({ task, time, completed: false });
    saveUserData();
    renderDailyTasks();
    scheduleNotification(task, time);
}

function renderDailyTasks() {
    const dailyTasksList = document.getElementById('daily-tasks-list');
    dailyTasksList.innerHTML = '';
    dailyTasks.sort((a, b) => a.time.localeCompare(b.time)).forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task-item');
        taskElement.innerHTML = `
            <h3>${task.task}</h3>
            <p><strong>Time:</strong> ${task.time}</p>
            <label>
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleDailyTaskCompletion(${index})">
                Completed
            </label>
            <button onclick="deleteDailyTask(${index})">Delete</button>
        `;
        dailyTasksList.appendChild(taskElement);
    });
}

function toggleDailyTaskCompletion(index) {
    dailyTasks[index].completed = !dailyTasks[index].completed;
    saveUserData();
    renderDailyTasks();
}

function deleteDailyTask(index) {
    dailyTasks.splice(index, 1);
    saveUserData();
    renderDailyTasks();
}


function scheduleNotification(task, time) {
    const now = new Date();
    const [hours, minutes] = time.split(':');
    const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    
    if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const fiveMinutesBefore = new Date(scheduledTime.getTime() - 5 * 60000);
    const timeDiff = fiveMinutesBefore.getTime() - now.getTime();

    setTimeout(() => {
        showNotification(`Task "${task}" starts in 5 minutes!`);
    }, timeDiff);

    setTimeout(() => {
        showNotification(`Task "${task}" has ended. Did you complete it?`, () => {
            const taskIndex = dailyTasks.findIndex(t => t.task === task && t.time === time);
            if (taskIndex !== -1) {
                toggleDailyTaskCompletion(taskIndex);
            }
        });
    }, timeDiff + 5 * 60000);
}

function showNotification(message, action) {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    
    if (action) {
        const actionButton = document.createElement('button');
        actionButton.textContent = 'Mark as Completed';
        actionButton.onclick = () => {
            action();
            notification.remove();
        };
        notification.appendChild(actionButton);
    }

    notificationContainer.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 10000);
}


document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    login(email, password);
});

document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
});

document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    register(email, password);
});
document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
});

document.getElementById('logout-btn').addEventListener('click', logout);

document.getElementById('yearly-btn').addEventListener('click', () => showSection('yearly-section'));
document.getElementById('monthly-btn').addEventListener('click', () => showSection('monthly-section'));
document.getElementById('daily-btn').addEventListener('click', () => showSection('daily-section'));

document.getElementById('yearly-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const goal = document.getElementById('yearly-goal').value;
    const steps = document.getElementById('yearly-steps').value;
    const monthlyTasks = {};
    document.querySelectorAll('.monthly-task').forEach(input => {
        monthlyTasks[input.dataset.month] = input.value;
    });
    addYearlyGoal(goal, steps, monthlyTasks);
    e.target.reset();
});

document.getElementById('monthly-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const month = document.getElementById('month-select').value;
    const task = document.getElementById('monthly-task').value;
    const steps = document.getElementById('monthly-steps').value;
    const relatedGoal = document.getElementById('related-yearly-goal').value;
    addMonthlyTask(month, task, steps, relatedGoal);
    e.target.reset();
});

document.getElementById('daily-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const task = document.getElementById('daily-task').value;
    const time = document.getElementById('task-time').value;
    addDailyTask(task, time);
    e.target.reset();
});

document.getElementById('month-select').addEventListener('change', renderMonthlyTasks);


document.getElementById('main-nav').style.display = 'none';
const storedUser = localStorage.getItem('currentUser');
if (storedUser) {
    currentUser = storedUser;
    showSection('yearly-section');
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-nav').style.display = 'block';
    loadUserData();
} else {
    showSection('auth-section');
}