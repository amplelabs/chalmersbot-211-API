// http server for meal api
const fs = require('fs');
const express = require('express');



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
