import { model, Schema } from "mongoose";

const userSchema = new Schema(
   {
      name: {
         type: String,
         required: true,
         minLength: [3, "Name should have at least 3 characters"],
      },
      email: {
         type: String,
         required: true,
         match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/,
            "Please enter a valid email",
         ],
      },
      password: {
         type: String,
         minLength: 4,
         required: true,
      },
      rootDirId: {
         type: Schema.Types.ObjectId,

         ref: "Directory",
      },
   },
   {
      strict: "throw",
      versionKey: false,
   },
);
const User = model("User", userSchema);

export default User;
