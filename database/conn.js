const mongoose = require("mongoose");

module.exports.dbConnector = () => {
  mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  let db = mongoose.connection;

  db.once("error", err => {
    console.log("Error in connection to Database");
    console.log(err);
  });
  db.once("open", () => {
    console.log("Connected to Database Succesfully");
  });
};
