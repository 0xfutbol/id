// migrations/20250610121500_add_claim_url_column.js
exports.up = function(knex) {
  return knex.schema.alterTable('airdrop_claims', function(table) {
    table.string('claim_url').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('airdrop_claims', function(table) {
    table.dropColumn('claim_url');
  });
}; 