if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const express = require("express");
const _ = require("lodash");
const date = require(__dirname + "/date.js");
const day = date.getDate();
const mongoose = require("mongoose");
const app = express();
app.set("view engine", "ejs");
mongoose.set('useFindAndModify', false);
app.use(
  express.urlencoded({ extended: true }));
app.use(express.static("public"));

// connecting to db
mongoose.connect(process.env.MONGO_DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// item schema
const itemsSchema = {
  name: {
    type: String,
    required: true,
  },
};
const Item = new mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to your to do list !",
});
const item2 = new Item({
  name: "Hit + button to add new item.",
});
const item3 = new Item({
  name: "<--- Hit this to remove this item.",
});
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  list: [itemsSchema]
}
const List = new mongoose.model("List", listSchema);

app.get("/:list", (req, res) => {                  //   custom list
  const reqList = _.capitalize(req.params.list);

  List.findOne({ name: reqList }, (err, foundList) => {
    if (foundList) {
      // show list
      res.render("list", { listTitle: reqList, newListItems: foundList.list });
    } else {
      // create list
      const list = new List({
        name: reqList,
        list: defaultItems
      });
      list.save();
      res.redirect("/" + reqList);
    }
  });
});

app.get("/", (req, res) => {                  // home route
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("added items !");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: day,
        newListItems: foundItems,
      });
    }
  });
});

app.post("/", (req, res) => {                   // adding item
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.list.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

});

app.post("/delete", (req, res) => {               // deleting itms
  const delCheckId = req.body.delCheck;
  const listName = req.body.listName;

  if (listName === day) {
    Item.deleteOne({ _id: delCheckId }, (err) => {
      if (err) {
        console.log(err);
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { list: { _id: delCheckId } } }, (err, foundList) => {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/about", (req, res) => res.render("about")); // about

//connecting to server
app.listen(process.env.PORT, () => console.log("Server Started !"));
