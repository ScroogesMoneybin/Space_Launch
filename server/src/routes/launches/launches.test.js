const request = require('supertest');
const app = require('../../app');

const {mongoConnect, disconnectMongo} = require('../../services/mongo');
const {loadPlanetsData} = require('../../models/planets.model')

describe('Launches API', () => {
    beforeAll(async () => {
        await mongoConnect()
        await loadPlanetsData();
    });

    afterAll(async () => await disconnectMongo());
        
    describe('Test GET /launches', () => {
        test('It should respond with 200 success', async () => {
            const response = await request(app).get('/v1/launches').expect('Content-Type',/json/).expect(200);  /*Supertest here calls the listen function on server and runs the GET request and checks the result*/
            // expect(response.statusCode).toBe(200);
        })
    })


    describe('Test POST /launch',() => {
        const completeLaunchData = {
            mission: 'mission',
            rocket: 'rocket',
            target: 'Kepler-452 b',
            launchDate: 'January 1, 2040'
        };

        const launchDataWithoutDate = {
            mission: 'mission',
            rocket: 'rocket',
            target: 'Kepler-452 b',
        
        }

        const launchDataWithoutInvalidDate = {
            mission: 'mission',
            rocket: 'rocket',
            target: 'Kepler-452 b',
            launchDate: 'xyz'
        };

        test('It should respond with 201 success', async () => {
            const response =  await request(app).post('/v1/launches').send(completeLaunchData)
            .expect('Content-Type',/json/).expect(201);
            // expect(response).toBe(200);

            const requestDate = new Date (completeLaunchData.launchDate).valueOf();
            const responseDate = new Date (response.body.launchDate).valueOf();

            expect(requestDate).toBe(responseDate);

            expect(response.body).toMatchObject(launchDataWithoutDate)
        })

        test('It should catch missing required properties', async () => {
            const response =  await request(app).post('/v1/launches').send(launchDataWithoutDate)
            .expect('Content-Type',/json/).expect(400);

            expect(response.body).toStrictEqual({
                error: "Error in one of the entries"
            })
        });

        test('It should catch invalid dates', async () => {
            const response =  await request(app).post('/v1/launches').send(launchDataWithoutInvalidDate)
            .expect('Content-Type',/json/).expect(400);

            expect(response.body).toStrictEqual({
                error: "Invalid entry for launch date"
            })
        });
    })
});
