const mongoose = require('mongoose');

// Connect to MongoDB using Mongoose
mongoose.connect("mongodb+srv://lokesh:12345@cluster0.n9upzef.mongodb.net/supportdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Database connected successfully");
}).catch((err) => {
    console.error("Database connection error:", err);
});

module.exports = mongoose;