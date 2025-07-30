/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('users_emails', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('address').notNullable().index();
    table.string('email').notNullable();
    table.timestamps(true, true);
    table.unique(['address', 'email']);
  });

  const usersDetails = await knex('users_details').select('address', 'details');

  for (const ud of usersDetails) {
    let details;
    try {
      details = JSON.parse(ud.details);
    } catch (e) {
      continue;
    }
    if (!Array.isArray(details)) continue;

    const emails = details
      .filter(item => item.email && typeof item.email === 'string')
      .map(item => ({
        address: ud.address,
        email: item.email
      }));

    if (emails.length > 0) {
      await knex('users_emails').insert(emails).onConflict(['address', 'email']).ignore();
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users_emails');
};
