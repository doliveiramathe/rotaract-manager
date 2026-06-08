(function setupLocalStore() {
  const STORE_KEY = "rotaractLocalData";

  function read() {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) return JSON.parse(saved);

    const initial = {
      nextIds: { member: 2, project: 1, task: 1 },
      members: [
        {
          id: 1,
          name: "Presidente Rotaract",
          username: "presidente",
          password: "admin123",
          role: "presidente",
          created_at: new Date().toISOString(),
        },
      ],
      projects: [],
      tasks: [],
    };
    write(initial);
    return initial;
  }

  function write(data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  }

  function publicMember(member) {
    const { password, ...safeMember } = member;
    return safeMember;
  }

  function withProjectStats(data) {
    return data.projects
      .map((project) => {
        const tasks = data.tasks.filter((task) => task.project_id === project.id);
        const doneTasks = tasks.filter((task) => task.status === "realizada").length;
        return {
          ...project,
          total_tasks: tasks.length,
          done_tasks: doneTasks,
          progress: tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0,
        };
      })
      .sort((a, b) => {
        const order = { andamento: 0, concluido: 1, cancelado: 2 };
        return order[a.status] - order[b.status] || a.start_date.localeCompare(b.start_date);
      });
  }

  function tasksWithAssignees(data) {
    return data.tasks
      .map((task) => {
        const project = data.projects.find((item) => item.id === task.project_id) || {};
        return {
          ...task,
          project_name: project.name,
          project_start_date: project.start_date,
          project_end_date: project.end_date,
          project_status: project.status,
          assignees: task.member_ids
            .map((memberId) => data.members.find((member) => member.id === memberId))
            .filter(Boolean)
            .map(publicMember),
        };
      })
      .sort((a, b) => `${a.project_start_date}${a.due_date}`.localeCompare(`${b.project_start_date}${b.due_date}`));
  }

  function requirePresident(user) {
    if (user.role !== "presidente") {
      throw new Error("Acesso restrito ao presidente.");
    }
  }

  window.RotaractLocal = {
    login(username, password) {
      const data = read();
      const member = data.members.find((item) => item.username === username && item.password === password);
      if (!member) throw new Error("Usuário ou senha inválidos.");
      const user = publicMember(member);
      return { token: `local-${user.id}-${Date.now()}`, user };
    },

    request(path, options = {}, currentUser) {
      const data = read();
      const method = options.method || "GET";
      const body = options.body ? JSON.parse(options.body) : {};

      if (path === "/api/members" && method === "GET") {
        return { members: data.members.map(publicMember).sort((a, b) => a.name.localeCompare(b.name)) };
      }

      if (path === "/api/members" && method === "POST") {
        requirePresident(currentUser);
        if (data.members.some((member) => member.username === body.username)) {
          throw new Error("Esse usuário já existe.");
        }
        const member = {
          id: data.nextIds.member++,
          name: body.name,
          username: body.username,
          password: body.password,
          role: "membro",
          created_at: new Date().toISOString(),
        };
        data.members.push(member);
        write(data);
        return { member: publicMember(member) };
      }

      if (path.startsWith("/api/members/") && method === "DELETE") {
        requirePresident(currentUser);
        const memberId = Number(path.split("/").pop());
        data.members = data.members.filter((member) => member.id !== memberId || member.role === "presidente");
        data.tasks = data.tasks.map((task) => ({
          ...task,
          member_ids: task.member_ids.filter((id) => id !== memberId),
        }));
        write(data);
        return null;
      }

      if (path === "/api/projects" && method === "GET") {
        return { projects: withProjectStats(data) };
      }

      if (path === "/api/projects" && method === "POST") {
        requirePresident(currentUser);
        const project = {
          id: data.nextIds.project++,
          name: body.name,
          description: body.description || "",
          start_date: body.start_date,
          end_date: body.end_date,
          status: body.status || "andamento",
          created_at: new Date().toISOString(),
        };
        data.projects.push(project);
        write(data);
        return { project };
      }

      if (path === "/api/tasks" && method === "GET") {
        return { tasks: tasksWithAssignees(data) };
      }

      if (path === "/api/tasks" && method === "POST") {
        requirePresident(currentUser);
        const task = {
          id: data.nextIds.task++,
          project_id: Number(body.project_id),
          title: body.title,
          description: body.description || "",
          due_date: body.due_date,
          priority: body.priority || "media",
          status: body.status || "nao_realizada",
          member_ids: body.member_ids || [],
          created_at: new Date().toISOString(),
        };
        data.tasks.push(task);
        write(data);
        return { task: tasksWithAssignees(data).find((item) => item.id === task.id) };
      }

      if (path.startsWith("/api/tasks/") && method === "PATCH") {
        const taskId = Number(path.split("/").pop());
        const task = data.tasks.find((item) => item.id === taskId);
        if (!task) throw new Error("Tarefa não encontrada.");
        if (currentUser.role !== "presidente" && !task.member_ids.includes(currentUser.id)) {
          throw new Error("Você pode alterar apenas o status das suas tarefas.");
        }
        Object.assign(task, {
          title: body.title ?? task.title,
          description: body.description ?? task.description,
          due_date: body.due_date ?? task.due_date,
          priority: body.priority ?? task.priority,
          status: body.status ?? task.status,
          member_ids: body.member_ids ?? task.member_ids,
        });
        write(data);
        return { task: tasksWithAssignees(data).find((item) => item.id === taskId) };
      }

      if (path.startsWith("/api/tasks/") && method === "DELETE") {
        requirePresident(currentUser);
        const taskId = Number(path.split("/").pop());
        data.tasks = data.tasks.filter((task) => task.id !== taskId);
        write(data);
        return null;
      }

      throw new Error("Recurso não encontrado.");
    },
  };
})();
