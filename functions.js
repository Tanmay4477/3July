const fs = require("fs");
const secret_key = "tanmay";
const jwt = require("jsonwebtoken");


const writeJsonFile = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const readJsonFile = (filePath) => {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
};


const authMiddleware = (req, res, next) => {
    const token = req.headers["authorization"];
    if(!token) {
        return res.status(401).json({msg: "Access Denied"});
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], secret_key);
        req.user = decoded // Attach decoded user info to request object
        next(); // Call the next middleware
      } catch (err) {
        res.status(400).json({ message: "Invalid token" });
      }
    };


module.exports = {writeJsonFile, readJsonFile, authMiddleware};