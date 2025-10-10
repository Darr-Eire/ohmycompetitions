export async function getRandomNumber(min, max) {
  const response = await fetch('https://api.random.org/json-rpc/4/invoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "generateIntegers",
      params: {
        apiKey: process.env.RANDOM_ORG_API_KEY,
        n: 1,
        min: min,
        max: max,
        replacement: true
      },
      id: 42
    })
  });

  const data = await response.json();
  return data.result.random.data[0];
}
