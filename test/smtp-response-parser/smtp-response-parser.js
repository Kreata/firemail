this.SMTPResponseParserTests= {
    'Create SMTPResponseParser object': function (test) {
        var parser = new SMTPResponseParser();
        test.ok(true, parser instanceof SMTPResponseParser);
        test.done();
    },
    'Write data to parser': function (test) {
        var parser = new SMTPResponseParser();
        parser.write("test");
        test.equal("test", parser._remainder);
        test.done();
    },
    'Events: ondata': function (test) {
        test.expect(1);

        var line = "123 1.2.3 test",
            response = {
                statusCode: 123, 
                enhancedStatus: "1.2.3", 
                data: ["test"], 
                line: line
            }, i=0;

        var parser = new SMTPResponseParser();
        
        parser.ondata = function(data){
            if(i++){
                test.ok(false, "Should not run more than once");
            }
            test.deepEqual(data, response);
            test.done();
        }

        parser.onend = function(){
            test.ok(false, "Not expected");
        }

        parser.onerror = function(err){
            test.ifError(err);
        }

        parser.write(line + "\r\n");
    },

    'Events: ondata, onend': function (test) {
        test.expect(1);

        var line = "123 1.2.3 test",
            response = {
                statusCode: 123, 
                enhancedStatus: "1.2.3", 
                data: ["test"], 
                line: line
            }, i=0;

        var parser = new SMTPResponseParser();
        
        parser.ondata = function(data){
            if(i++){
                test.ok(false, "Should not run more than once");
            }
            test.deepEqual(data, response);
        }

        parser.onend = function(){
            test.done();
        }

        parser.onerror = function(err){
            test.ifError(err);
        }

        parser.write(line);
        parser.end();
    },
    'Events: ondata, onend, write one byte at a time': function (test) {
        test.expect(2);

        var lines = ["123 1.2.3 test", "456 pest"],
            i = 0,
            responses = [{
                statusCode: 123, 
                enhancedStatus: "1.2.3", 
                data: ["test"], 
                line: lines[0]
            },{
                statusCode: 456, 
                enhancedStatus: null, 
                data: ["pest"], 
                line: lines[1]
            }]

        var parser = new SMTPResponseParser();
        
        parser.ondata = function(data){
            test.deepEqual(data, responses[i++]);
        }
        
        parser.onend = function(){
            test.done();
        }

        Array.prototype.slice.call(lines.join("\r\n")).forEach(parser.write.bind(parser));
        parser.end();
    },

    'Multi line response': function (test) {
        test.expect(1);

        var lines = ["123-test1", "123-test2 test3", "123 test4"],
            response = {
                statusCode: 123, 
                enhancedStatus: null, 
                data: ["test1", "test2 test3", "test4"], 
                line: lines.join("\n")
            }, i=0;

        var parser = new SMTPResponseParser();
        
        parser.ondata = function(data){
            if(i++){
                test.ok(false, "Should not run more than once");
            }
            test.deepEqual(data, response);
        }

        parser.onend = function(){
            test.done();
        }

        parser.onerror = function(err){
            test.ifError(err);
        }

        Array.prototype.slice.call(lines.join("\r\n")).forEach(parser.write.bind(parser));
        parser.end();
    },

    'Mixed single and multi line responses': function (test) {
        test.expect(3);

        var lines = [
                "321 1.2.3 test",
                "123-test1",
                "123-test2 test3",
                "123 test4",
                "567 test6"],
            responses = [
                {
                    statusCode: 321, 
                    enhancedStatus: "1.2.3", 
                    data: ["test"], 
                    line: lines[0]
                },
                {
                    statusCode: 123, 
                    enhancedStatus: null, 
                    data: ["test1", "test2 test3", "test4"], 
                    line: lines.slice(1, 4).join("\n")
                },
                {
                    statusCode: 567, 
                    enhancedStatus: null, 
                    data: ["test6"], 
                    line: lines[4]
                }],
            i=0;

        var parser = new SMTPResponseParser();
        
        parser.ondata = function(data){
            test.deepEqual(data, responses[i++]);
        }

        parser.onend = function(){
            test.done();
        }

        parser.onerror = function(err){
            test.ifError(err);
        }

        Array.prototype.slice.call(lines.join("\r\n")).forEach(parser.write.bind(parser));
        parser.end();
    },

    'Events: onerror, invalid line': function (test) {
        test.expect(2);

        var line = "nostatus",
            response = {
                statusCode: null, 
                enhancedStatus: null, 
                data: ["nostatus"], 
                line: line
            }, i=0;

        var parser = new SMTPResponseParser();
        
        parser.ondata = function(data){
            if(i++){
                test.ok(false, "Should not run more than once");
            }
            test.deepEqual(data, response);
        }

        parser.onend = function(){
            test.done();
        }

        parser.onerror = function(err){
            test.ok(err);
        }

        parser.write(line);
        parser.end();
    },

    'Events: onerror, closed stream, no write': function (test) {
        test.expect(1);

        var parser = new SMTPResponseParser();

        parser.onerror = function(err){
            test.ok(err);
            test.done();
        }

        parser.write("123 test1\r\n");
        parser.end();
        parser.write("123 test1\r\n");
    },

    'Events: onerror, closed stream, no end': function (test) {
        test.expect(1);

        var parser = new SMTPResponseParser();

        parser.onerror = function(err){
            test.ok(err);
            test.done();
        }

        parser.write("123 test1\r\n");
        parser.end();
        parser.end();
    },

    'Invalid line break &lt;LF&gt;': function (test) {
        test.expect(3);

        var lines = [
                "321 1.2.3 test",
                "123-test1",
                "123-test2 test3",
                "123 test4",
                "567 test6"],
            responses = [
                {
                    statusCode: 321, 
                    enhancedStatus: "1.2.3", 
                    data: ["test"], 
                    line: lines[0]
                },
                {
                    statusCode: 123, 
                    enhancedStatus: null, 
                    data: ["test1", "test2 test3", "test4"], 
                    line: lines.slice(1, 4).join("\n")
                },
                {
                    statusCode: 567, 
                    enhancedStatus: null, 
                    data: ["test6"], 
                    line: lines[4]
                }],
            i=0;

        var parser = new SMTPResponseParser();
        
        parser.ondata = function(data){
            test.deepEqual(data, responses[i++]);
        }

        parser.onend = function(){
            test.done();
        }

        parser.onerror = function(err){
            test.ifError(err);
        }

        Array.prototype.slice.call(lines.join("\n")).forEach(parser.write.bind(parser));
        parser.end();
    }

};
