# msid server

## Getting Started for Developers

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your environment variables in a `.env` file (see `.env.example` for required variables)

4. Set up the database:
   ```
   npx knex migrate:latest
   ```

5. Run the development server:
   ```
   npm run dev
   ```

### Useful Knex Commands

- Create a new migration:
  ```
  npx knex migrate:make migration_name
  ```

- Run all migrations:
  ```
  npx knex migrate:latest
  ```

- Rollback the last batch of migrations:
  ```
  npx knex migrate:rollback
  ```

For more Knex CLI commands, refer to the [Knex documentation](http://knexjs.org/#Migrations-CLI).