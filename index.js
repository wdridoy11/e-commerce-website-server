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
    const wishlistCollection = client.db("Ecommerce_web").collection("wishlist");
    const productsCollection = client.db("Ecommerce_web").collection("products");
    const userAddressCollection = client.db("Ecommerce_web").collection("address");
    const testimonialCollection = client.db("Ecommerce_web").collection("testimonial");


/*========================= products all apis =========================*/
    app.get("/products",async(req,res)=>{
      const result = await productsCollection.find({ status: 'approved' }).toArray();
      res.send(result)
    })

    app.get("/all_product",async(req,res)=>{
      const result = await productsCollection.find().toArray();
      res.send(result);
    })

    app.get("/products/:id",async(req,res)=>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const result = await productsCollection.findOne(filter);
      res.send(result);
    })

    app.post('/products',async(req,res)=>{
      const item = req.body;
      const result = await productsCollection.insertOne(item);
      res.send(result)
    })

    app.get("/search_product/:searchValue",async(req,res)=>{
      const value = req.params.searchValue;
      const result = await productsCollection.find({
        $or:[{product_name: { $regex: value, $options:"i" }}]
      }).toArray();
      res.send(result)
    })

/*========================= seller product all apis =========================*/
    app.post('/seller_product',async(req,res)=>{
      const item = req.body;
      const result = await productsCollection.insertOne({...item,status:"pending"});
      res.send(result)
    })

    app.get('/seller_product',async(req,res)=>{
      const result = await productsCollection.find().toArray();
      res.send(result);
    })

    app.patch('/seller_product/:id',async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updateDoc = {
        $set:{
          status:"approved"
        }
      }
      const result = await productsCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.get("/my_products",async(req,res)=>{
      const email = req.query.email;
      if(!email){
        res.send([])
      }
      const query = {seller_email: email};
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    })


    app.put("/products/:id",async(req,res)=>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const body = req.body;
      const updateDoc = {
        $set:{
          price: body.price,
          product_name: body.product_name,
          small_description:body.small_description,
          product_description:body.product_description
        }
      }
      const result = await productsCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.delete("/products/:id",async(req,res)=>{
      const id = req.params.id;
      const query ={_id : new ObjectId(id)};
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    })

/*========================= add to carts all apis =========================*/
    app.get("/carts",async(req,res)=>{
      const email = req.query.email;
      if(!email){
        res.send([])
      }
      const query = {email: email};
      const result = await cardsCollection.find(query).toArray();
      res.send(result);
    })

    app.post("/carts",async(req,res)=>{
      const item = req.body;
      const result  = await cardsCollection.insertOne(item);
      res.send(result)
    })

    app.delete("/carts/:id",async(req,res)=>{
      const id = req.params.id;
      const query ={_id : new ObjectId(id)};
      const result = await cardsCollection.deleteOne(query);
      res.send(result);
    })

/*========================= wishlist all apis =========================*/
    app.get("/wishlist",async(req,res)=>{
      const email = req.query.email;
      if(!email){
        res.send([])
      }
      const query = {email: email}
      const result = await wishlistCollection.find(query).toArray();
      res.send(result)
    })

    app.post("/wishlist",async(req,res)=>{
      const item = req.body;
      const result  = await wishlistCollection.insertOne(item);
      res.send(result)
    })

    app.delete("/wishlist/:id", async(req,res)=>{
      const id =req.params.id;
      const filter = {_id : new ObjectId(id)}
      const result = await wishlistCollection.deleteOne(filter);
      res.send(result)
    })


/*========================= Blogs all apis =========================*/
    app.get("/blogs",async(req,res)=>{
      const result = await blogCollection.find().toArray();
      res.send(result)
    })

    app.get("/blog/:id",async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const result = await blogCollection.findOne(filter);
      res.send(result)
    })

/*========================= address all apis =========================*/
    app.get("/address",async(req,res)=>{
      const result = await userAddressCollection.find().toArray();
      res.send(result)
    })

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

/*========================= stripe payment apis =========================*/
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

/*========================= users all apis =========================*/
  app.post("/users", async(req,res)=>{
      const user = req.body;
      const query = {email : user.email};
      const existingUser = await usersCollection.findOne(query);
      if(existingUser){
        return res.send({message: "User already exists"})
      }
      const result = await usersCollection.insertOne({...user,role:"user"});
      res.send(result)
  })

  app.get("/users",async(req,res)=>{
    const result = await usersCollection.find().toArray();
    res.send(result)
  })

  app.get("/users/admin/:email",async(req,res)=>{
    const email = req.params.email;
    const filter = {email : email};
    const user = await usersCollection.findOne(filter);
    const result= {admin : user?.role === "admin"};
    res.send(result)
  });

  app.get("/users/seller/:email",async(req,res)=>{
    const email = req.params.email;
    const filter = {email : email};
    const user = await usersCollection.findOne(filter);
    const result = {seller: user?.role === "seller"}
    res.send(result);
  })

  app.patch("/users/admin/:id",async(req,res)=>{
    const id = req.params.id;
    const filter = {_id : new ObjectId(id)}
    const updateDoc ={
      $set:{
        role:"admin"
      }
    }
    const result = await usersCollection.updateOne(filter, updateDoc);
    res.send(result)
  })

  app.patch("/users/seller/:id",async(req,res)=>{
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)};
    const updateDoc={
      $set:{
        role:"seller"
      }
    }
    const result = await usersCollection.updateOne(filter,updateDoc);
    res.send(result)
  })

  app.patch("/users/user/:id",async(req,res)=>{
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)};
    const updateDoc={
      $set:{
        role:"user"
      }
    }
    const result = await usersCollection.updateOne(filter,updateDoc);
    res.send(result)
  })

    // brand get apis
    app.get("/brands",async(req,res)=>{
      const result = await brandCollection.find().toArray();
      res.send(result)
    })

    // testimonial
   app.get("/testimonial",async(req,res)=>{
    const result = await testimonialCollection.find().toArray();
    res.send(result)
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