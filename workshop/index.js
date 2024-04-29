const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_icecream_shop"
);
const express = require("express");
const app = express();

app.use(express.json());
app.use(require("morgan")("dev"));

//READ
app.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `SELECT * from flavors`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

//CREATE
app.post("/api/flavors", async (req, res, next) => {
  try {
    const SQL = /* sql */ `
    INSERT INTO flavors(name, is_favorite)
    VALUES($1, $2)
    RETURNING *
    `;
    const response = client.query(SQL, [req.body.name, req.body.is_favorite]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

//UPDATE
app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = /* sql */ `
       UPDATE flavors
       SET name=$1, is_favorite=$2, updated_at=now()
       WHERE id=$3
       RETURNING *
       `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.is_favorite,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

//DELETE
app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = /* sql */ `
          DELETE from flavors
          WHERE id=$1
          `;
    await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  await client.connect();
  console.log("connected to database");
  let SQL = /* sql */ `
DROP TABLE IF EXISTS flavors;
CREATE TABLE flavors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    is_favorite BOOLEAN DEFAULT FALSE
)
`;
  await client.query(SQL);
  console.log("tables created");

  SQL = /* sql */ `
  INSERT INTO flavors(name, is_favorite) VALUES('Rocky Road', true);
  INSERT INTO flavors(name, is_favorite) VALUES('Mint Chocolate Chip', false);
  INSERT INTO flavors(name, is_favorite) VALUES('Chocolate', false);
  INSERT INTO flavors(name, is_favorite) VALUES('Cherry Garcia', false);
  `;
  await client.query(SQL);
  console.log("data seeded");

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};
init();
