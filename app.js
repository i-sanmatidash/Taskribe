require("dotenv").config();
const express = require("express");
const mongoose= require("mongoose");
const _=require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));


mongoose.connect(`mongodb+srv://sanmatidash:${process.env.PASSWORD}@cluster0.et7dgjb.mongodb.net/Taskribe`,{family:4})

const itemsSchema={
  name:String
} ;

const Item= mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"Hi!! Taskribers."
});

const item2 = new Item({
  name:"Hit the + button to add a new item."
});

const item3 = new Item({
  name:"Check off the corresponding checkbox to delete an item."
});


const defaultItems=[item1,item2,item3];


const listSchema={
  name:String,
  items:[itemsSchema]
}

const List=mongoose.model("List",listSchema);


app.get("/", function(req, res) {
  async function findItems(){
  try{
    const founditems=await Item.find({});
    if(founditems.length===0){
        Item.insertMany(defaultItems)
       .then(function(){
        console.log("Default items inserted successfully");
       })
       .catch(function(err){
       console.log(err);
       });
      res.redirect("/");
    }
   
    else{
        res.render("list", {listTitle:"Today", newListItems: founditems});
    }
    
  }
  catch(err){
    console.log(err);
  }
}
findItems();
});


app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:customListName", function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName})
  .then(function(foundlist){
      if(!foundlist){
        
        const list= new List({
        name:customListName,
        items:defaultItems
       });
        list.save();
        res.redirect("/"+customListName);
         }
  else{
    
    res.render("list", {listTitle:foundlist.name, newListItems: foundlist.items});

  }
})
.catch(function(err){
  console.log(err);
})
  
})


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item= new Item({
    name:itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName})
    .then(function(foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listName); 
    })
    .catch(function(err){
      console.log(err);
    })
  }
  

});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
   Item.findByIdAndRemove(checkedItemId)
  .then(function(){
       res.redirect("/");
  })
  .catch(function(err){
      console.log(err);
  });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
    .then(function(foundlist){
      res.redirect("/"+listName);
      })
    .catch(function(err){
      console.log(err);
    });
  }

  });




const port= process.env.PORT|| 3000;

app.listen(port, function() {
  console.log(`Server started on port ${port}`);
});
