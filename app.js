// ? Requires side


const express = require("express");
const bodyParser = require("body-parser");
const moongose = require('mongoose');
const { render } = require("ejs");
const { default: mongoose } = require("mongoose");
const _ = require('lodash');


const app = express();

main().catch(err => console.log(err));
async function main() {
    await moongose.connect('mongodb+srv://KodaCode:UF7TMAnEWnQQI1yK@kodadb.trkqeed.mongodb.net/todolistDB')
}

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"));


// ? funcional side

const itemsSchema = new moongose.Schema ({
    name: String,
});

const Item = new moongose.model("Item", itemsSchema);



const work = new Item({
    name: 'Work',
})

const eat = new Item({
    name: 'Eat Something'
});

const study = new Item({
    name: 'Study English'
})



const defaultItems = [work,eat,study];


const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const List = new mongoose.model("List", listSchema);




app.get("/", function(req,res){
    
    Item.find({}).then(function(foundItems){
        if(foundItems === 0) {
            Item.insertMany([{defaultItems}]).then(function(){
                console.log('welcome')
            }).catch(function(err){
                console.log(err);
            })
            res.redirect("/");
        }else{
            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems,
            })
        } 
    }).catch(function(err){
        console.log(err);
    });

    })  



app.post("/", function(req,res){
    let itemName = req.body.newItem
    const listName = req.body.list;


    const item = new Item({
        name: itemName,
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}).then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);

        })
    }

    
})

app.post("/delete", function(req,res){
   const deleteItem= req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today"){
        Item.deleteOne({_id: deleteItem}).then(function(err){
         console.log("element successefully deleted");
        })
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:deleteItem}}}).then(function(){
            console.log("element did delete");
        }).catch(function(err){
            console.log(err);
        });
        res.redirect("/" + listName);
    }


})




app.get("/:customListName", function(req,res) {

    const topic = _.capitalize(req.params.customListName);
    
  

    List.findOne({name: topic}).then(function(foundList){
        if (!foundList){
            const list = new List({
                name: topic,
                items: defaultItems
            });
        
            list.save();

            res.redirect("/" + topic)
        }else {
         res.render("list", {
            listTitle: foundList.name,
            newListItems: foundList.items
         })
        }
     }).catch(function(err){
         console.log(err);
     });


})

app.post("/work", function(req,res){
    
    let item = req.body.newItem;


        workItems.push(item);
        res.redirect("/work")
})

app.get("/about", function(req,res){
    res.render("about");
});







app.listen(3000, function(){
    console.log("Server started on port 3000");
} )