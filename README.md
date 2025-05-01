# NC News

NC News is a REST API made as part of my Northcoders course in the Backend phase.
It is a REST API simulating the backend of a news site

## To Run/Use Locally

### Requirements

- Node.js >= 23.0.0
- Postgres >= 16.0

### Setup Steps

1. Clone the repo
2. Create 2 `.env` files:
   - **`.env.development`** - Containting `PGDATABASE=nc-news`
   - **`.env.test`** - Containting `PGDATABASE=nc-news_test`
3. Run `npm i`
4. Run the setup and test scripts:
   1. `npm run setup-dbs`
   2. `npm run seed-dev`
   3. `npm run test-seed`
5. Tests can be run with `npm t server`

## My Hosted Verson

You can access and use the api here - https://nc-news-29kn.onrender.com/api  

Please not that this is running on a free tier of Render so after a short period of inactivity the service gets slept.  
Expect to wait up to a minute on first access for it to be spun back up
