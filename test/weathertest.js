import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server.js';
import mongoose from 'mongoose';

chai.use(chaiHttp);
const should = chai.should();
const expect = chai.expect;

describe('Weather API', () => {
    describe('GET /api/weather', () => {
        describe('With valid input', () => {
            let error, response;
            let checkLat = Math.round(((Math.random() * (90 - -90) + -90) + Number.EPSILON) * 100) / 100;
            let checkLon = Math.round(((Math.random() * (180 - -180) + -180) + Number.EPSILON) * 100) / 100;
            console.log(`Tested with input parameters:\nLat: ${checkLat}\nLon: ${checkLon}`);

            before((done) =>{
                chai.request(app).get(`/api/weather?lat=${checkLat}&lon=${checkLon}`).end((err, resp) => {
                error = err;
                response = resp;
                done();
                });
            });

            it('expect to return a code 200 response', () => {
                expect(response).to.have.status(200);
            });

            it('response body is expected to be an object', () => {
                expect(response.body).to.be.an('object');
            });

            it('response body is expected to have all properties', () => {
                expect(response.body).to.have.all.keys('coordinates', 'temperature', 'wind', 'clouds', 'rain', 'humidity', 'snow', 'time', 'location', '_id');
            });

            it('all base parameters should have its expected type', () => {
                    expect(response.body.coordinates).to.be.an('object');
                    expect(response.body.temperature).to.be.a('number');
                    expect(response.body.wind).to.be.an('object');
                    expect(response.body.time).to.be.a('string');
                    expect(response.body.clouds).to.be.a('number');
                    expect(response.body.rain).to.be.a('number');
                    expect(response.body.snow).to.be.a('number');
                    expect(response.body._id).to.be.a('string');
            });

            it('check coordinates object to have its expected values and types', () => {
                    expect(response.body.coordinates).to.have.be.an('object');
                    expect(response.body.coordinates).to.have.all.keys('lat', 'lon');
                    expect(response.body.coordinates.lat).to.be.a('number');
                    expect(response.body.coordinates.lon).to.be.a('number');
                    expect(response.body.coordinates.lat).to.be.within(-90, 90);
                    expect(response.body.coordinates.lon).to.be.within(-180, 180);
                    expect(response.body.coordinates.lat).to.be.equal(checkLat);
                    expect(response.body.coordinates.lon).to.be.equal(checkLon);
            });

            it('check temperature to have its expected type', () => {
                    expect(response.body.temperature).to.be.a('number');

            });

            it('check wind object to have its expected values and types', () => {
                    expect(response.body.wind).to.be.an('object');
                    expect(response.body.wind).to.have.all.keys('speed', 'degree', 'direction');
                    expect(response.body.wind.speed).to.be.a('number');
                    expect(response.body.wind.degree).to.be.a('number');
                    expect(response.body.wind.direction).to.be.a('string');
            });

            it('check if clouds have its expected type', () => {
                    expect(response.body.clouds).to.be.a('number');
            });

            it('check if rain have its expected type', () => {
                    expect(response.body.rain).to.be.a('number');
            });

            it('check if humidity have its expected type', () => {
                    expect(response.body.humidity).to.be.a('number');
            });

            it('check if snow have its expected type', () => {
                    expect(response.body.snow).to.be.a('number');
            });

            it('check if location have its expected type', () => {
                    expect(response.body.location).to.be.an('object');
                    expect(response.body.location).to.have.all.keys('city', 'country');
                    expect(response.body.location.city).to.be.a('string');
                    expect(response.body.location.country).to.be.a('string');
            });

            it('check time to have its expected type', () => {
                    expect(response.body.time).to.be.a('string');
            });

            it('check _id to have its expected type', () => {
                    expect(response.body._id).to.be.a('string');
            });

            it('check if data were saved correctly to database', () => {
                const db = mongoose.connection;
                if(db.readyState === 1) {
                        db.collection('WeatherData').findOne({'_id': mongoose.Types.ObjectId(response.body._id)}, (err, result) => {
                            if(err) {
                                console.log(err);
                            }
                            expect(result).to.be.an('object');
                            expect(result).to.have.all.keys('coordinates', 'temperature', 'wind', 'clouds', 'rain', 'humidity','snow', 'time', 'location', '_id');
                            expect(result.coordinates).to.be.deep.equal(response.body.coordinates);
                            expect(result.temperature).to.be.equal(response.body.temperature);
                            expect(result.wind).to.be.deep.equal(response.body.wind);
                            expect(result.time).to.be.equal(response.body.time);
                            expect(result.clouds).to.be.equal(response.body.clouds);
                            expect(result.rain).to.be.equal(response.body.rain);
                            expect(result.humidity).to.be.equal(response.body.humidity);
                            expect(result.snow).to.be.equal(response.body.snow);
                            expect(result.location).to.be.deep.equal(response.body.location);
                            expect(result._id.toString()).to.be.equal(response.body._id);
                    });
                }
            });
    });

    describe('With invalid input', () => {
        it('expect to return a 400 response with error message about missing lat and lon parameters', (done) => {
            chai.request(app)
                .get('/api/weather/')
                .end((error, response) => {
                    expect(response).to.have.status(400);
                    expect(response.body).to.be.an('object');
                    expect(response.body).to.have.all.keys('error');
                    expect(response.body.error).to.be.a('string');
                    expect(response.body.error).to.be.equal('Missing lat and lon parameters in url');
                    done();
                });
            });
        
        it('expect to return a 400 response with error message about missing lat parameter', (done) => {
            chai.request(app)
                .get('/api/weather/?lon=100.5')
                .end((error, response) => {
                    expect(response).to.have.status(400);
                    expect(response.body).to.be.an('object');
                    expect(response.body).to.have.all.keys('error');
                    expect(response.body.error).to.be.a('string');
                    expect(response.body.error).to.be.equal('Missing lat parameter in url');
                    done();
                });
            });
        
        it('expect to return a 400 response with error message about missing lon parameter', (done) =>{
            chai.request(app)
                .get('/api/weather/?lat=45.45')
                .end((error, response) => {
                    expect(response).to.have.status(400);
                    expect(response.body).to.be.an('object');
                    expect(response.body).to.have.all.keys('error');
                    expect(response.body.error).to.be.a('string');
                    expect(response.body.error).to.be.equal('Missing lon parameter in url');
                    done();
                });
            });
        
        it('expect to return a 400 response with error message about invalid lat data type (given data type of not Number)', (done) => {
            chai.request(app)
                .get('/api/weather/?lat=abc&lon=100.5')
                .end((error, response) => {
                    expect(response).to.have.status(400);
                    expect(response.body).to.be.an('object');
                    expect(response.body).to.have.all.keys('error');
                    expect(response.body.error).to.be.a('string');
                    expect(response.body.error).to.be.equal('Lat must be a number');
                    done();
                });
            });
        
        it('expect to return a 400 response with error message about invalid lon data type (given data type of not Number)', (done) => {
            chai.request(app)
                .get('/api/weather/?lat=45.45&lon=abc')
                .end((error, response) => {
                    expect(response).to.have.status(400);
                    expect(response.body).to.be.an('object');
                    expect(response.body).to.have.all.keys('error');
                    expect(response.body.error).to.be.a('string');
                    expect(response.body.error).to.be.equal('Lon must be a number');
                    done();
                });
            });
        
        it('expect to return a 400 response with error message about invalid lat and lon data type (given data type of not Number)', (done) => {
            chai.request(app)
                .get('/api/weather/?lat=abc&lon=efgh')
                .end((error, response) => {
                    expect(response).to.have.status(400);
                    expect(response.body).to.be.an('object');
                    expect(response.body).to.have.all.keys('error');
                    expect(response.body.error).to.be.a('string');
                    expect(response.body.error).to.be.equal('Lat and lon must be numbers');
                    done();
                });
            });
        
        it('expect to return 400 response with error message about invalid range of lat parameter', (done) => {
            chai.request(app)
                .get('/api/weather/?lat=100&lon=100')
                .end((error, response) => {
                    expect(response).to.have.status(400);
                    expect(response.body).to.be.an('object');
                    expect(response.body).to.have.all.keys('error');
                    expect(response.body.error).to.be.a('string');
                    expect(response.body.error).to.be.equal('Lat must be a number between -90 and 90');
                    done();
                });
            });
        
        it('expect to return 400 response with error message about invalid range of lon parameter', (done) => {
            chai.request(app)
                .get('/api/weather/?lat=45&lon=200')
                .end((error, response) => {
                    expect(response).to.have.status(400);
                    expect(response.body).to.be.an('object');
                    expect(response.body).to.have.all.keys('error');
                    expect(response.body.error).to.be.a('string');
                    expect(response.body.error).to.be.equal('Lon must be a number between -180 and 180');
                    done();
                });
            });

        it('expect to return 400 response with error message about invalid range of lat and lon parameter', (done) => {
            chai.request(app)
                .get('/api/weather/?lat=100&lon=200')
                .end((error, response) => {
                    expect(response).to.have.status(400);
                    expect(response.body).to.be.an('object');
                    expect(response.body).to.have.all.keys('error');
                    expect(response.body.error).to.be.a('string');
                    expect(response.body.error).to.be.equal('Lat must be a number between -90 and 90 and Lon must be a number between -180 and 180');
                    done();
                });
            });
        });
    });
});