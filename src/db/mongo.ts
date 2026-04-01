import mongoose from 'mongoose';

const MONGO_URI =
  'mongodb://admin:admin123@127.0.0.1:27017/budget-mongo?authSource=admin';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected!');
  })
  .catch((err) => {
    console.log(err);
  });
