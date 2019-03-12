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
        // res.send(stageOne.destructure("Mon (closed) * Tue-Fri 8 am-6 pm * Sat 7 am-4 pm * Sun 10 am-3 pm"));

        const rawData = fs.readFileSync('./data/211OntarioData.json');
        const stageOneData = await stageOne.stageOneParser(JSON.parse(rawData));
        fs.writeFileSync('./data/tmp/stageOne.json', JSON.stringify(stageOneData));
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
