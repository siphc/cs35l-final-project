# Backend Documentation

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   - Do NOT change `MONGODB_TEST_URI`! The testing URI should stay on localhost!!!
   - Adjust `PORT` if needed (default: 5002)

3. Start the server:
   ```bash
   npm run dev    # Development mode
   npm start      # Production mode
   npm test       # Testing mode
   ```
   If you received a MongoDB error (this most commonly happens in `npm test`, as the database is local), follow the instructions [on the MongoDB website](https://www.mongodb.com/docs/manual/administration/install-community) to start the `mongod` process.

## Directory Structure

```
/
>  /config        Connection w/ MongoDB w/ Mongoose
>  /docs          Documentation
>  /models        Mongoose Schemas
>  /routes        API Endpoint definitions
>  /tests         Tests to be run with jest
app.js        Core server logic
server.js     Starting the server
```