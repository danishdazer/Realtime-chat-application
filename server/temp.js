const mongoose = require("mongoose");

// Assuming 'Chat' is the name of your model
delete mongoose.models["Chat"];

// Assuming 'Chat' is the name of your schema
delete mongoose.modelSchemas["Chat"];

// Optional: Disconnect from the database
mongoose.disconnect();
