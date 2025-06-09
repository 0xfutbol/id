// migrations/20250610120500_add_destination_address_to_airdrop_claims.js
exports.up = function(knex) {
  return knex.schema.alterTable('airdrop_claims', function(table) {
    table.string('destination_address').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('airdrop_claims', function(table) {
    table.dropColumn('destination_address');
  });
}; 