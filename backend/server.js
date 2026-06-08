const { app } = require("./src/app");
const { initDatabase } = require("./src/database");

const PORT = process.env.PORT || 3000;

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Rotaract Manager rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  });
