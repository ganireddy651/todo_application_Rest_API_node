const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
// const { open } = sqlite;

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running in http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//GET todo

app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  const getTodo = `SELECT * FROM todo WHERE status LIKE "%${status}%" And priority LIKE "%${priority}%" AND todo LIKE "%${search_q}%";`;
  const dbResponse = await db.all(getTodo);
  response.send(dbResponse);
});

//get particular todo

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodo = `SELECT * FROM todo WHERE id=${todoId};`;
  const dbResponse = await db.get(getTodo);
  response.send(dbResponse);
});

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;

  const postTodo = `INSERT INTO TODO(id,todo,priority,status) values(${id},'${todo}','${priority}','${status}');`;
  await db.run(postTodo);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  const { status, priority, todo } = todoDetails;
  if (status !== undefined) {
    const updateTodo = `update todo set status='${status}' where id=${todoId};`;
    const dbResponse = await db.run(updateTodo);
    response.send("Status Updated");
  }
  if (priority !== undefined) {
    const updateTodo = `update todo set priority='${priority}' where id=${todoId};`;
    const dbResponse = await db.run(updateTodo);
    response.send("Priority Updated");
  }
  if (todo !== undefined) {
    const updateTodo = `update todo set todo='${todo}' where id=${todoId};`;
    const dbResponse = await db.run(updateTodo);
    response.send("Todo Updated");
  }
});

//delete todo

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const deleteTodo = `delete from todo where id=${todoId};`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
