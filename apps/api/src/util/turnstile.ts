const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const verify = async (
  token: string,
  ip: string,
  idempotencyKey?: string
) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET,
      response: token,
      remoteip: ip,
      idempotency_key: idempotencyKey
    })
  });

  const json = await res.json();

  return json.success;
};
