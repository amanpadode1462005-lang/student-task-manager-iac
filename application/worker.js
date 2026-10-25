export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (path === "/api/tasks" && request.method === "GET") {
        const listResult = await env.TASKS_KV.list();
        const tasks = [];
        
        for (const key of listResult.keys) {
          const taskData = await env.TASKS_KV.get(key.name, { type: "json" });
          if (taskData) tasks.push(taskData);
        }

        return new Response(JSON.stringify(tasks), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (path === "/api/tasks" && request.method === "POST") {
        const body = await request.json();
        
        if (!body.title) {
          return new Response(JSON.stringify({ error: "Task title is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const taskId = "T" + Date.now().toString().slice(-4);
        const newTask = {
          id: taskId,
          title: body.title,
          priority: body.priority || "Medium",
          status: body.status || "Pending",
          createdDate: new Date().toISOString().split("T")[0],
        };

        await env.TASKS_KV.put(taskId, JSON.stringify(newTask));

        return new Response(JSON.stringify({ message: "Task successfully created", task: newTask }), {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const match = path.match(/^\/api\/tasks\/(T\d+|[\w-]+)$/);
      if (match) {
        const taskId = match[1];

        if (request.method === "GET") {
          const task = await env.TASKS_KV.get(taskId, { type: "json" });
          if (!task) {
            return new Response(JSON.stringify({ error: "Task not found" }), {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify(task), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (request.method === "PUT") {
          const body = await request.json();
          const existingTask = await env.TASKS_KV.get(taskId, { type: "json" });
          
          if (!existingTask) {
            return new Response(JSON.stringify({ error: "Task not found" }), {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          const updatedTask = {
            ...existingTask,
            status: body.status !== undefined ? body.status : existingTask.status,
            title: body.title !== undefined ? body.title : existingTask.title,
            priority: body.priority !== undefined ? body.priority : existingTask.priority,
          };

          await env.TASKS_KV.put(taskId, JSON.stringify(updatedTask));

          return new Response(JSON.stringify({ message: "Status changed successfully", task: updatedTask }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (request.method === "DELETE") {
          const existingTask = await env.TASKS_KV.get(taskId);
          if (!existingTask) {
            return new Response(JSON.stringify({ error: "Task not found" }), {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          await env.TASKS_KV.delete(taskId);
          return new Response(JSON.stringify({ message: "Task removed successfully" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      return new Response(JSON.stringify({ error: "Endpoint not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};