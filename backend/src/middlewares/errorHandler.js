function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  return res.status(500).json({ error: "Erro interno do servidor." });
}

module.exports = { errorHandler };
