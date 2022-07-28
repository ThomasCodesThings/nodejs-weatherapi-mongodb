import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import weatherRouter from './routes/weather.js';

const app = express();
const port = process.env.PORT || 3333;

mongoose.connect(`mongodb://mongodb:27017/weatherdata`, { useNewUrlParser: true });
const db = mongoose.connection;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

db.on('error', (err) => {
     console.error(err); 
});

db.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
});

app.use('/api/weather', weatherRouter);

export default app;
