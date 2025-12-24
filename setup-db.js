const mongoose = require("mongoose");
require("dotenv").config();

async function setup() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("Conectado a Atlas");

  // Hacer admin
  await mongoose.connection.db
    .collection("users")
    .updateOne({ email: "admin@coderhouse.com" }, { $set: { role: "admin" } });
  console.log("Usuario admin@coderhouse.com actualizado a rol admin");

  // Mostrar usuarios
  const users = await mongoose.connection.db
    .collection("users")
    .find({})
    .toArray();
  console.log("\nUsuarios en Atlas:", users.length);
  users.forEach((u) => console.log(" -", u.email, "| rol:", u.role));

  // Mostrar colecciones
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("\nColecciones en Atlas:");
  collections.forEach((c) => console.log(" -", c.name));

  await mongoose.disconnect();
}

setup();
