const db = require("./db/connection");

const allUsers = db
  .query(
    `
      SELECT *
      FROM users;
`
  )
  .then(({ rows }) => rows);

allUsers.then((data) => {
  console.log(data);
});

const allCodingArticles = db
  .query(
    `
      SELECT *
      FROM articles
      WHERE topic = 'coding';
`
  )
  .then(({ rows }) => rows);

allCodingArticles.then((data) => {
  console.log(data);
});

const allNegativeVotedComments = db
  .query(
    `
        SELECT *
        FROM comments
        WHERE votes < 0;
  `
  )
  .then(({ rows }) => rows);
allNegativeVotedComments.then((data) => {
  console.log(data);
});

const allTopics = db
  .query(
    `
        SELECT *
        FROM topics;
  `
  )
  .then(({ rows }) => rows);
allTopics.then((data) => {
  console.log(data);
});

const allGrumpy19Articles = db
  .query(
    `
        SELECT *
        FROM articles
        WHERE author = 'grumpy19';
  `
  )
  .then(({ rows }) => rows);
allGrumpy19Articles.then((data) => {
  console.log(data);
});

const allCommentsWithUnder10Votes = db
  .query(
    `
        SELECT *
        FROM comments
        WHERE votes < 10;
  `
  )
  .then(({ rows }) => rows);
allCommentsWithUnder10Votes.then((data) => {
  console.log(data);
});
