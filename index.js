const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tgrk550.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const galleryCollection = client.db("miniSportixDB").collection("gallery");
    const toysCollection = client.db("miniSportixDB").collection("toys");

    // creating index for toy name field
    const indexKeys = { toyName: 1 };
    const indexOptions = { name: "toyName" };
    const result = await toysCollection.createIndex(indexKeys, indexOptions);

    // search implement
    app.get("/toySearchByName/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await toysCollection
        .find({
          $or: [{ toyName: { $regex: searchText, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });

    // gallery data read
    app.get("/gallery", async (req, res) => {
      const cursor = galleryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // add toy to database
    app.post("/toys", async (req, res) => {
      const newToy = req.body;
      const result = await toysCollection.insertOne(newToy);
      res.send(result);
    });

    // read all toys data from database
    app.get("/toys", async (req, res) => {
      const cursor = toysCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("MiniSportix server is running");
});

app.listen(port, () => {
  console.log(`MiniSportix server is running on port: ${port}`);
});
