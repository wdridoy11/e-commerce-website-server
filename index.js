const express = require("express");
const app = express();
require('dotenv').config()
const cors  = require("cors")
const port = process.env.PORT || 5000;

// middle ware
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.REACT_APP_USER_DB}:${process.env.REACT_APP_PASSWORD_DB}@cluster0.llrrixz.mongodb.net/?retryWrites=true&w=majority`;

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
     client.connect();

     const productsCollection = client.db("E-commerce-web").collection("products")

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