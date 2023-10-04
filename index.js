const express = require("express");
const app = express();
require('dotenv').config()
const cors  = require("cors")
const port = process.env.PORT || 5000;

// middle ware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.REACT_APP_USER_DB}:${process.env.REACT_APP_PASSWORD_DB}@cluster0.v2v9b72.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const usersCollection = client.db("Ecommerce_web").collection("users");
    const cardsCollection = client.db("Ecommerce_web").collection("carts")
    const phoneProductsCollection = client.db("Ecommerce_web").collection("phone_products")

    // products get apis
    app.get("/products",async(req,res)=>{
      const result = await phoneProductsCollection.find().toArray();
      res.send(result);
    })

    // products single details apis
    app.get("/products/:id",async(req,res)=>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const result = await phoneProductsCollection.findOne(filter);
      res.send(result);
    })

    // product cards get apis
    app.get("/carts",async(req,res)=>{
      const email = req.query.email;
      if(!email){
        res.send([])
      }
      const query = {email: email};
      const result = await cardsCollection.find(query).toArray();
      res.send(result);
    })

    // product catds apis added post data
    app.post("/carts",async(req,res)=>{
      const item = req.body;
      const result  = await cardsCollection.insertOne(item);
      res.send(result)
    })

    // create user apis and send data mongodb database
    app.post("/user", async(req,res)=>{
        const user = req.body;
        const query = {email : user.email};
        const existingUser = await usersCollection.findOne(query);
        if(existingUser){
          return res.send({message: "User already exists"})
        }
        const result = await usersCollection.insertOne(user);
        res.send(result)
    })

    // delete carts menu apis from database
    app.delete("/carts/:id",async(req,res)=>{
      const id = req.params.id;
      const query ={_id : new ObjectId(id)};
      const result = await cardsCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/",(req,res)=>{
    res.send("Ecommerce server is running")
})
app.listen(port,()=>{
    console.log(`server is running ${port}`)
})