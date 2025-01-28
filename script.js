let currentUser = null;

let yearlyGoals = [];
let monthlyTasks = {};
let dailyTasks = [];


const authSection = document.getElementById('auth-section');
const mainSection = document.getElementById('main-section');
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');


document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    loginContainer.style.display = 'none';
    registerContainer.style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    registerContainer.style.display = 'none';
    loginContainer.style.display = 'block';
});


function login(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[email] && users[email].password === password) {
        currentUser = email;
        localStorage.setItem('currentUser', email);
        showMainApp();
        loadUserData();
    } else {
        alert('Invalid email or password');
    }
}

function register(name, email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[email]) {
        alert('User already exists');
        return;
    }
    users[email] = { name, password };
    localStorage.setItem('users', JSON.stringify(users));
    login(email, password);
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    authSection.style.display = 'block';
    mainSection.style.display = 'none';
}


document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    login(email, password);
});

document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    register(name, email, password);
});


function showMainApp() {
    authSection.style.display = 'none';
    mainSection.style.display = 'block';
    showSection('yearly-section');
}

function showSection(sectionId) {
    document.querySelectorAll('.task-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
    
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[id^="${sectionId.split('-')[0]}"]`).classList.add('active');
}


function addYearlyGoal(goal, description) {
    const newGoal = { goal, description, completed: false };
    yearlyGoals.push(newGoal);
    saveUserData();
    renderYearlyGoals();
    generateMonthlyTasks(newGoal);
}

function generateMonthlyTasks(yearlyGoal) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    months.forEach(month => {
        if (!monthlyTasks[month]) {
            monthlyTasks[month] = [];
        }
        monthlyTasks[month].push({
            task: `Work on: ${yearlyGoal.goal}`,
            steps: `Monthly progress for: ${yearlyGoal.description}`,
            completed: false
        });
    });
    saveUserData();
    renderMonthlyTasks();
}

function addMonthlyTask(month, task, steps) {
    if (!monthlyTasks[month]) {
        monthlyTasks[month] = [];
    }
    monthlyTasks[month].push({ task, steps, completed: false });
    saveUserData();
    renderMonthlyTasks();
    generateDailyTasks(month, task);
}

function generateDailyTasks(month, monthlyTask) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const daysInMonth = new Date(new Date().getFullYear(), months.indexOf(month) + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
        dailyTasks.push({
            task: `${monthlyTask} - Day ${i}`,
            time: '09:00',
            completed: false,
            date: `${month} ${i}, ${new Date().getFullYear()}`
        });
    }
    saveUserData();
    renderDailyTasks();
}

function addDailyTask(task, time, interval) {
    const today = new Date();
    const taskDate = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
    dailyTasks.push({ task, time, interval, completed: false, date: taskDate });
    saveUserData();
    renderDailyTasks();
    scheduleTaskNotification(task, time, interval);
}


function scheduleTaskNotification(task, time, interval) {
    const [hours, minutes] = time.split(':');
    const taskTime = new Date();
    taskTime.setHours(hours, minutes, 0, 0);
    
    const notificationTime = new Date(taskTime.getTime() - 5 * 60000); // 5 minutes before
    const now = new Date();
    
    if (notificationTime > now) {
        const timeUntilNotification = notificationTime.getTime() - now.getTime();
        setTimeout(() => showNotification(`Your task "${task}" starts in 5 minutes!`), timeUntilNotification);
        
        const timeUntilCompletion = taskTime.getTime() + interval * 60000 - now.getTime();
        setTimeout(() => showNotification(`Did you complete your task "${task}"?`), timeUntilCompletion);
    }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}


function renderYearlyGoals() {
    const container = document.getElementById('yearly-goals-list');
    container.innerHTML = '';
    yearlyGoals.forEach((goal, index) => {
        const element = createTaskElement(goal.goal, goal.description, index, 'yearly');
        container.appendChild(element);
    });
}

function renderMonthlyTasks() {
    const container = document.getElementById('monthly-tasks-list');
    const month = document.getElementById('month-select').value;
    container.innerHTML = '';
    if (monthlyTasks[month]) {
        monthlyTasks[month].forEach((task, index) => {
            const element = createTaskElement(task.task, task.steps, index, 'monthly');
            container.appendChild(element);
        });
    }
}

function renderDailyTasks() {
    const container = document.getElementById('daily-tasks-list');
    container.innerHTML = '';
    const today = new Date();
    const todayString = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
    dailyTasks.filter(task => task.date === todayString).forEach((task, index) => {
        const element = createTaskElement(task.task, `Time: ${task.time}, Duration: ${task.interval} minutes`, index, 'daily');
        container.appendChild(element);
    });
}

function createTaskElement(title, description, index, type) {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.innerHTML = `
        <h3>${title}</h3>
        <p>${description}</p>
        <div class="task-actions">
            <button onclick="deleteTask('${type}', ${index})" class="delete-btn">Delete</button>
            <button onclick="toggleComplete('${type}', ${index})" class="complete-btn">
                ${isTaskComplete(type, index) ? 'Completed' : 'Mark Complete'}
            </button>
        </div>
    `;
    return div;
}


function deleteTask(type, index) {
    switch (type) {
        case 'yearly':
            yearlyGoals.splice(index, 1);
            renderYearlyGoals();
            break;
        case 'monthly':
            const month = document.getElementById('month-select').value;
            monthlyTasks[month].splice(index, 1);
            renderMonthlyTasks();
            break;
        case 'daily':
            dailyTasks.splice(index, 1);
            renderDailyTasks();
            break;
    }
    saveUserData();
}

function toggleComplete(type, index) {
    switch (type) {
        case 'yearly':
            yearlyGoals[index].completed = !yearlyGoals[index].completed;
            renderYearlyGoals();
            break;
        case 'monthly':
            const month = document.getElementById('month-select').value;
            monthlyTasks[month][index].completed = !monthlyTasks[month][index].completed;
            renderMonthlyTasks();
            break;
        case 'daily':
            dailyTasks[index].completed = !dailyTasks[index].completed;
            renderDailyTasks();
            break;
    }
    saveUserData();
}

function isTaskComplete(type, index) {
    switch (type) {
        case 'yearly':
            return yearlyGoals[index].completed;
        case 'monthly':
            const month = document.getElementById('month-select').value;
            return monthlyTasks[month][index].completed;
        case 'daily':
            return dailyTasks[index].completed;
        default:
            return false;
    }
}


function saveUserData() {
    if (currentUser) {
        const userData = {
            yearlyGoals,
            monthlyTasks,
            dailyTasks
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


document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('yearly-btn').addEventListener('click', () => showSection('yearly-section'));
document.getElementById('monthly-btn').addEventListener('click', () => showSection('monthly-section'));
document.getElementById('daily-btn').addEventListener('click', () => showSection('daily-section'));

document.getElementById('yearly-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const goal = document.getElementById('yearly-goal').value;
    const description = document.getElementById('yearly-steps').value;
    addYearlyGoal(goal, description);
    e.target.reset();
});

document.getElementById('monthly-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const month = document.getElementById('month-select').value;
    const task = document.getElementById('monthly-task').value;
    const steps = document.getElementById('monthly-steps').value;
    addMonthlyTask(month, task, steps);
    e.target.reset();
});

document.getElementById('daily-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const task = document.getElementById('daily-task').value;
    const time = document.getElementById('task-time').value;
    const interval = parseInt(document.getElementById('task-interval').value, 10);
    addDailyTask(task, time, interval);
    e.target.reset();
});

const months = ['January', 'February', 'March', 'April', 'May', 'June', 
               'July', 'August', 'September', 'October', 'November', 'December'];

function initializeApp() {
   
    const monthSelect = document.getElementById('month-select');
    months.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        monthSelect.appendChild(option);
    });

    const currentDate = new Date();
    monthSelect.value = months[currentDate.getMonth()];

    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = storedUser;
        showMainApp();
        loadUserData();
    }
}

initializeApp();