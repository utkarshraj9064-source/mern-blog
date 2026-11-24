const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Post = require('../src/models/Post');

// Tests need a running MongoDB. Locally: docker run -d -p 27017:27017 mongo:7
// In CI a MongoDB service container is provided (see .github/workflows/ci-backend.yml).
const TEST_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/blog_test';

beforeAll(async () => {
  await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 10000 });
});

afterEach(async () => {
  await Post.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Blog API', () => {
  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('POST /api/posts creates a post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'Hello', author: 'Utkarsh', content: 'First post' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Hello');
    expect(res.body._id).toBeDefined();
  });

  test('POST /api/posts rejects missing fields', async () => {
    const res = await request(app).post('/api/posts').send({ title: 'No author' });
    expect(res.status).toBe(400);
  });

  test('GET /api/posts lists posts', async () => {
    await Post.create({ title: 'A', author: 'X', content: 'c' });
    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('GET /api/posts/:id returns 404 for unknown id', async () => {
    const res = await request(app).get(`/api/posts/${new mongoose.Types.ObjectId()}`);
    expect(res.status).toBe(404);
  });

  test('PUT /api/posts/:id updates a post', async () => {
    const post = await Post.create({ title: 'Old', author: 'X', content: 'c' });
    const res = await request(app)
      .put(`/api/posts/${post._id}`)
      .send({ title: 'New', author: 'X', content: 'c' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New');
  });

  test('DELETE /api/posts/:id deletes a post', async () => {
    const post = await Post.create({ title: 'Del', author: 'X', content: 'c' });
    const res = await request(app).delete(`/api/posts/${post._id}`);
    expect(res.status).toBe(200);
    expect(await Post.countDocuments()).toBe(0);
  });
});
