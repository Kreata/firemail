this.sendmailTests = {
    "Should end with error": function(test){
        var mail = {
            smtp:{
                host: "localhost",
                port: 1025
            },
            from: "sender@example.com",
            subject: "test",
            text: "test"
        };

        sendmail(mail, function(err, success){
            test.ok(err);
            test.ok(!success);
            test.done();
        });
    },
    "should pass": function(test){
        var mail = {
            smtp:{
                host: "localhost",
                port: 1025
            },
            from: "sender@example.com",
            to: "receiver@example.com",
            subject: "test",
            text: "test"
        };

        sendmail(mail, function(err, success){
            test.ok(!err);
            test.ok(success);
            test.done();
        });
    }
};