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
      },
      rootDirId: {
         type: Schema.Types.ObjectId,

         ref: "Directory",
      },
      picture: {
         type: String,
         default:
            "https://img.icons8.com/liquid-glass-color/1200/user-male-circle.jpg",
      },
      role: {
         type: String,
         enum: ["Admin", "Manager", "User"],
         default: "User",
      },
      deleted: {
         type: Boolean,
         default: false,
      },
   },
   {
      strict: "throw",
      versionKey: false,
   },
);

userSchema.pre("save", async function () {
   if (!this.isModified("password")) return;
   this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
   return bcrypt.compare(candidatePassword, this.password);
};
const User = model("User", userSchema);

export default User;
