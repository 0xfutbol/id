exports.up = function (knex) {
  return knex.schema.createTable('identities', function (table) {
    table.uuid('id').primary();
    table.string('username').notNullable().unique();
    table.string('password_hash').notNullable();
    table.string('address').notNullable().index();
    table.string('login_method').notNullable().defaultTo('MetaSoccer');
    table.string('wallet_id').nullable();
    table.string('wallet_address').nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('identities');
};
