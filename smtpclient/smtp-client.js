
function SMTPClient(port, host, options){

    this.options = options || {};

    this.port = port || (this.options.useSSL ? 465 : 25);
    this.host = host || "localhost";

    this.options.useSSL = !!this.options.useSSL;
    this.options.auth = this.options.auth || false;

    this.options.name = this.options.name || "localhost";

    this._secureMode = false;

    this._parser = new SMTPResponseParser();

    this.destroyed = false;

    this.socket = false;

    this._suspended = false;

    this._supportedAuth = [];

    this._dataMode = false;

    this._currentAction = false;

    this._maxAllowedSize = 0;

    this._waitDrain = false;

    /**
     * If STARTTLS support lands in TCPSocket, _secureMode can be set to
     * true, once the connection is upgraded
     */
    this._secureMode = !!this.options.useSSL;
}

SMTPClient.prototype.onerror = function(err){
    console.log(err)
};

SMTPClient.prototype.ondrain = function(){
    console.log("\nDRAIN");
};

SMTPClient.prototype.onclose = function(){
    console.log("\nCLOSE");
};

SMTPClient.prototype.onidle = function(){
    console.log("\nIDLE");
};
SMTPClient.prototype.onwaiting = function(){
    console.log("\nWAITING");
};
SMTPClient.prototype.ondone = function(){
    console.log("\nDONE");
};

SMTPClient.prototype.connect = function(){
    console.log("\nconnecting to "+this.host + ":" + this.port);
    // only mozTCPSocket exists currently but you'll never know when it's going to change
    var socket = navigator.TCPSocket || navigator.mozTCPSocket;

    this.socket = socket.open(this.host, this.port, {
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
        binaryType: "string",
        useSSL: this._secureMode
    });

    this.socket.onerror = this._onError.bind(this);
    this.socket.onopen = this._onOpen.bind(this);
};

SMTPClient.prototype.suspend = function(){
    if(!this._suspended && this.socket && this.socket.readyState === "open"){
        this.socket.suspend();
        this._suspended = true;
    }
}

SMTPClient.prototype.resume = function(){
    if(this._suspended && this.socket && this.socket.readyState === "open"){
        this.socket.resume();
        this._suspended = false;
    }
}

/**
 * <p>Connection listener that is run when the connection to
 * the server is opened</p>
 *
 * @event
 */
SMTPClient.prototype._onOpen = function(){
    console.log("\nSOCKET OPEN!")

    this.socket.ondata = this._onData.bind(this);

    this.socket.onclose = this._onClose.bind(this);
    this.socket.ondrain = this._onDrain.bind(this);
    
    this._parser.ondata = this._onCommand.bind(this);

    this._currentAction = this._actionGreeting;
};

SMTPClient.prototype._destroy = function(){
    if(!this.destroyed){
        this.destroyed = true;
        this.onclose();
    }
};

SMTPClient.prototype._onData = function(evt){
    console.log("\nS: " + evt.data.replace(/\r/g, "<CR>").replace(/\n/g, "<LF>\n"));
    this._parser.send(evt.data);
};

SMTPClient.prototype._onDrain = function(evt){
    this._waitDrain = false;
    this.ondrain();
};

SMTPClient.prototype._onCommand = function(command){
    console.log("\nS: " + JSON.stringify(command));
    this._currentAction.call(this, command);
}

SMTPClient.prototype._onError = function(evt){
    if(evt instanceof Error){
        this.onerror(evt);
    }else if(evt.data instanceof Error){
        this.onerror(evt.data);
    }else{
        this.onerror(new Error(evt));
    }
    
    this.close();
};

SMTPClient.prototype._onClose = function(){
    console.log("\nRECEIVED CLOSE EVENT")
    this._destroy();
};

SMTPClient.prototype.send = function(chunk){
    // works only in data mode
    if(!this._dataMode){
        // this line should never be reached but if it does,
        // act like everything's normal.
        return true;
    }

    // Keeping eye on the last bytes sent, to see if there is a <CR><LF> sequence
    // at the end which is needed to end the data stream
    if(chunk.length > 2){
        this._lastDataBytes = chunk.substr(-2);
    }else if(chunk.length == 1){
        this._lastDataBytes = this._lastDataBytes.substr(-1) + chunk;
    }

    console.log("\nC: " + chunk.replace(/\r/g, "<CR>").replace(/\n/g, "<LF>\n"))

    // pass the chunk to the socket
    return (this._waitDrain = this.socket.send(chunk));
};

/**
 * <p>Indicates that a data stream for the socket is ended. Works only
 * in data mode.</p>
 *
 * @param {Buffer} [chunk] Chunk of data to be sent to the server
 */
SMTPClient.prototype.end = function(chunk){
    // works only in data mode
    if(!this._dataMode){
        // this line should never be reached but if it does,
        // act like everything's normal.
        return true;
    }

    if(chunk && chunk.length){
        this.send(chunk);
    }

    // redirect output from the server to _actionStream
    this._currentAction = this._actionStream;

    // indicate that the stream has ended by sending a single dot on its own line
    // if the client already closed the data with \r\n no need to do it again
    if(this._lastDataBytes == "\r\n"){
        this.socket.send(".\r\n");
    }else if(this._lastDataBytes.substr(-1) == "\r"){
        this.socket.send("\n.\r\n");
    }else{
        this.socket.send("\r\n.\r\n");
    }

    // end data mode
    this._dataMode = false;
};

/**
 * <p>Send a command to the server, append \r\n</p>
 *
 * @param {String} str String to be sent to the server
 */
SMTPClient.prototype.sendCommand = function(str){
    console.log("\nC: " + str.replace(/\r/g, "<CR>").replace(/\n/g, "<LF>\n"));
    this.socket.send(str + "\r\n");
};

/**
 * <p>Sends QUIT</p>
 */
SMTPClient.prototype.quit = function(){
    this.sendCommand("QUIT");
    this._currentAction = this.close;
};

/**
 * <p>Closes the connection to the server</p>
 */
SMTPClient.prototype.close = function(){
    if(this.socket && this.socket.readyState === "open"){
        console.log("\nClosing socket");
        this.socket.close();
    }else{
        console.log("\nClosing. Call destroy");
        this._destroy();
    }
};

/**
 * <p>Initiates a new message by submitting envelope data, starting with
 * <code>MAIL FROM:</code> command</p>
 *
 * @param {Object} envelope Envelope object in the form of
 *        <code>{from:"...", to:["..."]}</code>
 */
SMTPClient.prototype.useEnvelope = function(envelope){
    this._envelope = envelope || {};
    this._envelope.from = [].concat(this._envelope.from || ("anonymous@"+this.options.name))[0];

    // clone the recipients array for latter manipulation
    this._envelope.rcptQueue = [].concat(this._envelope.to || []);
    this._envelope.rcptFailed = [];

    console.log("\nFROM:\n" + this._envelope.from)
    console.log("\nTO:\n" + JSON.stringify(this._envelope.to))

    this._currentAction = this._actionMAIL;
    this.sendCommand("MAIL FROM:<"+(this._envelope.from)+">");
};

SMTPClient.prototype._authenticateUser = function(){

    if(!this.options.auth){
        // no need to authenticate, at least no data given
        this._currentAction = this._actionIdle;
        this.onidle(); // ready to take orders
        return;
    }

    var auth;
    
    if(this.options.authMethod) {
        auth = this.options.authMethod.toUpperCase().trim();
    }else{
        // use first supported
        auth = (this._supportedAuth[0] || "PLAIN").toUpperCase().trim();
    }

    switch(auth){
        case "LOGIN":
            this._currentAction = this._actionAUTH_LOGIN_USER;
            this.sendCommand("AUTH LOGIN");
            return;
        case "PLAIN":
            this._currentAction = this._actionAUTHComplete;
            this.sendCommand(
                // convert to BASE64
                window.btoa(unescape(encodeURIComponent(
                    "AUTH PLAIN " +
                    //this.options.auth.user+"\u0000"+
                    "\u0000"+ // skip authorization identity as it causes problems with some servers
                    this.options.auth.user+"\u0000"+
                    this.options.auth.pass))));
            return;
    }

    this._onError(new Error("Unknown authentication method - " + auth));
};

/** ACTIONS **/

SMTPClient.prototype._actionGreeting = function(command){
    if(command.statusCode != 220){
        this._onError(new Error("Invalid greeting from server - " + command.line));
        return;
    }

    this._currentAction = this._actionEHLO;
    this.sendCommand("EHLO "+this.options.name);
};

SMTPClient.prototype._actionEHLO = function(command){
    var match;

    if(!command.success){
        // Try HELO instead
        this._currentAction = this._actionHELO;
        this.sendCommand("HELO "+this.options.name);
        return;
    }

    // Detect if the server supports PLAIN auth
    if(command.line.match(/AUTH(?:\s+[^\n]*\s+|\s+)PLAIN/i)){
        this._supportedAuth.push("PLAIN");
    }

    // Detect if the server supports LOGIN auth
    if(command.line.match(/AUTH(?:\s+[^\n]*\s+|\s+)LOGIN/i)){
        this._supportedAuth.push("LOGIN");
    }

    // Detect maximum allowed message size
    if((match = command.line.match(/SIZE (\d+)/i)) && Number(match[1])){
        this._maxAllowedSize = Number(match[1]);
    }

    this._authenticateUser.call(this);
};

SMTPClient.prototype._actionHELO = function(command){
    if(!command.success){
        this._onError(new Error("Invalid response for EHLO/HELO - " + command.line));
        return;
    }
    this._authenticateUser.call(this);
};

SMTPClient.prototype._actionAUTH_LOGIN_USER = function(command){
    if(command.statusCode != 334  || (command.data || []).join("\n") != "VXNlcm5hbWU6"){
        this._onError(new Error("Invalid login sequence while waiting for '334 VXNlcm5hbWU6' - " + command.line));
        return;
    }
    this._currentAction = this._actionAUTH_LOGIN_PASS;
    this.sendCommand(window.btoa(unescape(encodeURIComponent(this.options.auth.user))));
};

SMTPClient.prototype._actionAUTH_LOGIN_PASS = function(command){
    if(command.statusCode != 334  || (command.data || []).join("\n") != "UGFzc3dvcmQ6"){
        this._onError(new Error("Invalid login sequence while waiting for '334 UGFzc3dvcmQ6' - " + command.line));
        return;
    }
    this._currentAction = this._actionAUTHComplete;
    this.sendCommand(window.btoa(unescape(encodeURIComponent(this.options.auth.pass))));
};

SMTPClient.prototype._actionAUTHComplete = function(command){
    if(!command.success){
        this._onError(new Error("Invalid login - " + command.line));
        return;
    }

    this._currentAction = this._actionIdle;
    this.onidle(); // ready to take orders
};

SMTPClient.prototype._actionIdle = function(command){
    if(command.statusCode > 300){
        this._onError(new Error(command.line));
        return;
    }

    this._onError(new Error("Was not expecting - " + command.line));
};

SMTPClient.prototype._actionMAIL = function(command){
    if(!command.success){
        this._onError(new Error("Mail from command failed - " + command.line));
        return;
    }

    if(!this._envelope.rcptQueue.length){
        this._onError(new Error("Can't send mail - no recipients defined"));
    }else{
        this._envelope.curRecipient = this._envelope.rcptQueue.shift();
        this._currentAction = this._actionRCPT;
        this.sendCommand("RCPT TO:<"+this._envelope.curRecipient+">");
    }
};

SMTPClient.prototype._actionRCPT = function(command){
    if(!command.success){
        // this is a soft error
        this._envelope.rcptFailed.push(this._envelope.curRecipient);
    }

    console.log("\nFAILED:\n" + JSON.stringify(this._envelope.rcptFailed))

    if(!this._envelope.rcptQueue.length){
        if(this._envelope.rcptFailed.length < this._envelope.to.length){
            this._currentAction = this._actionDATA;
            this.sendCommand("DATA");
        }else{
            this._onError(new Error("Can't send mail - all recipients were rejected"));
            this._currentAction = this._actionIdle;
            return;
        }
    }else{
        this._envelope.curRecipient = this._envelope.rcptQueue.shift();
        this._currentAction = this._actionRCPT;
        this.sendCommand("RCPT TO:<"+this._envelope.curRecipient+">");
    }
};

SMTPClient.prototype._actionDATA = function(command){
    // response should be 354 but according to this issue https://github.com/eleith/emailjs/issues/24
    // some servers might use 250 instead
    if([250, 354].indexOf(command.statusCode) < 0){
        this._onError(new Error("Data command failed - " + command.line));
        return;
    }

    this._dataMode = true;
    this._currentAction = this._actionIdle;
    this.onwaiting();
};

SMTPClient.prototype._actionStream = function(command){
    if(!command.success){
        // Message failed
        this.ondone(false, command.line);
    }else{
        // Message sent succesfully
        this.ondone(true, command.line);
    }

    // Waiting for new connections
    this._currentAction = this._actionIdle;
    this.onidle();
};
