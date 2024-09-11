const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const post = process.env.PORT || 5001;

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const mongoUrl = process.env.MONGOURL;
const JWT_SECRET = "dasdhajgdkuefa17323183hnjkanflnuea";

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const geminiFunction = async (city) => {
  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  const result = await chatSession.sendMessage(`${city}`);
  const responseText = await result.response.text();

  res.send({
    status: "Ok",
    data: responseText,
  });
};

app.post("/chat", async (req, res) => {
  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  const result = await chatSession.sendMessage(req.body.message);
  res.send({ status: "Ok", data: result.response.text() });
});

// POST route to handle chat and find college by city
app.post("/chats", async (req, res) => {
  try {
    // Extract the user's message
    const userMessage = req.body.message.trim().toLowerCase(); // Normalize the message for easier comparison
    // const userMessage = req.body.message.trim(); // Normalize the message for easier comparison
    // Check if the message is "hi" or "hello"
    if (userMessage === "hi" || userMessage === "hello") {
      return res.send({
        status: "Ok",
        data: "May I help you?",
      });
    }
    // Extract the city from the user's message
    // const city = req.body.message.trim();
    const city = userMessage;
    // Query MongoDB to find colleges by city
    const collegesInCity = await College.find({ city });

    // Check if colleges are found for the provided city
    if (collegesInCity.length > 0) {
      const collegeDetails = collegesInCity
        .map((college) => {
          return `Name: ${college.name}\n
          Website: ${college.website}
          \nAddress: ${
            college.place
          }\nBranches: ${college.branches.join(", ")}`;
        })
        .join("\n\n");

      const collegeImages = collegesInCity
        .map((college) => {
          return `${college.img}`;
        })
        .join("\n\n");
      // Return the found college data
      res.send({
        status: "Ok",
        data: collegeDetails,
        dataImg: collegeImages,
      });
    } else {
      //If no colleges are found, use Gemini AI to reply intelligently
      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });

      const result = await chatSession.sendMessage(
        // `No data found for ${city}. Could you provide more information on this city's polytechnic colleges?`
        city
      );
      const responseText = await result.response.text();

      res.send({
        status: "Ok",
        data: responseText,
      });
    }
  } catch (error) {
    res.status(500).send({
      status: "Error",
      message: error.message,
    });
  }
});

// College Data System
mongoose // connecting to the database for college data
  .connect(mongoUrl)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log(err);
  });

require("./CollegeData");

const College = mongoose.model("College");

app.post("/college", async (req, res) => {
  try {
    const city = req.body.city; // Get city from request body
    const collegesInCity = req.body.colleges; // Get colleges array from request body

    // Save each college in the city to the database
    const savedColleges = [];
    for (let collegeData of collegesInCity) {
      const newCollege = new College(collegeData);
      const savedCollege = await newCollege.save();
      savedColleges.push(savedCollege);
    }
    res
      .status(201)
      .send({ message: `Colleges added in ${city}`, data: savedColleges });
  } catch (error) {
    res.status(400).send(error);
  }
});

// GET route to retrieve colleges from MongoDB
app.get("/college/:city", async (req, res) => {
  try {
    const city = req.params.city;

    // Find colleges by city
    const colleges = await College.find({ city });

    if (colleges.length > 0) {
      res.status(200).send(colleges);
    } else {
      res.status(404).send({ message: `No colleges found in ${city}` });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// User data System

mongoose //connecting to the database for user details
  .connect(mongoUrl)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log(err);
  });

require("./UserDetails");

const User = mongoose.model("UserInfo");

app.get("/", (req, res) => {
  res.send({ status: "Server is running" });
});

app.post("/register", async (req, res) => {
  const { name, phone, email, password } = req.body;
  const oldUser = await User.findOne({ email: req.body.email });
  if (oldUser) {
    return res.send({ status: "error", data: "User already exists" });
  }
  const encyptedPassword = await bcrypt.hash(password, 10);
  try {
    await User.create({
      name: name,
      phone: phone,
      email: email,
      password: encyptedPassword,
    });
    res.send({ status: "Ok", data: "User created" });
  } catch (err) {
    res.send({ status: "error", data: err });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const oldUser = await User.findOne({ email: req.body.email });
  if (!oldUser) {
    return res.send({ status: "error", data: "User does not exist" });
  }

  if (await bcrypt.compare(password, oldUser.password)) {
    const token = jwt.sign({ email: oldUser.email }, JWT_SECRET);
    if (res.status(201)) {
      return res.send({ status: "Ok", data: token });
    } else {
      return res.send({ status: "Error", data: "Invalid password" });
    }
  } else {
    return res.send({ status: "Error", data: "Invalid password" });
  }
});

app.post("/userdata", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    const useremail = user.email;

    User.findOne({ email: useremail }).then((data) => {
      return res.send({ status: "Ok", data: data });
    });
  } catch (error) {
    return res.send({ error: error });
  }
});

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log(err);
  });

require("./FormData");

app.port("/form", async (req, res) => {
  const { city, colleges } = req.body;
  try {
    // Create new city
    const newCity = new City({ city, colleges });
    await newCity.save();
    res.send({ status: "Ok", data: "CityData" });
  } catch (e) {
    res.send({ status: "Error", data: "Invalid" });
  }
});



app.listen(post, () => {
  console.log(`Server is running on port ${post}`);
});
