const express = require("express");
const cors = require("cors");
const { v4: uuid, validate: isUuid } = require('uuid');

function logRequests(request, response, next) {
  const { method, url } = request;

  /**
   * O método "toUppercase" precisa ser chamado sem os parênteses para que não 
   * apresente erro no insomnia, por exemplo
   * 
   * Antes:
   * const logLabel = `[${method.toUppercase()} ${url}]`;
   * 
   * Depois:
   * const logLabel = `[${method.toUppercase} ${url}]`;
   */
  
  const logLabel = `[${method.toUppercase} ${url}]`;

  console.time(logLabel);

  next(); // Próximo middleware

  console.timeEnd(logLabel);
}

const app = express();

app.use(express.json());
app.use(cors());

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid repository ID.' });
  }

  return next();
}

app.use(logRequests);
app.use('/repositories/:id', validateRepositoryId);

const repositories = [];

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, techs, url } = request.body;

  if (title && url && techs && techs.length > 0) {
    const repository = { title, url, techs, id: uuid(), likes: 0};
    repositories.push(repository);
    return response.json(repository);
  }

  return response.status(400).json({ error: 'Campo obrigatório vazio.' });

});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repoIndex = repositories.findIndex(r => r.id == id);
  if (repoIndex == -1) {
    return response.status(404).json({error: 'Repositório não encontrado'});
  }

  const { url, techs, title } = request.body;
  repositories[repoIndex].url = url;
  repositories[repoIndex].techs = techs;
  repositories[repoIndex].title = title;

  return response.json(repositories[repoIndex]);

});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repoIndex = repositories.findIndex(r => r.id == id);
  if (repoIndex == -1) {
    return response.status(404).json({error: 'Repositório não encontrado'});
  }

  repositories.splice(repoIndex, 1);
  
  return response.status(204);

});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repoIndex = repositories.findIndex(r => r.id == id);
  if (repoIndex == -1) {
    return response.status(404).json({error: 'Repositório não encontrado'});
  }

  repositories[repoIndex].likes++;

  return response.status(200).json(repositories[repoIndex]);

});

module.exports = app;
