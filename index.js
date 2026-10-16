
const express = require("express");
const app = express();
app.use(express.json());

let courses = [];
let id = 1;
const categories = ["Programming", "Design", "Data", "Business", "Marketing"];

function valid(c) {
  return c && typeof c.title === "string" && c.title.trim().length >= 3 &&
    typeof c.instructor === "string" && c.instructor.trim().length >= 2 &&
    categories.includes(c.category) && typeof c.fee === "number" &&
    c.fee > 0 && c.fee <= 200000 &&
    Number.isInteger(c.durationHours) && c.durationHours >= 1 &&
    c.durationHours <= 1000 && typeof c.published === "boolean";
}

app.post("/api/courses", (req, res) => {
  if (!valid(req.body)) return res.status(400).json({ error: "Invalid data" });
  const c = { id: id++, ...req.body };
  courses.push(c);
  res.status(201).json(c);
});

app.get("/api/courses", (req, res) => {
  let data = [...courses];
  if (req.query.category) data = data.filter(c => c.category === req.query.category);
  if (req.query.search) data = data.filter(c =>
    c.title.toLowerCase().includes(req.query.search.toLowerCase()) ||
    c.instructor.toLowerCase().includes(req.query.search.toLowerCase()));
  const total = data.length, page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  res.json({ data: data.slice((page - 1) * limit, page * limit),
    page, limit, total, totalPages: Math.ceil(total / limit) });
});

app.get("/api/courses/:id", (req, res) => {
  const c = courses.find(c => c.id === Number(req.params.id));
  if (!c) return res.status(404).json({ error: "Not found" });
  res.json(c);
});

app.put("/api/courses/:id", (req, res) => {
  const i = courses.findIndex(c => c.id === Number(req.params.id));
  if (i < 0) return res.status(404).json({ error: "Not found" });
  if (!valid(req.body)) return res.status(400).json({ error: "Invalid data" });
  courses[i] = { id: courses[i].id, ...req.body };
  res.json(courses[i]);
});

app.patch("/api/courses/:id", (req, res) => {
  const i = courses.findIndex(c => c.id === Number(req.params.id));
  if (i < 0) return res.status(404).json({ error: "Not found" });
  const updated = { ...courses[i], ...req.body, id: courses[i].id };
  if (!Object.keys(req.body).length || !valid(updated))
    return res.status(400).json({ error: "Invalid data" });
  courses[i] = updated;
  res.json(updated);
});

app.delete("/api/courses/:id", (req, res) => {
  const i = courses.findIndex(c => c.id === Number(req.params.id));
  if (i < 0) return res.status(404).json({ error: "Not found" });
  courses.splice(i, 1);
  res.status(204).end();
});

app.listen(process.env.PORT || 8080, () => console.log("Server running on port 8080"));
