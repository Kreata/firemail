var simplesmtp = require("simplesmtp"),
    smtp = simplesmtp.createServer({
        name: "localtest",
        debug: true,
        timeout: 15000,
        SMTPBanner: "SMTP test server for unit tests",
        enableAuthentication: true,
        maxSize: 123456789,
        authMethods: ["PLAIN", "LOGIN"],
        ignoreTLS: true,
        disableDNSValidation: true
    });

console.log("Creating test SMTP Server on port 1025");

smtp.listen(1025);

smtp.on("authorizeUser", function(connection, username, password, callback){
    callback(null, username == "testuser" && password == "testpass");
});

smtp.on("validateSender", function(connection, email, callback){
    callback(email == "fail@fail.ee" ? new Error("FAIL"): null);
});

smtp.on("validateRecipient", function(connection, email, callback){
    callback(email == "fail@fail.ee" ? new Error("FAIL"): null);
});

smtp.on("startData", function(connection){
    console.log("Message from:", connection.from);
    console.log("Message to:", connection.to);
});

smtp.on("data", function(connection, chunk){
//    console.log(chunk.toString());
});

smtp.on("dataReady", function(connection, callback){
    callback(null, "ABC1"); // ABC1 is the queue id to be advertised to the client
    // callback(new Error("Rejected as spam!")); // reported back to the client
});