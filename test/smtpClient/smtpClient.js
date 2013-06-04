this.smtpClientTests= {

    'Create smtpClient object': function(test) {
        var client = smtpClient();
        test.ok(true, client instanceof smtpClient);
        test.done();
    },

    'Connect to and disconnect from a testserver': function(test){
        test.expect(2);

        var client = smtpClient("localhost", 1025);
        client.connect();

        client.onidle = function(){
            test.ok(1, "Connection opened");
            client.close();
        };

        client.onerror = function(err){
            test.ifError(err);
        };

        client.onclose = function(){
            test.ok(1, "Connection closed");
            test.done();
        };
    },

    'Disconnect with QUIT': function(test){
        test.expect(2);

        var client = smtpClient("localhost", 1025);
        client.connect();

        client.onidle = function(){
            test.ok(1, "Connection opened");
            client.quit();
        };

        client.onerror = function(err){
            test.ifError(err);
        };

        client.onclose = function(){
            test.ok(1, "Connection closed");
            test.done();
        };
    },

    'Authenticate with default method': function(test){
        test.expect(2);

        var client = smtpClient("localhost", 1025, {
            auth: {
                user: "testuser",
                pass: "testpass"
            }
        });

        client.connect();

        client.onidle = function(){
            test.ok(1, "Connection opened");
            client.quit();
        };

        client.onerror = function(err){
            test.ifError(err);
        };

        client.onclose = function(){
            test.ok(1, "Connection closed");
            test.done();
        };
    },

    'Authenticate using PLAIN': function(test){
        test.expect(2);

        var client = smtpClient("localhost", 1025, {
            auth: {
                user: "testuser",
                pass: "testpass"
            },
            authMethod: "PLAIN"
        });

        client.connect();

        client.onidle = function(){
            test.ok(1, "Connection opened");
            client.quit();
        };

        client.onerror = function(err){
            test.ifError(err);
        };

        client.onclose = function(){
            test.ok(1, "Connection closed");
            test.done();
        };
    },

    'Authenticate using LOGIN': function(test){
        test.expect(2);

        var client = smtpClient("localhost", 1025, {
            auth: {
                user: "testuser",
                pass: "testpass"
            },
            authMethod: "LOGIN"
        });

        client.connect();

        client.onidle = function(){
            test.ok(1, "Connection opened");
            client.quit();
        };

        client.onerror = function(err){
            test.ifError(err);
        };

        client.onclose = function(){
            test.ok(1, "Connection closed");
            test.done();
        };
    },

    'Authenticate with invalid data': function(test){
        test.expect(2);

        var client = smtpClient("localhost", 1025, {
            auth: {
                user: "testuser1",
                pass: "testpass1"
            },
            authMethod: "PLAIN"
        });

        client.connect();

        client.onidle = function(){
            test.ok(false, "Connection should not be opened, as authentication fails");
            client.quit();
        };

        client.onerror = function(err){
            test.ok(err, "Authentication error");
        };

        client.onclose = function(){
            test.ok(1, "Connection closed");
            test.done();
        };
    },

    'MAIL FROM fails': function(test){
        test.expect(3);

        var client = smtpClient("localhost", 1025);

        client.connect();

        var first = 0;

        client.onidle = function(){
            if(first++){
                test.ok(false, "Should not occur");
                client.quit();
                return;
            }
            test.ok(1, "Connection opened");
            client.useEnvelope({from: "fail@fail.ee"});
        };

        client.onerror = function(err){
            test.ok(err, "Mail validation failed");
        };

        client.onclose = function(){
            test.ok(1, "Connection closed");
            test.done();
        };
    },

    'RCPT TO: fails (no recipients)': function(test){
        test.expect(3);

        var client = smtpClient("localhost", 1025);

        client.connect();

        var first = 0;

        client.onidle = function(){
            if(first++){
                test.ok(false, "Should not occur");
                client.quit();
                return;
            }
            test.ok(1, "Connection opened");
            client.useEnvelope({from: "nofail@fail.ee"});
        };

        client.onerror = function(err){
            test.ok(err, "Mail validation failed");
        };

        client.onclose = function(){
            test.ok(1, "Connection closed");
            test.done();
        };
    },

    'RCPT TO: fails (invalid recipient)': function(test){
        test.expect(3);

        var client = smtpClient("localhost", 1025);

        client.connect();

        var first = 0;

        client.onidle = function(){
            if(first++){
                test.ok(false, "Should not occur");
                client.quit();
                return;
            }
            test.ok(1, "Connection opened");
            client.useEnvelope({from: "nofail@fail.ee", to: "fail@fail.ee"});
        };

        client.onerror = function(err){
            test.ok(err, "Mail validation failed");
        };

        client.onclose = function(){
            test.ok(1, "Connection closed");
            test.done();
        };
    },

    'RCPT TO: success': function(test){
        test.expect(3);

        var client = smtpClient("localhost", 1025);

        client.connect();

        var first = 0;

        client.onidle = function(){
            if(first++){
                test.ok(false, "Should not occur");
                client.quit();
                return;
            }
            test.ok(1, "Connection opened");
            client.useEnvelope({from: "nofail@fail.ee", to: "nofail@fail.ee"});
        };

        client.onerror = function(err){
            test.ifError(err, "Mail validation failed");
        };

        client.onready = function(){
            test.ok(1, "Mail validation passed");
            client.close();
        };

        client.onclose = function(){
            test.ok(1, "Connection closed");
            test.done();
        };
    },

    'RCPT TO: success with some failures': function(test){
        test.expect(3);

        var client = smtpClient("localhost", 1025);

        client.connect();

        var first = 0;

        client.onidle = function(){
            if(first++){
                test.ok(false, "Should not occur");
                client.quit();
                return;
            }
            test.ok(1, "Connection opened");
            client.useEnvelope({from: "nofail@fail.ee", to: ["nofail@fail.ee", "fail@fail.ee"]});
        };

        client.onerror = function(err){
            test.ifError(err, "Mail validation failed");
        };

        client.onready = function(failedRecipients){
            test.deepEqual(failedRecipients, ["fail@fail.ee"]);
            client.close();
        };

        client.onclose = function(){
            test.ok(1, "Connection closed");
            test.done();
        };
    },

    'DATA: success': function(test){
        test.expect(4);

        var client = smtpClient("localhost", 1025);

        client.connect();

        var first = 0;

        client.onidle = function(){
            if(first++){
                test.ok(false, "Should not occur");
                client.quit();
                return;
            }
            test.ok(1, "Connection opened");
            client.useEnvelope({from: "nofail@fail.ee", to: ["nofail@fail.ee"]});
        };

        client.onerror = function(err){
            test.ifError(err, "DATA command failed");
        };

        client.onready = function(failedRecipients){
            test.ok(1, "Waiting for data");
            var message = "Subject: Hello!\r\n\r\nMessage";

            Array.prototype.slice.call(message).forEach(function(c){
                client.send(c);
            });
            client.end();
        };

        client.ondone = function(status){
            test.ok(status, "message accepted");
            client.quit();
        };

        client.onclose = function(){
            test.ok(1, "Connection closed");
            test.done();
        };
    },

    'DATA: success with dots': function(test){
        test.expect(4);

        var client = smtpClient("localhost", 1025);

        client.connect();

        var first = 0;

        client.onidle = function(){
            if(first++){
                test.ok(false, "Should not occur");
                client.quit();
                return;
            }
            test.ok(1, "Connection opened");
            client.useEnvelope({from: "nofail@fail.ee", to: ["nofail@fail.ee"]});
        };

        client.onerror = function(err){
            test.ifError(err, "DATA command failed");
        };

        client.onready = function(failedRecipients){
            test.ok(1, "Waiting for data");
            var message = "Subject: Hello!\r\n\r\n.\r\n.\n.\r\n.Message\r\n.\r\n";

            Array.prototype.slice.call(message).forEach(function(c){
                client.send(c);
            });
            client.end();
        };

        client.ondone = function(status){
            test.ok(status, "message accepted");
            client.quit();
        };

        client.onclose = function(){
            test.ok(1, "Connection closed");
            test.done();
        };
    },
    'Idle after sending message': function(test){
        test.expect(5);

        var client = smtpClient("localhost", 1025);

        client.connect();

        var idle = 0;

        client.onidle = function(){
            if(idle++ > 1){
                test.ok(false, "Should not occur");
                client.quit();
                return;
            }
            if(idle == 2){
                test.ok(true, "Entered idle");
                client.quit();
                return;
            }
            test.ok(1, "Connection opened");
            client.useEnvelope({from: "nofail@fail.ee", to: ["nofail@fail.ee"]});
        };

        client.onerror = function(err){
            test.ifError(err, "DATA command failed");
        };

        client.onready = function(failedRecipients){
            test.ok(1, "Waiting for data");
            var message = "Subject: Hello!\r\n\r\n.\r\n.\n.\r\n.Message\r\n.\r\n";

            Array.prototype.slice.call(message).forEach(function(c){
                client.send(c);
            });
            client.end();
        };

        client.ondone = function(status){
            test.ok(status, "message accepted");
        };

        client.onclose = function(){
            test.ok(1, "Connection closed");
            test.done();
        };
    },

    'Connect to and disconnect from a secure testserver': function(test){
        test.expect(2);

        // Self signed certificates are not supported, so we need a trusted secure server
        var client = smtpClient("smtp.gmail.com", 465, {useSSL: true});
        client.connect();

        client.onidle = function(){
            test.ok(1, "Connection opened");
            client.close();
        };

        client.onerror = function(err){
            test.ifError(err);
        };

        client.onclose = function(){
            test.ok(1, "Connection closed");
            test.done();
        };
    }
};