const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt= require("bcrypt");
const secret_key = "tanmay";
const app = express();
const PORT = 3000;
const {writeJsonFile, readJsonFile, authMiddleware} = require("./functions");
app.use(express.json());


const usersFilePath = path.join(__dirname, "users.json");
const indexFilePath = path.join(__dirname, "index.html");
const welcomeIndex = path.join(__dirname, "welcome.html");

app.get("/", (req, res) => {
    res.sendFile(indexFilePath);
})

app.get("/api", async(req, res) => {
    const users = readJsonFile(usersFilePath);
    res.status(200).json({users});
});

app.get("/welcome", (req, res) => {
    res.sendFile(welcomeIndex);
})

app.post("/api/auth/register", async(req, res) => {
    const {username, password} = req.body;
    const users = readJsonFile(usersFilePath);

    users.find((user) => {
        if(user.username === username) {
            return res.status(400).json({msg: "User exist"});
        };
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    writeJsonFile(usersFilePath, users);

    res.status(201).json({message: "Successful"});
});

app.post("/api/auth/edit", authMiddleware, async(req, res) => {
    const {oldUsername, username, password, email, phone} = req.body;
    const users = readJsonFile(usersFilePath);
    const hashedPassword = await bcrypt.hash(password, 10);

    users.forEach((user) => {
        if (user.username === oldUsername) {
            user.username = username,
            user.password = hashedPassword,
            user.email = email,
            user.phone = phone
        };
        writeJsonFile(usersFilePath, users);
    })
    res.status(201).json({msg: "Success"});
});

app.post("/api/auth/login", async(req, res) => {
    const {username, password} = req.body;
    const users = readJsonFile(usersFilePath);
    const user = users.find((user) => user.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({msg: "Invalid Credentials"});
    };

    const token = jwt.sign({username}, secret_key, {expiresIn: "1h"});
    res.status(201).json({token, username, password});
})

app.get("/protected", authMiddleware, (req, res) => {
    res.status(200).json({msg: "Entered into a protected route", user: req.user});
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});