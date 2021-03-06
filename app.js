var express = require("express");

var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

var nunjucks  = require("nunjucks");

var mainControllers = require("./controllers/main");
var adminControllers = require("./controllers/admin");
var apiControllers = require("./controllers/api");

var fs = require("fs");

var app = express();

var modulesScripts = [];

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "nunjucks");

nunjucks.configure("views", {
    autoescape: true,
    express   : app
});

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/static", express.static(path.join(__dirname, "static")));

// expose module names to the views
app.use(function(req,res,next){
    res.locals.modulesScripts = modulesScripts;
    next();
});

app.use("/", mainControllers);
app.use("/admin", adminControllers);
app.use("/api", apiControllers);

(function loadDevices() {
    var devicesFolder = "devices";

    // TODO: see if there is a way to do this using async methods
    //       for now, if we use async methods, the module.exports
    //       happen before we can add our modules to the app
    var files = fs.readdirSync(devicesFolder);

    for (var f=0; f < files.length; f++)
    {
        var moduleName = files[f];
        var moduleDir = path.join(devicesFolder, moduleName);

        if (fs.statSync(moduleDir).isDirectory())
        {
            var moduleInfo = JSON.parse(fs.readFileSync(path.join(moduleDir, "package.json")));
            var modulePrefix = "/" + (moduleInfo.apiName || moduleName);

            app.use(modulePrefix + "/api", require("./devices/" + moduleName + "/api"));
            app.use(modulePrefix + "/static", express.static(path.join(moduleDir, "static")));

            moduleInfo.scripts.forEach(function (script) {
                var script = path.join(modulePrefix, script);
                modulesScripts.push(script);
            });

            console.log("Loaded module:", moduleName);
        }
    }
})();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === 'development') {
    app.use(function(err, req, res) {
        res.status(err.status || 500);
        res.render("error.html", {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render("error.html", {
        message: err.message,
        error: {}
    });
});


module.exports = app;
