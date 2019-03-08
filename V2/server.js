// http server for meal api
const fs = require('fs');
const express = require('express');

const stageOne = require('./transforms/stageOne');



// configure express server
const app = express();
const port = 7000;
app.listen(port, () => {
    console.log(`App running on port ${port}`);
});

app.get('/', async (req, res) => {
    try {
        const meals = await getMeals();
        res.send(meals);
    } catch (error) {
        res.send(error).status(500);
    }
});

app.get('/test', async (req, res) => {
    console.log(`/test`);
    try {
        const rawData = fs.readFileSync('./data/211OntarioData.json');
        const data = JSON.parse(rawData);
        console.log(`parsed data ${data.length}`)
        const stageOneData = await stageOne.stageOneParser(data);
        res.send(stageOneData);
    } catch (error) {
        res.send(error).status(500);
    }
})

const getMeals = async () => {
    return new Promise((resolve, reject) => {
        fs.readFile('./meals.json', (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(JSON.parse(data));
        });
    });
}
