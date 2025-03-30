export const getTasks = () => {
  const tasks = localStorage.getItem('tasks');
  return tasks ? JSON.parse(tasks) : [];
};

const saveTasks = (tasks) => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

export const createNewTask = (task) => {
  const tasks = getTasks();
  const newTask = { ...task, id: new Date().getTime() };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
};

export const patchTask = (id, updates) => {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex > -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    saveTasks(tasks);
  }
  return tasks;
};

export const putTask = (id, updatedTask) => {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex > -1) {
    tasks[taskIndex] = updatedTask;
    saveTasks(tasks);
  }
  location.reload();
};

export const deleteTask = (id) => {
  const tasks = getTasks();
  const updatedTasks = tasks.filter(task => task.id !== id);
  saveTasks(updatedTasks);
  return updatedTasks;
};
