
/*
We never expect anything else than ASCII from the SMTP server, 
exept when SMTPUTF8 (RFC6531) parameter is used in which case 
the server might also respond with UTF-8. As we never expect
anything else than ASCII or UTF-8 and TextEncoder can only encode
unicode, there is no need to use arraybuffers when communicating
with a SMTP server. Even if we want to use the 8BITMIME, we have
to use UTF-8 - actually, we can use UTF-16le/be as well but lets
just ignore this for now :)
So, assuming only UTF-8 both ways should always be fine and this
means that strings can be used instead of arraybuffers.
*/

/**
 * Generates a parser object for data coming from a SMTP server
 *
 * @constructor
 */
var SMTPResponseParser = function(){

    /**
     * If the complete line is not received yet, contains the beginning of it
     */
    this._remainder = "";

    /**
     * If the response is a list, contains previous not yet emitted lines
     */
    this._block = [];

    /**
     * If the response is a list, save the status code of the last line
     */
    this._blockStatus = null;

    /**
     * If set to true, do not accept any more input
     */
    this.destroyed = false;
}

// Event handlers

/**
 * NB! Errors do not block, the parsing and data emitting continues despite of the errors
 */
SMTPResponseParser.prototype.onerror = function(error){};
SMTPResponseParser.prototype.ondata = function(data){};
SMTPResponseParser.prototype.onend = function(){};


// Public API

/**
 * Queue some data from the server for parsing. Only allowed, if 'end' has not been called yet
 *
 * @param {String} chunk Chunk of data received from the server
 */
SMTPResponseParser.prototype.write = function(chunk){
    if(this.destroyed){
        return this.onerror(new Error("This parser has already been closed, 'write' is prohibited"));
    }

    // Lines should always end with <CR><LF> but you never know, might be only <LF> as well
    var lines = (this._remainder + (chunk || "")).split(/\r?\n/);
    this._remainder = lines.pop(); // not sure if the line has completely arrived yet

    for(var i=0, len = lines.length; i<len; i++){
        this._processLine(lines[i]);
    }
}

/**
 * Indicate that all the data from the server has been received. Can be called only once.
 *
 * @param {String} [chunk] Chunk of data received from the server
 */
SMTPResponseParser.prototype.end = function(chunk){
    if(this.destroyed){
        return this.onerror(new Error("This parser has already been closed, 'end' is prohibited"));
    }

    if(chunk){
        this.write(chunk);
    }

    if(this._remainder){
        this._processLine(this._remainder);
    }

    this.destroyed = true;
    this.onend();
}

// Private API

/**
 * Processes a single and complete line. If it is a continous one (slash after status code),
 * queue it to this._block
 *
 * @param {String} line Complete line of data from the server
 */
SMTPResponseParser.prototype._processLine = function(line){
    var match;
    
    // possible input strings for the regex:
    // 250-MESSAGE
    // 250 MESSAGE
    // 250 1.2.3 MESSAGE
    if((match = line.match(/^(\d{3})([\- ])(?:(\d+\.\d+\.\d+)(?: ))?(.*)/))){
        
        this._block.push(match[4]);
        
        if(match[2] == "-"){
            if(this._blockStatus && this._blockStatus != match[1]){
                this.onerror("Invalid status code " + match[1] + " for multi line response (" + this._blockStatus + " expected)");
            }else if(!this._blockStatus){
                this._blockStatus = match[1];
            }
            return;
        }else{
            this.ondata({
                statusCode: Number(match[1]) || 0, 
                enhancedStatus: match[3] || null, 
                data: this._block,
                line: line
            });
            this._block = [];
            this._blockStatus = null;
        }
    }else{
        this.onerror(new Error("Invalid SMTP response \"" + line + "\""));
        this.ondata({
            statusCode: this._blockStatus || 0, 
            enhancedStatus: null, 
            data: line,
            line: line
        });
        this._block = [];
        this._blockStatus = null;
    }
}

/*

var test = new SMTPResponseParser();
test.ondata = console.log.bind(console, "data");
test.onerror = console.log.bind(console, "error");
test.onend = console.log.bind(console, "end");

test.write("220 smtp.example.com ESMTP Postfix\n250-smtp2.example.com Hello bob.example.org [192.0.2.201]\n250-SIZE 14680064\n250-PIPELINING\n250 HELP\n250 Ok\n354 End data with <CR><LF>.<CR><LF>\n250 Ok: queued as 12345\n221 Bye\r\n");

var data = "220 mx.google.com ESMTP v46si5233591een.227 - gsmtp\n250-mx.google.com at your service, [198.211.126.226]\n250-SIZE 35882577\n251-8BITMIME\n250-STARTTLS\n250 ENHANCEDSTATUSCODES\n555 5.5.2 Syntax error. v46si5233591een.227 - gsmtp";
for(var i=0, len=data.length; i<len; i++) test.write(data.charAt(i));
test.end();
*/