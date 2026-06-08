# Relatorio do Projeto: Rotaract Manager

## 1. Apresentacao do Projeto

O projeto desenvolvido se chama **Rotaract Manager**. Ele e um sistema web feito para ajudar na organizacao dos projetos de um Rotaract Club.

A ideia principal foi criar uma plataforma simples, onde o presidente consiga cadastrar projetos, tarefas e membros, e onde cada membro consiga ver quais atividades precisa realizar.

O sistema foi pensado para facilitar a gestao dos projetos do club, principalmente quando existem varias atividades acontecendo ao mesmo tempo.

## 2. Objetivo do Sistema

O objetivo do Rotaract Manager e organizar melhor as tarefas e os projetos do Rotaract.

Com ele, o presidente consegue registrar os projetos do club, definir datas, cadastrar os membros e distribuir tarefas. Ja os membros conseguem entrar no sistema e visualizar apenas as tarefas que foram atribuidas a eles.

Dessa forma, fica mais facil acompanhar o que precisa ser feito, quem ficou responsavel por cada atividade e quais prazos precisam ser cumpridos.

## 3. Problema Identificado

Em projetos feitos em grupo, muitas vezes as informacoes acabam ficando espalhadas em mensagens, conversas ou planilhas. Isso pode causar esquecimento de tarefas, falta de organizacao e dificuldade para acompanhar o andamento geral.

Pensando nisso, o sistema foi criado para centralizar as principais informacoes dos projetos em um unico lugar.

## 4. Usuarios do Sistema

O sistema possui dois tipos de usuarios: presidente e membro.

### Presidente

O presidente tem acesso as funcoes principais do sistema. Ele pode:

- cadastrar projetos;
- informar o nome e as datas dos projetos;
- definir o status do projeto;
- cadastrar tarefas;
- escolher um ou mais membros responsaveis por cada tarefa;
- colocar prazo e prioridade nas tarefas;
- cadastrar os membros do club com usuario e senha;
- visualizar todos os projetos e tarefas.

### Membro

O membro acessa o sistema com o usuario e senha cadastrados pelo presidente.

Ao entrar, ele consegue:

- ver suas proprias tarefas;
- acompanhar os projetos em andamento;
- consultar os prazos das tarefas;
- marcar uma tarefa como realizada;
- visualizar uma area geral com os projetos e tarefas do club.

## 5. Principais Funcionalidades

### Tela de Login

O sistema possui uma tela de login para separar o acesso do presidente e dos membros.

Existe um usuario inicial para o presidente:

```text
Usuario: presidente
Senha: admin123
```

Depois disso, o proprio presidente pode cadastrar os membros do club.

### Pagina de Projetos

Na pagina de projetos, o presidente pode cadastrar:

- nome do projeto;
- descricao;
- data de inicio;
- data de termino;
- status.

Os status disponiveis sao:

- em andamento;
- concluido;
- cancelado.

Tambem foi colocado um progresso do projeto, calculado com base nas tarefas concluidas.

### Pagina de Tarefas

Na pagina de tarefas, as atividades ficam separadas por projeto. Isso ajuda a visualizar melhor o que pertence a cada projeto.

Ao cadastrar uma tarefa, o presidente informa:

- o projeto relacionado;
- o titulo da tarefa;
- uma descricao;
- o prazo;
- a prioridade;
- os membros responsaveis.

Cada tarefa tambem possui um status, podendo estar realizada ou nao realizada.

### Pagina de Membros

Na pagina de membros, o presidente pode cadastrar as pessoas do club que vao utilizar o sistema.

Para cada membro sao cadastrados:

- nome;
- usuario;
- senha.

Essas informacoes sao usadas para o membro conseguir acessar sua area no sistema.

### Area do Membro

Na area do membro, aparecem as tarefas que foram atribuidas a ele.

Essas tarefas ficam organizadas por projetos em andamento, mostrando tambem a data do projeto e o prazo de cada tarefa.

### Area Geral

A area geral mostra uma visao completa dos projetos e das tarefas cadastradas. Ela pode ser acessada tanto pelo presidente quanto pelos membros.

Essa parte serve para todos terem uma nocao do andamento das atividades do club.

## 6. Tecnologias Utilizadas

O sistema foi desenvolvido usando tecnologias web:

- HTML para a estrutura das paginas;
- CSS para o visual;
- JavaScript para a interatividade;
- Node.js com Express para o servidor;
- SQLite para o banco de dados;
- bcryptjs para proteger as senhas;
- JSON Web Token para o controle de login.

Tambem foi criado um modo local usando `localStorage`, para conseguir testar o sistema mesmo sem rodar o servidor.

## 7. Estrutura dos Arquivos

A organizacao principal do projeto ficou assim:

```text
rotaract-manager/
├── backend/
│   ├── server.js
│   ├── database.db
│   └── src/
│       ├── app.js
│       ├── config.js
│       ├── database.js
│       ├── controllers/
│       ├── middlewares/
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       └── utils/
├── frontend/
│   ├── login.html
│   ├── app.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js
│       ├── login.js
│       └── local-store.js
├── package.json
└── RELATORIO_PROJETO.md
```

## 8. Como Executar

Para executar com servidor, e necessario abrir o terminal na pasta do projeto e rodar:

```bash
npm install
npm start
```

Depois, basta acessar:

```text
http://localhost:3000
```

Tambem e possivel testar abrindo diretamente o arquivo:

```text
frontend/login.html
```

Nesse caso, os dados ficam salvos no proprio navegador.

## 9. Pontos Extras Adicionados

Alem dos requisitos principais, foram adicionados alguns recursos para melhorar a gestao:

- descricao em projetos e tarefas;
- prioridade das tarefas;
- barra de progresso dos projetos;
- visualizacao separada por projetos;
- area geral para todos os usuarios;
- opcao de marcar tarefa como realizada;
- funcionamento local pelo navegador.

## 10. Beneficios do Projeto

O sistema ajuda o club a ter mais organizacao e clareza sobre os projetos.

Com ele, fica mais facil saber:

- quais projetos estao ativos;
- quais tarefas ainda precisam ser feitas;
- quem esta responsavel por cada tarefa;
- quais prazos estao chegando;
- o que ja foi concluido.

Isso pode ajudar o presidente na gestao e tambem deixar os membros mais informados sobre suas responsabilidades.

## 11. Melhorias Futuras

Algumas melhorias que poderiam ser feitas em uma proxima versao seriam:

- permitir editar projetos e tarefas pela interface;
- criar filtros por status ou prioridade;
- adicionar notificacoes de prazo;
- criar um painel com graficos;
- permitir recuperacao de senha;
- colocar o sistema online para acesso por celular e computador.

## 12. Conclusao

O Rotaract Manager atende ao objetivo de ajudar na gestao de projetos de um Rotaract Club.

O sistema permite que o presidente organize projetos, membros e tarefas, enquanto os membros conseguem acompanhar suas atividades de forma mais simples.

Com isso, o projeto contribui para melhorar a organizacao interna, a divisao de responsabilidades e o acompanhamento dos prazos.
