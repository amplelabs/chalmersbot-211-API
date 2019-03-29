'use strict';
// http server for meal api
const _ = require('lodash');
const express = require('express');
const fs = require('fs');

const stageOne = require('./transforms/stageOne');
const stageTwo = require('./transforms/stageTwo');
const stageThree = require('./transforms/stageThree');



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
        const stageOneData = await stageOne.stageOneParser(JSON.parse(rawData));
        fs.writeFileSync('./data/tmp/stageOne.json', JSON.stringify(stageOneData, null, 2));

        const stageTwoData = stageTwo.cleanup(stageOneData);
        fs.writeFileSync('./data/tmp/stageTwo.json', JSON.stringify(stageTwoData, null, 2));
        
        const stageThreeData = stageThree.createAmpleData(stageTwoData);
        fs.writeFileSync('./data/tmp/stageThree.json', JSON.stringify(stageThreeData, null, 2));
        res.send(stageThreeData);
    } catch (error) {
        res.send(error).status(500);
    }
});

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

