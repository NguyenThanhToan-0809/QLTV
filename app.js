// State quản lý danh sách công việc
const USER_NAME = "Toàn";
let tasks = JSON.parse(localStorage.getItem('todo_tasks') || '[]');
let currentFilter = 'all';

// DOM Elements
const realtimeClockEl = document.getElementById('realtimeClock');
const greetingTextEl = document.getElementById('greetingText');
const subgreetingTextEl = document.getElementById('subgreetingText');
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const progressBar = document.getElementById('progressBar');
const progressStats = document.getElementById('progressStats');
const progressPercent = document.getElementById('progressPercent');
const filterTabs = document.querySelectorAll('.filter-tab');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// 1. Đồng hồ thời gian thực và Lời chào cá nhân hóa theo buổi
function updateClockAndGreeting() {
  const now = new Date();

  // Giờ/Phút/Giây liên tục cập nhật mỗi giây
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  realtimeClockEl.textContent = `${hours}:${minutes}:${seconds}`;

  // Cá nhân hoá lời chào theo buổi
  const hourVal = now.getHours();
  let timeGreeting = "Chào";
  let subMessage = "Hôm nay bạn thế nào?";

  if (hourVal >= 5 && hourVal < 11) {
    timeGreeting = "Chào buổi sáng";
    subMessage = "Khởi đầu một ngày làm việc đầy năng lượng nhé!";
  } else if (hourVal >= 11 && hourVal < 14) {
    timeGreeting = "Chào buổi trưa";
    subMessage = "Nhớ ăn trưa và nghỉ ngơi một chút nhé!";
  } else if (hourVal >= 14 && hourVal < 18) {
    timeGreeting = "Chào buổi chiều";
    subMessage = "Cùng hoàn thành nốt các mục tiêu hôm nay nào!";
  } else {
    timeGreeting = "Chào buổi tối";
    subMessage = "Thư giãn và kiểm tra lại những việc đã làm được nhé!";
  }

  greetingTextEl.innerHTML = `${timeGreeting}, ${USER_NAME}! 👋`;
  subgreetingTextEl.textContent = subMessage;
}

// Cập nhật đồng hồ mỗi giây 1 lần
setInterval(updateClockAndGreeting, 1000);
updateClockAndGreeting();

// 2. Quản lý lưu trữ LocalStorage & Dữ liệu
function saveTasks() {
  localStorage.setItem('todo_tasks', JSON.stringify(tasks));
  render();
}

function addTask(title) {
  // Kiểm tra nếu ô input trống -> alert
  if (!title || !title.trim()) {
    alert('Vui lòng nhập nội dung!');
    taskInput.focus();
    return;
  }

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newTask = {
    id: Date.now().toString(),
    title: title.trim(),
    completed: false,
    createdAt: timeStr
  };

  tasks.unshift(newTask);
  saveTasks();
  taskInput.value = '';
}

function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  saveTasks();
}

function deleteTask(id, buttonEl) {
  // Hiệu ứng mờ dần (fade out)
  const li = buttonEl ? buttonEl.closest('.task-item') : document.querySelector(`.task-item[data-id="${id}"]`);
  if (li) {
    li.classList.add('fade-out');
    setTimeout(() => {
      tasks = tasks.filter(task => task.id !== id);
      saveTasks();
    }, 300);
  } else {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
  }
}

function clearCompleted() {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
}

// 3. Render giao diện từ dữ liệu
function render() {
  // Lọc theo tab
  let filteredTasks = tasks;
  if (currentFilter === 'active') {
    filteredTasks = tasks.filter(t => !t.completed);
  } else if (currentFilter === 'completed') {
    filteredTasks = tasks.filter(t => t.completed);
  }

  // Trạng thái trống
  if (filteredTasks.length === 0) {
    taskList.innerHTML = '';
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    taskList.innerHTML = filteredTasks.map(task => `
      <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <div class="task-left">
          <div class="custom-checkbox" onclick="toggleTask('${task.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span class="task-content" onclick="toggleTask('${task.id}')" title="Bấm để đánh dấu hoàn thành">${escapeHTML(task.title)}</span>
          <span class="task-time-badge">${task.createdAt || ''}</span>
        </div>
        <button class="btn-delete" title="Xóa công việc" onclick="deleteTask('${task.id}', this)">
          <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
          <span>Xóa</span>
        </button>
      </li>
    `).join('');
  }

  // Cập nhật tiến độ
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  progressBar.style.width = `${percent}%`;
  progressStats.textContent = `${completed}/${total} việc hoàn thành`;
  progressPercent.textContent = `${percent}%`;

  // Nút dọn việc đã xong
  clearCompletedBtn.style.display = completed > 0 ? 'inline-block' : 'none';

  // Render lại icons
  if (window.lucide) {
    lucide.createIcons();
  }
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// 4. Lắng nghe sự kiện
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addTask(taskInput.value);
});

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    render();
  });
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// Khởi chạy khi load trang (tự động khôi phục từ LocalStorage)
render();
if (window.lucide) {
  lucide.createIcons();
}
