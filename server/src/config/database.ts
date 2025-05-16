import knex from 'knex';
// Using require for the knexfile since it's a JS file without type definitions
// eslint-disable-next-line @typescript-eslint/no-var-requires
const knexConfig = require('../../knexfile');

// Create database connection
const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];
const db = knex(config);

export default db; 