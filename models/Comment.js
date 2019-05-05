var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var commentSchema = new Schema({
    body: String
});

var Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;