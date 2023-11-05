const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Launches API', () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    mongoDisconnect();
  });

  describe('Test GET /launches', () => {
    test('It should respond with 200 success', async () => {
      const response = await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/)
        .expect(200);
      // expect(response.statusCode).toBe(200);
    });
  });

  describe('Test POST /launches', () => {
    const launchDataWithDate = {
      mission: 'Kepler Exploration X',
      rocket: 'Explorer IS1',
      launchDate: new Date('December 27, 2030'),
      target: 'Kepler-442 b',
    };

    const launchDataWithoutDate = {
      mission: 'Kepler Exploration X',
      rocket: 'Explorer IS1',
      target: 'Kepler-442 b',
    };

    const launchDataWithInvalidDate = {
      mission: 'Kepler Exploration X',
      rocket: 'Explorer IS1',
      target: 'Kepler-442 b',
      launchDate: 'Whoop!',
    };

    test('It should respond with 201 created', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithDate)
        .expect('Content-Type', /json/)
        .expect(201);

      const requestDate = new Date(launchDataWithDate.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test('It should catch missing required properties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithoutDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Missing required launch property',
      });
    });

    test('It should catch invalid dates', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Invalid launch date',
      });
    });
  });
});
