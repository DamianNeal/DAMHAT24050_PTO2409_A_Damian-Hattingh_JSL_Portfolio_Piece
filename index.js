import { getTasks, createNewTask, patchTask, deleteTask } from './utils/taskFunction.js';
import { initialData } from './utils/initialData.js';

// Used localStorage.setItem with JSON.stringify to store initialData.
// Also set 'showSideBar' to 'true' by default.
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData));
    localStorage.setItem('showSideBar', 'true');
  }
}
initializeData();

// Mapped and stored all DOM elements using getElementById, querySelector, and querySelectorAll
const elements = {
  headerBoardName: document.getElementById('header-board-name'),
  filterDiv: document.getElementById('filterDiv'),
  modalWindow: document.getElementById('new-task-modal-window'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  columnDivs: document.querySelectorAll('.column-div'),
  saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  deleteTaskBtn: document.getElementById('delete-task-btn'),
  editTitleInput: document.getElementById('edit-task-title-input'),
  editDescInput: document.getElementById('edit-task-desc-input'),
  editStatusSelect: document.getElementById('edit-select-status'),
  createBoardBtn: document.getElementById('create-board-btn'),
  boardModal: document.getElementById('new-board-modal'),
  cancelNewBoardBtn: document.getElementById('cancel-new-board-btn'),
  boardNameInput: document.getElementById('board-name-input'),
  deleteBoardBtn: document.getElementById('deleteBoardBtn'),
};

let activeBoard = "";

// Set activeBoard using getTasks(), filtered boards with Set and map(), and fallback logic using JSON.parse and localStorage.
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);

  if (boards.length > 0) {
    const stored = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = stored || boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  } else {
    activeBoard = "";
    elements.headerBoardName.textContent = "";
    elements.columnDivs.forEach(col => col.querySelector(".tasks-container").innerHTML = "");
  }
}

// [Fix] Replaced broken inline click logic with event listeners using addEventListener, createElement, and appendChild.
function displayBoards(boards) {
  const container = document.getElementById("boards-nav-links-div");
  container.innerHTML = '<h4 id="headline-sidepanel">ALL BOARDS</h4>';

  boards.forEach(board => {
    const btn = document.createElement("button");
    btn.textContent = board;
    btn.classList.add("board-btn");
    btn.addEventListener("click", () => {
      activeBoard = board;
      elements.headerBoardName.textContent = board;
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
      refreshTasksUI();
    });
    container.appendChild(btn);
  });

  container.appendChild(elements.createBoardBtn);
}

// Used classList.toggle to apply 'active' class to selected board button.
function styleActiveBoard(name) {
  document.querySelectorAll('.board-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === name);
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Used filter() and getAttribute to match tasks to column status, then created DOM elements using createElement and appendChild.
// [Fix] Replaced '=' with '===' to correctly filter tasks.
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks().filter(t => t.board === boardName);
  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    column.innerHTML = `
      <div class="column-head-div">
        <span class="dot" id="${status}-dot"></span>
        <h4 class="columnHeader">${status.toUpperCase()}</h4>
      </div>`;
    const container = document.createElement("div");
    container.className = "tasks-container";

    tasks.filter(t => t.status === status).forEach(task => {
      const taskEl = document.createElement("div");
      taskEl.className = "task-div";
      taskEl.textContent = task.title;
      taskEl.setAttribute("data-task-id", task.id);
      taskEl.addEventListener("click", () => openEditTaskModal(task));
      container.appendChild(taskEl);
    });

    column.appendChild(container);
  });
}

// [Modal Handling] Used ternary operator and style.display to show/hide modals.
// [Fix] Replaced invalid arrow syntax for modal toggle.
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none';
}

// [Add Task] Retrieved form values using .value, created task object, called createNewTask(), then reset form with reset().
// [Fix] Completed missing addTask logic from starter code.
function addTask(event) {
  event.preventDefault();
  const title = document.getElementById('title-input').value.trim();
  const desc = document.getElementById('desc-input').value.trim();
  const status = document.getElementById('select-status').value;

  if (!title || !status) return;

  const task = { title, description: desc, status, board: activeBoard };
  const newTask = createNewTask(task);
  if (newTask) {
    toggleModal(false);
    elements.modalWindow.reset();
    elements.filterDiv.style.display = 'none';
    refreshTasksUI();
  }
}

// Used setAttribute and input.value to populate modal with task data, then displayed modal using toggleModal().
// [Fix] Replaced broken click event in starter code.
function openEditTaskModal(task) {
  elements.editTaskModal.setAttribute("data-task-id", task.id);
  elements.editTitleInput.value = task.title;
  elements.editDescInput.value = task.description;
  elements.editStatusSelect.value = task.status;
  toggleModal(true, elements.editTaskModal);
  elements.filterDiv.style.display = 'block';
}

// Used input.value and patchTask() to update task, then refreshed UI and hid modal.
// [Fix] Added save functionality missing from original code.
function saveTaskChanges(taskId) {
  const updates = {
    title: elements.editTitleInput.value.trim(),
    description: elements.editDescInput.value.trim(),
    status: elements.editStatusSelect.value
  };
  patchTask(taskId, updates);
  toggleModal(false, elements.editTaskModal);
  elements.filterDiv.style.display = 'none';
  refreshTasksUI();
}

// Used classList.toggle to show/hide sidebar, updated button visibility, and stored state using localStorage.setItem.
// [Fix] Corrected toggle logic syntax.
function toggleSidebar(show) {
  const sidebar = document.querySelector('.side-bar');
  sidebar.classList.toggle('show-sidebar', show);
  localStorage.setItem('showSideBar', show.toString());
  elements.showSideBarBtn.style.display = show ? 'none' : 'block';
}

// [Theme Toggle] Used classList.toggle to switch themes, updated logo source, and saved preference in localStorage.
function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem('light-theme', isLight ? 'enabled' : 'disabled');
  document.getElementById("logo").src = isLight ? "./assets/logo-light.svg" : "./assets/logo-dark.svg";
}

// Connected UI elements to event listeners using addEventListener for clicks, submits, and theme toggle.
// Used helper functions like toggleModal, addTask, saveTaskChanges, deleteTask, and modal display logic.
function setupEventListeners() {
  elements.cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
  });

  elements.cancelEditBtn.addEventListener('click', () => {
    toggleModal(false, elements.editTaskModal);
    elements.filterDiv.style.display = 'none';
  });

  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));
  elements.themeSwitch.addEventListener('change', toggleTheme);
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block';
  });
  elements.modalWindow.addEventListener('submit', addTask);
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    toggleModal(false, elements.editTaskModal);
    toggleModal(false, elements.boardModal);
    document.getElementById("editBoardDiv").style.display = "none";
    elements.filterDiv.style.display = 'none';
  });

  elements.saveTaskChangesBtn.addEventListener('click', () => {
    const id = parseInt(elements.editTaskModal.getAttribute("data-task-id"));
    saveTaskChanges(id);
  });

  elements.deleteTaskBtn.addEventListener('click', () => {
    const id = parseInt(elements.editTaskModal.getAttribute("data-task-id"));
    deleteTask(id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
  });

   // Used stopPropagation to keep board dropdown open when clicking inside, and global click to close when clicking outside.
  const editBoardBtn = document.getElementById("edit-board-btn");
  const editBoardDiv = document.getElementById("editBoardDiv");
  editBoardBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    editBoardDiv.style.display = editBoardDiv.style.display === "flex" ? "none" : "flex";
  });
  document.addEventListener("click", (e) => {
    if (!editBoardDiv.contains(e.target) && e.target !== editBoardBtn) {
      editBoardDiv.style.display = "none";
    }
  });

  elements.createBoardBtn.addEventListener("click", () => {
    toggleModal(true, elements.boardModal);
    elements.filterDiv.style.display = "block";
  });

  elements.cancelNewBoardBtn.addEventListener("click", () => {
    toggleModal(false, elements.boardModal);
    elements.filterDiv.style.display = "none";
  });

  elements.boardModal.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = elements.boardNameInput.value.trim();
    if (!name) return;

    const existing = getTasks().some(task => task.board === name);
    if (existing) {
      alert("Board already exists.");
      return;
    }

    createNewTask({
      title: "Welcome to " + name,
      description: "Start building your board!",
      status: "todo",
      board: name
    });

    localStorage.setItem("activeBoard", JSON.stringify(name));
    elements.boardModal.reset();
    toggleModal(false, elements.boardModal);
    elements.filterDiv.style.display = "none";
    fetchAndDisplayBoardsAndTasks();
  });

  // Used confirm() to verify delete action, filtered out tasks using filter(), and updated localStorage.
  elements.deleteBoardBtn.addEventListener("click", () => {
    if (!confirm(`Delete board "${activeBoard}"? This can't be undone.`)) return;
    const updated = getTasks().filter(task => task.board !== activeBoard);
    localStorage.setItem("tasks", JSON.stringify(updated));
    localStorage.removeItem("activeBoard");
    document.getElementById("editBoardDiv").style.display = "none";
    fetchAndDisplayBoardsAndTasks();
  });
}

// Used addEventListener('DOMContentLoaded') to delay setup until DOM is fully loaded.
// [Fix] Starter code ran init before DOM load, causing element reference errors.
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  toggleSidebar(localStorage.getItem('showSideBar') === 'true');
  document.body.classList.toggle('light-theme', localStorage.getItem('light-theme') === 'enabled');
  fetchAndDisplayBoardsAndTasks();
});
