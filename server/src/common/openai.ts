import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function validateUsernameWithAI(username: string): Promise<boolean> {
  console.log(`Validating username: ${username}`);

  const prompt = `You are a username validator for a sports-related platform. Your task is to evaluate the given username and determine if it's appropriate and compliant with our guidelines. Please follow these rules:

1. The username must not contain any offensive language, profanity, or inappropriate content.
2. It should not include direct references to specific soccer clubs or teams.
3. The username should not contain contact information (e.g., email addresses, phone numbers).
4. It should be appropriate for all ages and not allude to violence, drugs, or other sensitive topics.
5. The username should not impersonate well-known athletes, teams, or brands.

Evaluate the following username: "${username}"

Respond with VALID if the username meets all criteria, or INVALID if it violates any of the rules.`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  console.log('Received response from OpenAI:', response.choices[0].message.content);

  const result = response.choices[0].message.content?.trim().toUpperCase() === 'VALID';

  console.log(`Username validation result: ${result ? 'VALID' : 'INVALID'}`);

  return result;
}