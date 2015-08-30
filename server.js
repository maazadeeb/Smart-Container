#!/bin/env node
//  OpenShift sample Node application
var express = require("express");
var fs      = require("fs");
var bodyParser = require("body-parser");
var mongojs = require("mongojs");
var ip = require("ip");


/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;
    var failure = {"status": false};
    var success = {"status": true};


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn("No OPENSHIFT_NODEJS_IP var");
            self.ipaddress = ip.address();
        };

        self.connectionString = "127.0.0.1/builder";
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log("%s: Received %s - terminating sample app ...",
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log("%s: Node server stopped.", Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on("exit", function() { self.terminator(); });

        // Removed "SIGPIPE" from the list - bugz 852598.
        ["SIGHUP", "SIGINT", "SIGQUIT", "SIGILL", "SIGTRAP", "SIGABRT",
         "SIGBUS", "SIGFPE", "SIGUSR1", "SIGSEGV", "SIGUSR2", "SIGTERM"
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.getRoutes = { };
        self.postRoutes = { };

        self.getRoutes["/getContainers"] = function(req, res) {
            console.log("Get containers..")
            res.setHeader("Content-Type", "application/json");
            
            self.db.container.find({}, {_id: false}).sort(
            	{containerId: 1}, 
            	function(err, docs) {
	            	if (!err) {
	            		res.json(docs);
	            	} else {
	            		res.json(failure);
					}
				}
			);
        };

        self.postRoutes["/update/:containerId/:weight"] = function(req, res) {
            var containerIdParam = parseInt(req.params.containerId);
            var weightParam = parseFloat(req.params.weight);
            var dateParam = Math.floor(Date.now() / 1000);
            console.log("Updating container %d with %d", containerIdParam, weightParam);
            res.setHeader("Content-Type", "application/json");

            self.db.container.update({containerId: containerIdParam}, {$push: {itemWeight: weightParam, date: dateParam}},
            	function (err, updated) {
            		if(!err) {
            			res.json(success);
            		} else {
            			res.json(failure);
            		}

            	}
            );
            
        };

    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();
        self.app.use(bodyParser.urlencoded({
            extended: true
        }));
        self.app.use(bodyParser.json());
        self.app.use(bodyParser.raw());
        self.db = mongojs(self.connectionString, ["container"]);

        //  Adding handlers for HTTP GET.
        for (var r in self.getRoutes) {
            self.app.get(r, self.getRoutes[r]);
        }

        // Adding handlers for HTTP POST
        for (var r in self.postRoutes) {
        	self.app.post(r, self.postRoutes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log("Node server started on %s:%d ...", self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

