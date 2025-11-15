# Backend Documentation

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   - Adjust `PORT` if needed (default: 5002)

3. Start the server:
   ```bash
   npm run dev    # Development mode
   npm start      # Production mode
   ```

## Directory Structure

```
/
>   /config         Connection w/ MongoDB w/ Mongoose
>   /docs           Documentation
>   /models         Mongoose Schemas
>   /routes         API Endpoint definitions
```