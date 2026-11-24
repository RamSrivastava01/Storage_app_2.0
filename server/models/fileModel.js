import { model, Schema } from "mongoose";

const fileSchema = new Schema(
   {
      name: {
         type: String,
         required: true,
      },
      size : {
         type : Number, 
         required : true
      },
      extension: {
         type: String,
         required: true,
      },
      parentDirId: {
         type: Schema.Types.ObjectId,
         ref: "Directory",
         required: true,
      },
      userId: {
         type: Schema.Types.ObjectId,
         ref: "User",
      },
   },
   {
      strict: "throw",
      versionKey: false,
      timestamps : true
   },
);
const File = model("File", fileSchema);

export default File;
