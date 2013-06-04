this.smtpResponseParserTests= {

    'Create smtpResponseParser object': function(test) {
        var parser = new smtpResponseParser();
        test.ok(true, parser instanceof smtpResponseParser);
        test.done();
    },

    'Write data to parser': function(test) {
        var parser = new smtpResponseParser();
        parser.send("test");
        test.equal("test", parser._remainder);
        test.done();
    },

    'Events: ondata': function(test) {
        test.expect(1);

        var line = "250 1.2.3 test",
            response = {
                success: true,
                statusCode: 250,
                enhancedStatus: "1.2.3",
                data: "test",
                line: line
            }, i=0;

        var parser = new smtpResponseParser();

        parser.ondata = function(data){
            if(i++){
                test.ok(false, "Should not run more than once");
            }
            test.deepEqual(data, response);
            test.done();
        };

        parser.onend = function(){
            test.ok(false, "Not expected");
        };

        parser.onerror = function(err){
            test.ifError(err);
        };

        parser.send(line + "\r\n");
    },

    'Events: ondata, onend': function(test) {
        test.expect(1);

        var line = "250 1.2.3 test",
            response = {
                success: true,
                statusCode: 250,
                enhancedStatus: "1.2.3",
                data: "test",
                line: line
            }, i=0;

        var parser = new smtpResponseParser();

        parser.ondata = function(data){
            if(i++){
                test.ok(false, "Should not run more than once");
            }
            test.deepEqual(data, response);
        };

        parser.onend = function(){
            test.done();
        };

        parser.onerror = function(err){
            test.ifError(err);
        };

        parser.send(line);
        parser.end();
    },

    'Events: ondata, onend, write one byte at a time': function(test) {
        test.expect(2);

        var lines = ["250 1.2.3 test", "252 pest"],
            i = 0,
            responses = [{
                success: true,
                statusCode: 250,
                enhancedStatus: "1.2.3",
                data: "test",
                line: lines[0]
            },{
                success:true,
                statusCode: 252,
                enhancedStatus: null,
                data: "pest",
                line: lines[1]
            }];

        var parser = new smtpResponseParser();

        parser.ondata = function(data){
            test.deepEqual(data, responses[i++]);
        };

        parser.onend = function(){
            test.done();
        };

        Array.prototype.slice.call(lines.join("\r\n")).forEach(parser.send.bind(parser));
        parser.end();
    },

    'Multi line response': function(test) {
        test.expect(1);

        var lines = ["250-test1", "250-test2 test3", "250 test4"],
            response = {
                success: true,
                statusCode: 250,
                enhancedStatus: null,
                data: "test1\ntest2 test3\ntest4",
                line: lines.join("\n")
            }, i=0;

        var parser = new smtpResponseParser();

        parser.ondata = function(data){
            if(i++){
                test.ok(false, "Should not run more than once");
            }
            test.deepEqual(data, response);
        };

        parser.onend = function(){
            test.done();
        };

        parser.onerror = function(err){
            test.ifError(err);
        };

        Array.prototype.slice.call(lines.join("\r\n")).forEach(parser.send.bind(parser));
        parser.end();
    },

    'Mixed single and multi line responses': function(test) {
        test.expect(3);

        var lines = [
                "256 1.2.3 test",
                "250-test1",
                "250-test2 test3",
                "250 test4",
                "254 test6"],
            responses = [
                {
                    success: true,
                    statusCode: 256,
                    enhancedStatus: "1.2.3",
                    data: "test",
                    line: lines[0]
                },
                {
                    success: true,
                    statusCode: 250,
                    enhancedStatus: null,
                    data: "test1\ntest2 test3\ntest4",
                    line: lines.slice(1, 4).join("\n")
                },
                {
                    success: true,
                    statusCode: 254,
                    enhancedStatus: null,
                    data: "test6",
                    line: lines[4]
                }],
            i=0;

        var parser = new smtpResponseParser();

        parser.ondata = function(data){
            test.deepEqual(data, responses[i++]);
        };

        parser.onend = function(){
            test.done();
        };

        parser.onerror = function(err){
            test.ifError(err);
        };

        Array.prototype.slice.call(lines.join("\r\n")).forEach(parser.send.bind(parser));
        parser.end();
    },

    'Events: onerror, invalid line': function(test) {
        test.expect(2);

        var line = "nostatus",
            response = {
                success: false,
                statusCode: null,
                enhancedStatus: null,
                data: "nostatus",
                line: line
            }, i=0;

        var parser = new smtpResponseParser();

        parser.ondata = function(data){
            if(i++){
                test.ok(false, "Should not run more than once");
            }
            test.deepEqual(data, response);
        };

        parser.onend = function(){
            test.done();
        };

        parser.onerror = function(err){
            test.ok(err);
        };

        parser.send(line);
        parser.end();
    },

    'Events: onerror, closed stream, no write': function(test) {
        test.expect(1);

        var parser = new smtpResponseParser();

        parser.onerror = function(err){
            test.ok(err);
            test.done();
        };

        parser.send("250 test1\r\n");
        parser.end();
        parser.send("250 test1\r\n");
    },

    'Events: onerror, closed stream, no end': function(test) {
        test.expect(1);

        var parser = new smtpResponseParser();

        parser.onerror = function(err){
            test.ok(err);
            test.done();
        };

        parser.send("250 test1\r\n");
        parser.end();
        parser.end();
    },

    'Invalid line break &lt;LF&gt;': function(test) {
        test.expect(3);

        var lines = [
                "256 1.2.3 test",
                "250-test1",
                "250-test2 test3",
                "250 test4",
                "254 test6"],
            responses = [
                {
                    success: true,
                    statusCode: 256,
                    enhancedStatus: "1.2.3",
                    data: "test",
                    line: lines[0]
                },
                {
                    success: true,
                    statusCode: 250,
                    enhancedStatus: null,
                    data: "test1\ntest2 test3\ntest4",
                    line: lines.slice(1, 4).join("\n")
                },
                {
                    success: true,
                    statusCode: 254,
                    enhancedStatus: null,
                    data: "test6",
                    line: lines[4]
                }],
            i=0;

        var parser = new smtpResponseParser();

        parser.ondata = function(data){
            test.deepEqual(data, responses[i++]);
        };

        parser.onend = function(){
            test.done();
        };

        parser.onerror = function(err){
            test.ifError(err);
        };

        Array.prototype.slice.call(lines.join("\n")).forEach(parser.send.bind(parser));
        parser.end();
    },

    'Response success false': function(test) {
        test.expect(1);

        var line = "150 1.2.3 test",
            response = {
                success: false,
                statusCode: 150,
                enhancedStatus: "1.2.3",
                data: "test",
                line: line
            }, i=0;

        var parser = new smtpResponseParser();

        parser.ondata = function(data){
            if(i++){
                test.ok(false, "Should not run more than once");
            }
            test.deepEqual(data, response);
            test.done();
        };

        parser.onend = function(){
            test.ok(false, "Not expected");
        };

        parser.onerror = function(err){
            test.ifError(err);
        };

        parser.send(line + "\r\n");
    }

};
