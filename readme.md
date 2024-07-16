const express = require("express"); // Importing the Express module
const fs = require("fs"); // Importing the File System module
const path = require("path"); // Importing the Path module
const jwt = require("jsonwebtoken"); // Importing the JSON Web Token module
const bcrypt = require("bcrypt"); // Importing the bcrypt module

const app = express();
const PORT = 3000;
const SECRET_KEY = "your_secret_key"; // Secret key for signing JWTs

app.use(express.json()); // Middleware to parse JSON bodies

const usersFilePath = path.join(__dirname, "users.json"); // Path to the users.json file

// Utility function to read JSON files
const readJSONFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return []; // Return an empty array if the file doesn't exist
  }
  const data = fs.readFileSync(filePath, "utf-8"); // Read the file synchronously
  return JSON.parse(data); // Parse and return the JSON data
};

// Utility function to write to JSON files
const writeJSONFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); // Write the data to the file
};

// Middleware to authenticate JWT tokens
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }
  try {
    const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
    req.user = decoded; // Attach decoded user info to request object
    next(); // Call the next middleware
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// Register user endpoint
app.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body; // Get username and password from request body
  const users = readJSONFile(usersFilePath);

  if (users.find((user) => user.username === username)) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash the password using bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword }); // Store username and hashed password
  writeJSONFile(usersFilePath, users);

  res.status(201).json({ message: "User registered successfully" });
});

// Login user endpoint
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const users = readJSONFile(usersFilePath);
  const user = users.find((user) => user.username === username);

  // Check if user exists and if the password is correct
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Create a JWT token
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
});

// Protected route example
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

/*
# User Registration
curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username": "testuser", "password": "password123"}'

# User Login
curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "testuser", "password": "password123"}'

# Access Protected Route (replace YOUR_JWT_TOKEN with the actual token)
curl -X GET http://localhost:3000/api/protected \
    -H "Authorization: Bearer YOUR_JWT_TOKEN"
*/
/*
# Example Workflow
# 1. Register a new user:
curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username": "testuser", "password": "password123"}'

# 2. Log in with the registered user:
curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "testuser", "password": "password123"}'

# You should receive a response with a JWT token, something like:
# {
#     "token": "your_jwt_token_here"
# }

# 3. Access the protected route:
curl -X GET http://localhost:3000/api/protected \
    -H "Authorization: Bearer your_jwt_token_here"
*/

HW for next class
1 -> Create HTML page for login and Signup
2-> when logged in , move to a new page there you will show user information and token as well.
3-> send token in headers and edit info api that will add other details like email,phone,etc


'Authorization': `Bearer ${data.token}` 