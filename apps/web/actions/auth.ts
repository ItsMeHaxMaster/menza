'use server';

export async function login(initialState: any, formData: FormData) {
  const userData = {
    email: formData.get('email'),
    password: formData.get('password'),
    turnstile: formData.get('cf-turnstile-response'),
  }

  console.log(userData, formData);

  const req = await fetch('http://localhost:3001/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  const data = await req.json();

  if (data.error)
    return { message: data.message }
}
