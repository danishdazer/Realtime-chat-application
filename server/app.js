const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userModel = require("./models/userModel");
const Message = require("./models/Message");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const redisAdapter = require("socket.io-redis");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = 5000;
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  adapter: redisAdapter({
    cluster: true,
    nodes: [
      { host: "localhost", port: 8002 },
      { host: "localhost", port: 8006 },
      { host: "localhost", port: 8007 },
    ],
  }),
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("login", async (data) => {
    try {
      const logged_user_id = data.logged_user_id;
      await userModel.set_Online(logged_user_id);
    } catch (error) {
      console.error("Error setting user online:", error);
    }
  });

  socket.on("join_room", async (data) => {
    try {
      const chatId = data;

      socket.join(data);
      console.log(`User with ID: ${socket.id} joined chat: ${data}`);

      const chatMessages = await Message.findOne({ chatId });

      if (chatMessages) {
        socket.emit("chat_history", chatMessages.messages);
      }
    } catch (error) {
      console.error("Error retrieving chat history from database:", error);
    }
  });

  socket.on("send_message", async (data) => {
    console.log(data.chat_id, data.sender_id, data.message, data.timestamp);

    try {
      const savedMessage = await Message.findOneAndUpdate(
        { chatId: data.chat_id },
        {
          $push: {
            messages: {
              senderId: data.sender_id,
              author: data.author,
              message: data.message,
            },
          },
        },
        { upsert: true, new: true }
      );

      io.to(data.chat_id).emit("receive_message", data);
    } catch (error) {
      console.error("Error saving message to database:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

const mongodbURI = "";

mongoose
  .connect(mongodbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.use("/auth", authRoutes);
app.use("/id", chatRoutes);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
