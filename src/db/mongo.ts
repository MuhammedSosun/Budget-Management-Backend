import mongoose from 'mongoose';




export const connectDB = () => {
  const MONGO_URI = process.env.MONGO_URI as string;
  if (!MONGO_URI) {
    throw new Error("HATA: .env dosyasında MONGO_URI tanımlanmamış!");
  }
  {
    mongoose
      .connect(MONGO_URI!)
      .then(() => {
        console.log('Connected!');
      })
      .catch((err) => {
        console.log(err);
      });
  }
}