import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

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
         unique: true,
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

userSchema.pre("save", async function (next) {
   if (!this.isModified("password")) return next();
   this.password = await bcrypt.hash(password, 12);
   next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
   return bcrypt.compare(candidatePassword, this.password);
};
const User = model("User", userSchema);

export default User;
