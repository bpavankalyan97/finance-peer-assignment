const express = require('express');
const path = require('path');
const cors = require('cors');

const {open} = require('sqlite');
const sqlite3 = require('sqlite3');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const bcryptHashCode = 10;
const jwtSecretKey = "MY_SECRET_TOKEN";

const app = express();
app.use(cors());
app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
    try {
        db = await open({
            filename: path.join(__dirname, "Database.db"),
            driver: sqlite3.Database,
        });
        console.log("Established Database connection");

        app.listen(3001, ()=>{
            console.log("Server started, running at http://localhost:3001/");
        })
    }
    catch(error){
        console.error(error.message);
        process.exit(1);
    }
}

const sendErrorResponse = (response, errorMessage) => {
    response.status(400);
    response.send({error_message: errorMessage});
}

const validateCredentials = (request, response, next) => {
    const {username, password} = request.body;

    if (username === "" && password === ""){
        sendErrorResponse(response, "Invalid username and password");
    }
    else if (username === ""){
        sendErrorResponse(response, "Invalid username");
    }
    else if (password === ""){
        sendErrorResponse(response, "Invalid password");
    }
    else{
        next();
    }
}

app.post("/login", validateCredentials, async (request, response) => {
    const {username, password} = request.body;

    try{
        const dbUsernameQuery = `SELECT * FROM users WHERE username='${username}'`;
        const dbObject = await db.get(dbUsernameQuery);

        if (dbObject === undefined){
            sendErrorResponse(response, "Username didn't exist");
        }
        else{
            const isPasswordMatched = await bcrypt.compare(password, dbObject.password);

            if(isPasswordMatched){
                const payload = {username};
                const jwtToken = jwt.sign(payload, jwtSecretKey);
                const responseObject = {
                    firstname: dbObject.firstname,
                    jwt_token: jwtToken
                };
                response.send(responseObject);
            }
            else{
                sendErrorResponse(response, "Username and Password didn't match");
            }
        }
    }
    catch(error){
        console.error(error.message);
    }
});

app.post("/register", validateCredentials, async (request, response) => {
    const {username, password, firstname, lastname} = request.body;

    try{
        const dbUsernameQuery = `SELECT * FROM users WHERE username='${username}'`;
        const dbObject = await db.get(dbUsernameQuery);

        if (dbObject !== undefined){
            sendErrorResponse(response, "Username already exist, Try again with different email ID");
        }
        else{
            const encryptedPassword = await bcrypt.hash(password, bcryptHashCode);

            const insertUserQuery = 
                `INSERT INTO users (
                    username, password, firstname, lastname
                ) VALUES (
                    '${username}',
                    '${encryptedPassword}',
                    '${firstname}',
                    '${lastname}'
                )`;
            
            const dbResponse = await db.run(insertUserQuery);
            response.send({message: 'User registration successful'});
        }
    }
    catch(error){
        console.error(error.message);
    }
});

app.get("/", (request, response) => {
    response.send("Hello user, welcome..");
});

initializeDbAndServer();