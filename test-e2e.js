const test = async () => {
  console.log('Testing Registration...');
  const regRes = await fetch('http://localhost:4000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'password123', name: 'Tester' })
  });
  console.log('Registration Status:', regRes.status);
  const regData = await regRes.json();
  console.log('Registration Data:', regData);

  console.log('\nTesting Login...');
  const loginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
  });
  console.log('Login Status:', loginRes.status);
  const loginData = await loginRes.json();
  console.log('Login Data:', loginData);
  const userId = loginData.user?.id;

  console.log('\nTesting Create Post...');
  const postRes = await fetch('http://localhost:4000/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'Hello World', userId })
  });
  console.log('Post Status:', postRes.status);
  console.log('Post Data:', await postRes.json());

  console.log('\nTesting Get Posts...');
  const getPostsRes = await fetch('http://localhost:4000/api/posts');
  console.log('Get Posts Status:', getPostsRes.status);
  console.log('Get Posts Data:', await getPostsRes.json());
};

test().catch(console.error);
