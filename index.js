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

app.use(express.json());

app.post('/query', async (req, res) => {
  const { dbName, collectionName, operation, query = {}, data = {} } = req.body;

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    let result;

    switch (operation) {
      case 'find':
        result = await collection.find(query).toArray();
        break;
      case 'insertOne':
        result = await collection.insertOne(data);
        break;
      case 'updateOne':
        result = await collection.updateOne(query, { $set: data });
        break;
      case 'deleteOne':
        result = await collection.deleteOne(query);
        break;
      default:
        return res.status(400).send('Unsupported operation');
    }

    res.json(result);
  } catch (err) {
    console.error('Mongo tunnel error:', err);
    res.status(500).send('Mongo tunnel error');
  } finally {
    await client.close();
  }
});