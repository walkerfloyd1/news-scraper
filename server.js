var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

app.get("/scrape", function(req, res) {
    axios.get("https://www.nytimes.com/").then(function(response) {
        var $ = cheerio.load(response.data);
        $("article").each(function(i, element) {
            var result = {};
            summary = "";
            if ($(this).find("ul").length) {
                summary = $(this).find("li").first().text();
            }
            else {
                summary = $(this).find("p").text();
            }
        })
        result.title = $(this).find("h2").text();
        result.summary = summary;
        result.link = "https://www.nytimes.com" + $(this).find("a").attr("href");

        db.Article.create(result).then(function(dbArticle){
            console.log(dbArticle);
        }).catch(function(err) {
            console.log(err)
        })
        res.send("Scrape Done");
    });
});
app.get("/articles", function (req, res) {
    db.Article.find({}, function(error, found) {
        if (error) {
            console.log(error);
        }
        else {
            res.json(found);
        }
    })
});
app.get("/articles/:id", function (req, res) {
    db.Article.find({ id: req.params.id}).populate("comment").then(function(dbUser){
        res.json(dbUser);
    }).catch(function(err){
        res.json(err);
    })
})
app.put("/articles/:id", function (req, res) {
    db.Comment.create(req.body).then(function(dbComment) {
        return db.Article.findOneAndUpdate({ "_id": req.params.id}, {$push: { note: dbComment.id}}, {new: true});
    }).then(function(dbArticle) {
        res.json(dbArticle);
    }).catch(function(err) {
        if (err) {
            res.json(err);
        }
    });
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});