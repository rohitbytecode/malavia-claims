import { connectDatabase } from "../config/db.js";
import { UserModel } from "../modules/users/schema/user.schema.js";
import mongoose from "mongoose";

const run = async () => {
  await connectDatabase();
  const users = await UserModel.find({});
  console.log("Users in database:", JSON.stringify(users, null, 2));
  await mongoose.disconnect();
};
run();
