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

const sendErrorResponse = (response, errorMessage, status=400) => {
    response.status(status);
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
        const dbUsernameQuery = `SELECT * FROM users WHERE username='${username}';`;
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
        sendErrorResponse(response, error.message, 500);
    }
});

app.post("/register", validateCredentials, async (request, response) => {
    const {username, password, firstname, lastname} = request.body;

    try{
        const dbUsernameQuery = `SELECT * FROM users WHERE username='${username}';`;
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
        sendErrorResponse(response, error.message, 500);
    }
});

const authenticateUser = (request, response, next) => {
    const authHeader = request.headers["authorization"];

    let jwtToken;
    if (authHeader !== undefined) {
        jwtToken = authHeader.split(" ")[1];
      }

    if(jwtToken === undefined){
        sendErrorResponse(response, "Invalid JWT Token", 401);
    }
    else{
        jwt.verify(jwtToken, jwtSecretKey, async (error, payload) => {
            if(error){
                sendErrorResponse(response, "Invalid JWT Token", 401);
            }
            else{
                request.username = payload.username;
                next();
            }
        });
    }

};

app.post("/upload", authenticateUser, async (request, response) => {
    const {username} = request;
    const {data} = request.body;
    const stringifyedData = JSON.stringify(data);

    const getUserQuery = `SELECT data FROM user_data WHERE username='${username}';`;

    try{
        const dbResponse = await db.get(getUserQuery);

        const insertUserDataQuery = dbResponse === undefined ? 
            `INSERT INTO user_data (username, data) VALUES ('${username}', '${stringifyedData}');` :
            `UPDATE user_data SET data = '${stringifyedData}' WHERE username = '${username}'`;
        
        await db.run(insertUserDataQuery);
        response.status(200);
        response.send({message: "Data uploaded successful"});
    }
    catch(error){
        console.log(error.message);
        sendErrorResponse(response, error.message, 500);
    }
});

app.get("/data", authenticateUser, async (request, response) => {
    const {username} = request

    const userDataQuery = `SELECT data FROM user_data WHERE username='${username}';`;

    try{
        const dbResponse = await db.get(userDataQuery);

        if (dbResponse === undefined){
            response.status(200);
            response.send({
                data: [],
                message: "No stored data available for this user"
            })
        }
        else{
            response.status(200);
            response.send({
                data: JSON.parse(dbResponse.data)
            });
        }
    }
    catch(error){
        console.log(error.message);
        sendErrorResponse(response, error.message, 500);
    }

});

initializeDbAndServer();