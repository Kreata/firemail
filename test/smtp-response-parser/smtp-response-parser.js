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
    }
};
