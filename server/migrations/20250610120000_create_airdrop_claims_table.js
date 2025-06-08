// migrations/20250610120000_create_airdrop_claims_table.js
exports.up = function(knex) {
  return knex.schema.createTable('airdrop_claims', function(table) {
    table.uuid('id').primary();
    table.string('address').notNullable().index();
    table.string('telegram_id').nullable();
    table.decimal('allocation', 38, 0).notNullable();
    table.string('strategy').notNullable();
    table.text('message').notNullable();
    table.text('signature').notNullable();
    table.timestamp('claimed_at').defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('airdrop_claims');
}; 