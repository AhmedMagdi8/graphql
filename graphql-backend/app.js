const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const authMiddleware = require('./middleware/is-auth');

const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolvers = require('./graphql/resolvers');


const app = express();


const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    // 'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    'GET', 'POST'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors());
app.use(authMiddleware);

app.put('/post-image', (req,res,next) => {
  if(!req.file) {
    return res.status(200).json({message: "No file uploaded"})
  }

  if(req.body.oldPath) {
    clearImage(req.body.oldPath);
  }
   
  return res.status(200).json({message: "File stored.", filePath: req.file.path});
})

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolvers,
  graphiql: true, // Enable GraphiQL interface
  customFormatErrorFn(err) {
    if(!err.originalError) {
      return err;
    }

    console.log(err);
    const data = err.originalError.data;
    const message = err.message || "An error occurred";
    const code = err.originalError.code || 500;
    return {message: message, status: code, data:data};
  } 
 
}))
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    'mongodb+srv://ahmed:ahmed123@cluster0.quguh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(result => {
    app.listen(8080);
    console.log("app is listening on " + "127.0.0.1:8000");
  })
  .catch(err => console.log(err));


const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};
