const OPENROUTER_API_KEY = process.env.newKey;

const fetch1 = () =>
  fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': '<YOUR_SITE_URL>',   // Optional
      'X-Title': '<YOUR_SITE_NAME>',        // Optional
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',          // Use a valid model ID
      max_tokens: 16,
      messages: [
        {
          role: 'user',
          content: 'What is the meaning of life?',
        },
      ],
    }),
  });

async function main() {
  const response = await fetch1();
  const completion = await response.json(); // Parse the response body
  console.log(completion);
  console.log(completion.choices[0].message.content);
}

main();
