const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

app.get('/ping', async (req, res) => {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    res.send('Pinged your deployment. You successfully connected to MongoDB!');
  } catch (e) {
    console.error(e);
    res.status(500).send('Failed to connect to MongoDB');
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Mongo tunnel server listening on port ${port}`);
});
