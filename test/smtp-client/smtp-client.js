this.SMTPClientTests= {
    
    'Create SMTPClient object': function (test) {
        var client = new SMTPClient();
        test.ok(true, client instanceof SMTPClient);
        test.done();
    },

    'Connect to and disconnect from a testserver': function(test){
        test.expect(2);

        var client = new SMTPClient("localhost", 1025);
        client.connect();
        
        client.onidle = function(){
            test.ok(1, "Connection opened");
            client.close();
        }

        client.onerror = function(err){
            test.ifError(err);
            test.done();
        }

        client.onclose = function(){
            test.ok(1, "Connection closed");
            test.done();
        }
    },

    'Disconnect with QUIT': function(test){
        test.expect(2);

        var client = new SMTPClient("localhost", 1025);
        client.connect();
        
        client.onidle = function(){
            test.ok(1, "Connection opened");
            client.quit();
        }

        client.onerror = function(err){
            test.ifError(err);
            test.done();
        }

        client.onclose = function(){
            test.ok(1, "Connection closed");
            test.done();
        }
    }

}