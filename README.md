# Setup

Create 2 .env files:
.env.development containting PGDATABASE=nc-news
.env.test containting PGDATABASE=nc-news_test

Run npm i

Run the setup and test scripts
npm run setup-dbs
npm run seed-dev
npm run test-seed
