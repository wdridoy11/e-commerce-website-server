const express = require("express");
const app = express();
require('dotenv').config()
const cors  = require("cors")
const stripe = require("stripe")(process.env.REACT_PAYMENT_SECRET_KEY);
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
    const blogCollection = client.db("Ecommerce_web").collection("blogs");
    const usersCollection = client.db("Ecommerce_web").collection("users");
    const cardsCollection = client.db("Ecommerce_web").collection("carts");
    const brandCollection = client.db("Ecommerce_web").collection("brand");
    const paymentCollection = client.db("Ecommerce_web").collection("payment");
    const productsCollection = client.db("Ecommerce_web").collection("products");
    const userAddressCollection = client.db("Ecommerce_web").collection("address");



    // products get apis
    app.get("/products",async(req,res)=>{
      const result = await productsCollection.find().toArray();
      res.send(result);
    })

    // blog data get
    app.get("/blogs",async(req,res)=>{
      const result = await blogCollection.find().toArray();
      res.send(result)
    })

    // single blog
    app.get("/blog/:id",async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const result = await blogCollection.findOne(filter);
      res.send(result)
    })

    // products single details apis
    app.get("/products/:id",async(req,res)=>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const result = await productsCollection.findOne(filter);
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
    app.post("/users", async(req,res)=>{
        const user = req.body;
        const query = {email : user.email};
        const existingUser = await usersCollection.findOne(query);
        if(existingUser){
          return res.send({message: "User already exists"})
        }
        const result = await usersCollection.insertOne(user);
        res.send(result)
    })

    // brand get apis
    app.get("/brands",async(req,res)=>{
      const result = await brandCollection.find().toArray();
      res.send(result)
    })

    // user address get apis
    app.get("/address",async(req,res)=>{
      const result = await userAddressCollection.find().toArray();
      res.send(result)
    })

    // user addres send  database
    app.post("/address",async(req,res)=>{
      const address = req.body;
      const result = await userAddressCollection.insertOne(address);
      res.send(result);
    });

    app.delete("/address/:id",async(req,res)=>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)};
      const result = await userAddressCollection.deleteOne(filter);
      res.send(result);
    })
    
    // delete carts menu apis from database
    app.delete("/carts/:id",async(req,res)=>{
      const id = req.params.id;
      const query ={_id : new ObjectId(id)};
      const result = await cardsCollection.deleteOne(query);
      res.send(result);
    })

    // stripe payment
    app.post("/create-payment-intent", async(req,res)=>{
      const {price} = req.body;
      const amount = parseInt(price*100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types:['card']
      })
      res.send({
        clientSecret: paymentIntent.client_secret
      })
    })

    app.post('/payment',async(req,res)=>{
      const payment = req.body;
      const insertResult = await paymentCollection.insertOne(payment);
      const query = {_id: {$in: payment.cardItems.map((id)=> new ObjectId(id))}}
      const deleteResult = await cardsCollection.deleteMany(query);
      res.send({result: insertResult, deleteResult})
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