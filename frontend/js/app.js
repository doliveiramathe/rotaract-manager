const token = localStorage.getItem("rotaractToken");
const storedUser = JSON.parse(localStorage.getItem("rotaractUser") || "null");

if (!token || !storedUser) {
  window.location.href = "login.html";
}

const state = {
  user: storedUser,
  members: [],
  projects: [],
  tasks: [],
  view: storedUser.role === "presidente" ? "projects" : "myTasks",
};

const content = document.querySelector("#content");
const nav = document.querySelector("#nav");
const stats = document.querySelector("#stats");
const pageTitle = document.querySelector("#pageTitle");
const notice = document.querySelector("#notice");

document.querySelector("#userName").textContent = state.user.name;
document.querySelector("#userRole").textContent =
  state.user.role === "presidente" ? "Presidente" : "Membro";
document.querySelector("#logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("rotaractToken");
  localStorage.removeItem("rotaractUser");
  window.location.href = "login.html";
});

async function api(path, options = {}) {
  if (token.startsWith("local-") || window.location.protocol === "file:") {
    return window.RotaractLocal.request(path, options, state.user);
  }

  try {
    const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    });

    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "login.html";
      return null;
    }

    if (response.status === 204) {
      return null;
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Algo deu errado.");
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      return window.RotaractLocal.request(path, options, state.user);
    }
    throw error;
  }
}

function showNotice(message) {
  notice.textContent = message;
  notice.classList.remove("hidden");
  window.setTimeout(() => notice.classList.add("hidden"), 2800);
}

function formatDate(value) {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

function statusLabel(value) {
  const labels = {
    andamento: "Em andamento",
    concluido: "Concluído",
    cancelado: "Cancelado",
    realizada: "Realizada",
    nao_realizada: "Não realizada",
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
  };
  return labels[value] || value;
}

function emptyState() {
  return document.querySelector("#emptyTemplate").innerHTML;
}

function projectOptions() {
  return state.projects
    .filter((project) => project.status === "andamento")
    .map((project) => `<option value="${project.id}">${project.name}</option>`)
    .join("");
}

function membersChecklist() {
  const members = state.members.filter((member) => member.role === "membro");
  if (!members.length) {
    return '<span class="helper">Cadastre membros antes de criar tarefas.</span>';
  }

  return members
    .map(
      (member) => `
        <label>
          <input type="checkbox" name="member_ids" value="${member.id}" />
          ${member.name}
        </label>
      `
    )
    .join("");
}

function renderNav() {
  const presidentItems = [
    ["projects", "Projetos"],
    ["tasks", "Tarefas"],
    ["members", "Membros"],
    ["general", "Geral"],
  ];
  const memberItems = [
    ["myTasks", "Minhas tarefas"],
    ["general", "Geral"],
  ];

  const items = state.user.role === "presidente" ? presidentItems : memberItems;
  nav.innerHTML = items
    .map(
      ([view, label]) => `
        <button class="${state.view === view ? "active" : ""}" type="button" data-view="${view}">
          ${label}
        </button>
      `
    )
    .join("");

  nav.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      render();
    });
  });
}

function renderStats() {
  const activeProjects = state.projects.filter((project) => project.status === "andamento").length;
  const openTasks = state.tasks.filter((task) => task.status === "nao_realizada").length;
  const doneTasks = state.tasks.filter((task) => task.status === "realizada").length;

  stats.innerHTML = `
    <div class="stat"><strong>${activeProjects}</strong><span>Projetos ativos</span></div>
    <div class="stat"><strong>${openTasks}</strong><span>Tarefas abertas</span></div>
    <div class="stat"><strong>${doneTasks}</strong><span>Realizadas</span></div>
  `;
}

function projectCard(project) {
  return `
    <article class="card">
      <div class="card-header">
        <div>
          <h3>${project.name}</h3>
          <div class="meta">
            <span>${formatDate(project.start_date)} até ${formatDate(project.end_date)}</span>
            <span>${project.total_tasks || 0} tarefas</span>
          </div>
        </div>
        <span class="badge ${project.status}">${statusLabel(project.status)}</span>
      </div>
      ${project.description ? `<p class="helper">${project.description}</p>` : ""}
      <div class="progress" aria-label="Progresso do projeto">
        <span style="width: ${project.progress || 0}%"></span>
      </div>
      <div class="meta"><span>${project.progress || 0}% concluído</span></div>
    </article>
  `;
}

function taskCard(task, canToggle = true) {
  const action =
    canToggle && task.status !== "realizada"
      ? `<button class="small-button" type="button" data-complete-task="${task.id}">Marcar realizada</button>`
      : canToggle
        ? `<button class="small-button" type="button" data-reopen-task="${task.id}">Reabrir</button>`
        : "";
  const remove =
    state.user.role === "presidente"
      ? `<button class="danger-button" type="button" data-delete-task="${task.id}">Excluir</button>`
      : "";

  return `
    <article class="task-card">
      <div class="card-header">
        <div>
          <h3>${task.title}</h3>
          <div class="meta">
            <span>Prazo: ${formatDate(task.due_date)}</span>
            <span>Responsáveis: ${task.assignees.map((member) => member.name).join(", ") || "Sem responsável"}</span>
          </div>
        </div>
        <div class="meta">
          <span class="badge ${task.priority}">${statusLabel(task.priority)}</span>
          <span class="badge ${task.status}">${statusLabel(task.status)}</span>
        </div>
      </div>
      ${task.description ? `<p class="helper">${task.description}</p>` : ""}
      ${
        task.completion_description
          ? `<p class="completion-note"><strong>Descrição da entrega:</strong> ${task.completion_description}</p>`
          : ""
      }
      <div class="task-actions">${action}${remove}</div>
    </article>
  `;
}

function groupByActiveProjects(tasks) {
  return state.projects
    .filter((project) => project.status === "andamento")
    .map((project) => ({
      project,
      tasks: tasks.filter((task) => task.project_id === project.id),
    }));
}

function bindTaskActions() {
  content.querySelectorAll("[data-complete-task]").forEach((button) => {
    button.addEventListener("click", () => completeTask(button.dataset.completeTask));
  });
  content.querySelectorAll("[data-reopen-task]").forEach((button) => {
    button.addEventListener("click", () => updateTaskStatus(button.dataset.reopenTask, "nao_realizada", ""));
  });
  content.querySelectorAll("[data-delete-task]").forEach((button) => {
    button.addEventListener("click", () => deleteTask(button.dataset.deleteTask));
  });
}

function renderProjects() {
  pageTitle.textContent = "Projetos";
  content.innerHTML = `
    <div class="grid two-columns">
      <section class="panel">
        <h2>Novo projeto</h2>
        <form id="projectForm" class="form">
          <div class="field">
            <label for="projectName">Nome do projeto</label>
            <input id="projectName" name="name" required />
          </div>
          <div class="field">
            <label for="projectDescription">Descrição</label>
            <textarea id="projectDescription" name="description" placeholder="Objetivo, público ou entregas principais"></textarea>
          </div>
          <div class="form-row">
            <div class="field">
              <label for="projectStart">Início</label>
              <input id="projectStart" name="start_date" type="date" required />
            </div>
            <div class="field">
              <label for="projectEnd">Fim</label>
              <input id="projectEnd" name="end_date" type="date" required />
            </div>
          </div>
          <div class="field">
            <label for="projectStatus">Status</label>
            <select id="projectStatus" name="status">
              <option value="andamento">Em andamento</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <button class="primary-button" type="submit">Cadastrar projeto</button>
        </form>
      </section>
      <section class="list">
        ${state.projects.length ? state.projects.map(projectCard).join("") : emptyState()}
      </section>
    </div>
  `;

  document.querySelector("#projectForm").addEventListener("submit", createProject);
}

function renderTasks() {
  pageTitle.textContent = "Tarefas";
  const grouped = groupByActiveProjects(state.tasks);

  content.innerHTML = `
    <div class="grid two-columns">
      <section class="panel">
        <h2>Nova tarefa</h2>
        <form id="taskForm" class="form">
          <div class="field">
            <label for="taskProject">Projeto em andamento</label>
            <select id="taskProject" name="project_id" required>${projectOptions()}</select>
          </div>
          <div class="field">
            <label for="taskTitle">Tarefa</label>
            <input id="taskTitle" name="title" required />
          </div>
          <div class="field">
            <label for="taskDescription">Descrição</label>
            <textarea id="taskDescription" name="description" placeholder="O que precisa ser entregue"></textarea>
          </div>
          <div class="form-row">
            <div class="field">
              <label for="taskDueDate">Prazo</label>
              <input id="taskDueDate" name="due_date" type="date" required />
            </div>
            <div class="field">
              <label for="taskPriority">Prioridade</label>
              <select id="taskPriority" name="priority">
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
          </div>
          <span class="checklist-label">Responsáveis</span>
          <div class="checklist">${membersChecklist()}</div>
          <button class="primary-button" type="submit">Criar tarefa</button>
        </form>
      </section>
      <section class="list">
        ${
          grouped.length
            ? grouped
                .map(
                  ({ project, tasks }) => `
                    <article class="card project-block">
                      <div class="card-header">
                        <div>
                          <h3>${project.name}</h3>
                          <div class="meta"><span>${formatDate(project.start_date)} até ${formatDate(project.end_date)}</span></div>
                        </div>
                        <span class="badge andamento">Em andamento</span>
                      </div>
                      <div class="task-list">
                        ${tasks.length ? tasks.map((task) => taskCard(task)).join("") : emptyState()}
                      </div>
                    </article>
                  `
                )
                .join("")
            : emptyState()
        }
      </section>
    </div>
  `;

  document.querySelector("#taskForm").addEventListener("submit", createTask);
  bindTaskActions();
}

function renderMembers() {
  pageTitle.textContent = "Membros";
  content.innerHTML = `
    <div class="grid two-columns">
      <section class="panel">
        <h2>Novo membro</h2>
        <form id="memberForm" class="form">
          <div class="field">
            <label for="memberName">Nome</label>
            <input id="memberName" name="name" required />
          </div>
          <div class="field">
            <label for="memberUsername">Usuário</label>
            <input id="memberUsername" name="username" required />
          </div>
          <div class="field">
            <label for="memberPassword">Senha</label>
            <input id="memberPassword" name="password" type="password" required />
          </div>
          <button class="primary-button" type="submit">Cadastrar membro</button>
        </form>
      </section>
      <section class="list">
        ${
          state.members.length
            ? state.members
                .map(
                  (member) => `
                    <article class="card">
                      <div class="card-header">
                        <div>
                          <h3>${member.name}</h3>
                          <div class="meta"><span>@${member.username}</span></div>
                        </div>
                        <span class="badge">${member.role === "presidente" ? "Presidente" : "Membro"}</span>
                      </div>
                      ${
                        member.role === "membro"
                          ? `<div class="task-actions"><button class="danger-button" type="button" data-delete-member="${member.id}">Remover</button></div>`
                          : ""
                      }
                    </article>
                  `
                )
                .join("")
            : emptyState()
        }
      </section>
    </div>
  `;

  document.querySelector("#memberForm").addEventListener("submit", createMember);
  content.querySelectorAll("[data-delete-member]").forEach((button) => {
    button.addEventListener("click", () => deleteMember(button.dataset.deleteMember));
  });
}

function renderMyTasks() {
  pageTitle.textContent = "Minhas tarefas";
  const mine = state.tasks.filter((task) => task.assignees.some((member) => member.id === state.user.id));
  const grouped = groupByActiveProjects(mine);

  content.innerHTML = `
    <section class="list">
      ${
        grouped.length
          ? grouped
              .map(
                ({ project, tasks }) => `
                  <article class="card project-block">
                    <div class="card-header">
                      <div>
                        <h3>${project.name}</h3>
                        <div class="meta">
                          <span>Projeto: ${formatDate(project.start_date)} até ${formatDate(project.end_date)}</span>
                        </div>
                      </div>
                      <span class="badge andamento">Em andamento</span>
                    </div>
                    <div class="task-list">
                      ${tasks.length ? tasks.map((task) => taskCard(task)).join("") : emptyState()}
                    </div>
                  </article>
                `
              )
              .join("")
          : emptyState()
      }
    </section>
  `;
  bindTaskActions();
}

function renderGeneral() {
  pageTitle.textContent = "Geral";
  const grouped = state.projects.map((project) => ({
    project,
    tasks: state.tasks.filter((task) => task.project_id === project.id),
  }));

  content.innerHTML = `
    <section class="list">
      ${
        grouped.length
          ? grouped
              .map(
                ({ project, tasks }) => `
                  <article class="card project-block">
                    <div class="card-header">
                      <div>
                        <h3>${project.name}</h3>
                        <div class="meta">
                          <span>${formatDate(project.start_date)} até ${formatDate(project.end_date)}</span>
                          <span>${project.total_tasks || 0} tarefas</span>
                        </div>
                      </div>
                      <span class="badge ${project.status}">${statusLabel(project.status)}</span>
                    </div>
                    ${project.description ? `<p class="helper">${project.description}</p>` : ""}
                    <div class="progress" aria-label="Progresso do projeto">
                      <span style="width: ${project.progress || 0}%"></span>
                    </div>
                    <div class="meta"><span>${project.progress || 0}% concluído</span></div>
                    <div class="task-list">
                      ${tasks.length ? tasks.map((task) => taskCard(task, state.user.role === "presidente")).join("") : emptyState()}
                    </div>
                  </article>
                `
              )
              .join("")
          : emptyState()
      }
    </section>
  `;
  bindTaskActions();
}

async function createProject(event) {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.target).entries());
  await api("/api/projects", { method: "POST", body: JSON.stringify(payload) });
  event.target.reset();
  showNotice("Projeto cadastrado.");
  await loadData();
  render();
}

async function createTask(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = Object.fromEntries(formData.entries());
  payload.member_ids = formData.getAll("member_ids").map(Number);
  await api("/api/tasks", { method: "POST", body: JSON.stringify(payload) });
  event.target.reset();
  showNotice("Tarefa criada.");
  await loadData();
  render();
}

async function createMember(event) {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.target).entries());
  await api("/api/members", { method: "POST", body: JSON.stringify(payload) });
  event.target.reset();
  showNotice("Membro cadastrado.");
  await loadData();
  render();
}

async function completeTask(taskId) {
  const completionDescription = window.prompt("Descreva o que foi realizado nessa tarefa:");

  if (!completionDescription?.trim()) {
    showNotice("Informe uma descrição para marcar a tarefa como realizada.");
    return;
  }

  await updateTaskStatus(taskId, "realizada", completionDescription);
}

async function updateTaskStatus(taskId, status, completionDescription) {
  await api(`/api/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({ status, completion_description: completionDescription }),
  });
  showNotice(status === "realizada" ? "Tarefa marcada como realizada." : "Tarefa reaberta.");
  await loadData();
  render();
}

async function deleteTask(taskId) {
  await api(`/api/tasks/${taskId}`, { method: "DELETE" });
  showNotice("Tarefa excluída.");
  await loadData();
  render();
}

async function deleteMember(memberId) {
  await api(`/api/members/${memberId}`, { method: "DELETE" });
  showNotice("Membro removido.");
  await loadData();
  render();
}

function render() {
  renderNav();
  renderStats();

  if (state.view === "projects") renderProjects();
  if (state.view === "tasks") renderTasks();
  if (state.view === "members") renderMembers();
  if (state.view === "myTasks") renderMyTasks();
  if (state.view === "general") renderGeneral();
}

async function loadData() {
  const [membersData, projectsData, tasksData] = await Promise.all([
    api("/api/members"),
    api("/api/projects"),
    api("/api/tasks"),
  ]);

  state.members = membersData.members;
  state.projects = projectsData.projects;
  state.tasks = tasksData.tasks;
}

loadData()
  .then(render)
  .catch((error) => showNotice(error.message));
