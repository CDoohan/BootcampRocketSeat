const express = require("express");
const server = express();

let logRequest = 0;
const projects = new Array();

server.use(express.json());

function checkProjectExists(req, res, next) {
  const { id } = req.params;
  const project = projects.find(item => item.id == id);

  if (!project) {
    return res
      .status(400)
      .json({ error: `Project ${id} not found or doesnt exists` });
  }

  return next();
}

server.use((req, res, next) => {
  logRequest++;

  console.log("Number of requests:", logRequest);

  return next();
});

server.get("/projects", (req, res) => {
  return res.json(projects);
});

server.get("/projects/:id", checkProjectExists, (req, res) => {
  const { id } = req.params;

  const project = projects.find(item => item.id == id);

  return res.json(project);
});

server.get("/projects/:id/task", checkProjectExists, (req, res) => {
  const { id } = req.params;

  const project = projects.find(item => item.id == id);
  const task = project.tasks;

  return res.json(task);
});

server.post("/projects", (req, res) => {
  const { id, title } = req.body;

  const project = {
    id,
    title,
    tasks: []
  };

  projects.push(project);

  return res.json(projects);
});

server.post("/projects/:id/task", checkProjectExists, (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  const project = projects.find(item => item.id == id);

  project.tasks.push(title);

  return res.json(projects);
});

server.put("/projects/:id", checkProjectExists, (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  const project = projects.find(item => item.id == id);

  project.title = title;

  return res.json(projects);
});

server.delete("/projects/:id", checkProjectExists, (req, res) => {
  const { id } = req.params;

  const projectIndex = projects.findIndex(item => item.id == id);

  projects.splice(projectIndex, 1);

  return res.json(projects);
});

server.delete("/projects/:id/task", checkProjectExists, (req, res) => {
  const { id } = req.params;

  const projectIndex = projects.findIndex(item => item.id == id);

  projects[projectIndex].tasks = new Array();

  return res.json(projects);
});

server.listen(3000);
