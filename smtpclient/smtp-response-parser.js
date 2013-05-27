
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
    this._block = {data: [], lines: [], statusCode: null};

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

    if(!line.trim()){
        // nothing to check, empty line
        return;
    }

    this._block.lines.push(line);

    if((match = line.match(/^(\d{3})([\- ])(?:(\d+\.\d+\.\d+)(?: ))?(.*)/))){
        
        this._block.data.push(match[4]);
        
        if(match[2] == "-"){
            if(this._block.statusCode && this._block.statusCode != Number(match[1])){
                this.onerror("Invalid status code " + match[1] + 
                    " for multi line response (" + this._block.statusCode + " expected)");
            }else if(!this._block.statusCode){
                this._block.statusCode = Number(match[1]);
            }
            return;
        }else{
            this.ondata({
                statusCode: Number(match[1]) || 0, 
                enhancedStatus: match[3] || null, 
                data: this._block.data,
                line: this._block.lines.join("\n")
            });
            this._block = {data: [], lines: [], statusCode: null};
            this._block.statusCode = null;
        }
    }else{
        this.onerror(new Error("Invalid SMTP response \"" + line + "\""));
        this.ondata({
            statusCode: this._block.statusCode || null, 
            enhancedStatus: null, 
            data: [line],
            line: this._block.lines.join("\n")
        });
        this._block = {data: [], lines: [], statusCode: null};
    }
}
