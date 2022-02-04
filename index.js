const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;


const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.60qwo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect();
        console.log('database Connected Successfully');
        //Database
        const database = client.db('Merch-BD');
        const userCollection = database.collection('users');
        const taskCollection = database.collection('tasks');
        const submittedTaskCollection = database.collection('submissions');
        const statusCollection = database.collection('status');



        
        //==================task======================
        //-------------Get All task----------------
        app.get('/tasks', async (req, res) => {
            const cursor = taskCollection.find({});
            const task = await cursor.toArray();
            res.send(task);
        })


        //-------------Get Individual task------------
        app.get('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const task = await taskCollection.find({ _id: ObjectId(id) }).toArray();
            console.log(req.params.id);
            console.log(task);
            res.send(task[0])        //task[0] or have to send id?
        })


        //------------------POST task API-----------------
        app.post('/tasks', async (req, res) => {
            const cursor = req.body;
            const task = await taskCollection.insertOne(cursor);
            console.log('hit the post api', cursor);
            // res.json(task);
            res.send(task);
        })


        //----------------DELETE Task API------------------------
        app.delete('/task/:id', async (req, res) => {
            const id = req.params.id;
            const cursor = { _id: ObjectId(id) };
            const task = await taskCollection.deleteOne(cursor);
            // res.json(id)
            res.send(task)
        })




        //*******************User s Collection ***************** */
        app.post('/addUserInfo', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            // res.json(result)
            res.send(result)
            console.log(result)
        })

        //make admin
        app.put('/makeadmin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            // const options = { upsert: true };
            // const updateDoc = {$set: user};
            // const result = await userCollection.updateOne(filter, updateDoc, options);
            const result = await userCollection.find(filter).toArray();
            console.log(result)
            if (result) {
                const documents = await userCollection.updateOne(filter, {
                    $set: { role: "admin" },
                });
                console.log(documents);
                //     res.send(result)
            }
            // res.send(result)
            // res.json(result);
        })


        // app.put('/users/admin', async(req, res) => {
        //     const user = req.body;
        //     console.log('put', user)
        //     const filter = {email : user.email};
        //     const updateDoc = { $set: {role: 'admin'}};
        //     const result = await userCollection.updateOne(filter, updateDoc);
        //     res.json(result)
        // })

        // Get All User 
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find({});
            const user = await cursor.toArray();
            res.send(user);
            // console.log(user)
        });













        //========================Submission Status===================== */
        //---------------Submitted Task API-------------------
        app.post('/submission', async (req, res) => {
            const order = await submittedTaskCollection.insertOne(req.body);
            res.send(order);
        })

        //---------------Get All Tasks---------------------------
        app.get('/submission', async (req, res) => {
            const orders = await submittedTaskCollection.find({}).toArray();
            res.send(orders)
        })
        //---------------Get Individual Task---------------------------
        app.get('/tasks/:email', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            console.log(query)
            const orders = await submittedTaskCollection.find(query).toArray();
            res.send(orders)
        })

        //------------Check Admin or Not
        app.get("/checkAdmin/:email", async (req, res) => {
            const result = await userCollection
                .find({ email: req.params.email })
                .toArray();
            console.log(result);
            res.send(result)
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running CRUD server, Server is Online');
});
app.listen(port, () => {
    console.log('Running server on port', port);
})