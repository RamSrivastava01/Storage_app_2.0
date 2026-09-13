import { model, Schema } from "mongoose";

const sessionSchema = new Schema(
   {
      userId: {
         type: Schema.Types.ObjectId,
         required: true,
      },
      createdAt: {
         type: Date,
         default: Date.now,
         expires: 30 * 2 * 60 * 24,
      },
   },

   {
      strict: "throw",
      versionKey: false,
   },
);
const Session = model("Session", sessionSchema);

export default Session;
