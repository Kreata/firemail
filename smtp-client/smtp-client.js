// Copyright (c) 2013 Andris Reinman
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/**
 * Creates a connection object to a SMTP server and allows to send mail through it.
 * Call `connect` method to inititate the actual connection, the constructor only
 * defines the properties but does not actually connect.
 *
 * NB! The parameter order (host, port) differs from node.js "way" (port, host)
 *
 * @constructor
 *
 * @param {String} [host="localhost"] Hostname to conenct to
 * @param {Number} [port=25] Port number to connect to
 * @param {Object} [options] Optional options object
 * @param {Boolean} [options.useSSL] Set to true, to use encrypted connection
 * @param {String} [options.name] Client hostname for introducing itself to the server
 * @param {Object} [options.auth] Authentication options. Depends on the preferred authentication method. Usually {user, pass}
 * @param {String} [options.authMethod] Force specific authentication method
 * @param {Number} [options.logLength=6] How many messages between the client and the server to log. Set to false to disable logging
 */
function SMTPClient(host, port, options){

    this.options = options || {};

    this.port = port || (this.options.useSSL ? 465 : 25);
    this.host = host || "localhost";

    /**
     * If set to true, start an encrypted connection instead of the plaintext one
     * (recommended if applicable). If useSSL is not set but the port used is 465,
     * then ecryption is used by default.
     */
    this.options.useSSL = "useSSL" in this.options ? !!this.options.useSSL : this.port == 465;

    /**
     * Authentication object. If not set, authentication step will be skipped.
     */
    this.options.auth = this.options.auth || false;

    /**
     * Hostname of the client, this will be used for introducing to the server
     */
    this.options.name = this.options.name || "localhost";

    /**
     * Downstream TCP socket to the SMTP server, created with mozTCPSocket
     */
    this.socket = false;

    /**
     * Indicates if the connection has been closed and can't be used anymore
     *
     */
    this.destroyed = false;

    /**
     * Array of last messages sent and received
     *
     */
    this.log = [];

    /**
     * Informational value that indicates the maximum size (in bytes) for
     * a message sent to the current server. Detected from SIZE info.
     * Not available until connection has been established.
     */
    this.maxAllowedSize = 0;

    /**
     * Keeps track if the downstream socket is currently full and
     * a drain event should be waited for or not
     */
    this.waitDrain = false;

    // Private properties

    /**
     * Array of last messages sent and received. Defaults to 6
     *
     */
    this._logLength = "logLength" in this.options ? (this.options.logLength || 0) : 5;

    /**
     * SMTP response parser object. All data coming from the downstream server
     * is feeded to this parser
     */
    this._parser = new SMTPResponseParser();

    /**
     * If authenticated successfully, stores the username
     */
     this._authenticatedAs = null;

    /**
     * A list of authentication mechanisms detected from the EHLO response
     * and which are compatible with this library
     */
    this._supportedAuth = [];

    /**
     * If true, accepts data from the upstream to be passed
     * directly to the downstream socket. Used after the DATA command
     */
    this._dataMode = false;

    /**
     * Stores the function that should be run after a response has been received
     * from the server
     */
    this._currentAction = null;

    /**
     * If STARTTLS support lands in TCPSocket, _secureMode can be set to
     * true, once the connection is upgraded
     */
    this._secureMode = !!this.options.useSSL;
}

// EVENTS

// Event functions should be overriden, these are just placeholders

/**
 * Will be run when an error occurs. Connection to the server will be closed automatically,
 * so wait for an `onclose` event as well. See `log` array for the messages sent and
 * received before yielding in the error.
 *
 * @param {Error} err Error object
 */
SMTPClient.prototype.onerror = function(err){};

/**
 * More data can be buffered in the socket. See `waitDrain` property or
 * check if `send` method returns false to see if you should be waiting
 * for the drain event. Before sending anything else.
 */
SMTPClient.prototype.ondrain = function(){};

/**
 * The connection to the server has been closed
 */
SMTPClient.prototype.onclose = function(){};

/**
 * The connection is established and idle, you can send mail now
 */
SMTPClient.prototype.onidle = function(){};

/**
 * The connection is waiting for the mail body
 */
SMTPClient.prototype.onwaiting = function(){};

/**
 * The mail has been sent. See `log.slice(-1)` for the exact response message.
 * Wait for `onidle` next.
 *
 * @param {Boolean} success Indicates if the message was queued by the server or not
 */
SMTPClient.prototype.onsend = function(success){};

// PUBLIC METHODS

// Connection related methods

/**
 * Initiate a connection to the server
 */
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

/**
 * Pauses `data` events from the downstream SMTP server
 */
SMTPClient.prototype.suspend = function(){
    if(this.socket && this.socket.readyState === "open"){
        this.socket.suspend();
    }
}

/**
 * Resumes `data` events from the downstream SMTP server. Be careful of not
 * resuming something that is not suspended - an error is thrown in this case
 */
SMTPClient.prototype.resume = function(){
    if(this.socket && this.socket.readyState === "open"){
        this.socket.resume();
    }
}

/**
 * Sends QUIT
 */
SMTPClient.prototype.quit = function(){
    this._sendCommand("QUIT");
    this._currentAction = this.close;
};

/**
 * Reset authentication
 * 
 * @param {Object} [auth] Use this if you want to authenticate as another user
 */
SMTPClient.prototype.reset = function(auth){
    this.options.auth = auth || this.options.auth;
    this._sendCommand("RSET");
    this._currentAction = this._actionRSET;
};

/**
 * Closes the connection to the server
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

// Mail related methods

/**
 * Initiates a new message by submitting envelope data, starting with
 * `MAIL FROM:` command. Use after `onidle` event
 *
 * @param {Object} envelope Envelope object in the form of {from:"...", to:["..."]}
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
    this._sendCommand("MAIL FROM:<"+(this._envelope.from)+">");
};


/**
 * Send ASCII data to the server. Works only in data mode (after `onwaiting` event), ignored
 * otherwise
 *
 * @param {String} chunk ASCII string (quoted-printable, base64 etc.) to be sent to the server
 * @return {Boolean} If true, it is safe to send more data, if false, you *should* wait for the ondrain event before sending more
 */
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

    this._log("CLIENT", chunk, true);

    console.log("\nC: " + chunk.replace(/\r/g, "<CR>").replace(/\n/g, "<LF>\n"))

    // pass the chunk to the socket
    return (this.waitDrain = this.socket.send(chunk));
};

/**
 * Indicates that a data stream for the socket is ended. Works only in data 
 * mode (after `onwaiting` event), ignored otherwise. Use it when you are done
 * with sending the mail. This method does not close the socket. Once the mail
 * has been queued by the server, `onsend` and `onidle` are emitted.
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
        this.waitDrain = this.socket.send(".\r\n");
    }else if(this._lastDataBytes.substr(-1) == "\r"){
        this.waitDrain = this.socket.send("\n.\r\n");
    }else{
        this.waitDrain = this.socket.send("\r\n.\r\n");
    }

    // end data mode
    this._dataMode = false;

    return this.waitDrain;
};

// PRIVATE METHODS

// EVENT HANDLERS FOR THE SOCKET

/**
 * Connection listener that is run when the connection to the server is opened.
 * Sets up different event handlers for the opened socket
 *
 * @event
 * @param {Event} evt Event object. Not used
 */
SMTPClient.prototype._onOpen = function(evt){
    console.log("\nSOCKET OPEN!")

    this.socket.ondata = this._onData.bind(this);

    this.socket.onclose = this._onClose.bind(this);
    this.socket.ondrain = this._onDrain.bind(this);

    this._parser.ondata = this._onCommand.bind(this);

    this._currentAction = this._actionGreeting;
};

/**
 * Data listener for chunks of data emitted by the server
 *
 * @event
 * @param {Event} evt Event object. See `evt.data` for the chunk received
 */
SMTPClient.prototype._onData = function(evt){
    this._log("SERVER", evt.data);
    console.log("\nS: " + evt.data.replace(/\r/g, "<CR>").replace(/\n/g, "<LF>\n"));
    this._parser.send(evt.data);
};

/**
 * More data can be buffered in the socket, `waitDrain` is reset to false
 *
 * @event
 * @param {Event} evt Event object. Not used
 */
SMTPClient.prototype._onDrain = function(evt){
    this.waitDrain = false;
    this.ondrain();
};

/**
 * Error handler for the socket
 *
 * @event
 * @param {Event} evt Event object. See evt.data for the error
 */
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

/**
 * Indicates that the socket has been closed
 *
 * @event
 * @param {Event} evt Event object. Not used
 */
SMTPClient.prototype._onClose = function(evt){
    console.log("\nRECEIVED CLOSE EVENT")
    this._destroy();
};

/**
 * This is not a socket data handler but the handler for data emitted by the parser,
 * so this data is safe to use as it is always complete (server might send partial chunks)
 *
 * @event
 * @param {Object} command Parsed data
 */
SMTPClient.prototype._onCommand = function(command){
    console.log("\nS: " + JSON.stringify(command));
    this._currentAction.call(this, command);
}

/**
 * Ensures that the connection is closed and such
 */
SMTPClient.prototype._destroy = function(){
    if(!this.destroyed){
        this.destroyed = true;
        this.onclose();
    }
};

/**
 * Logs a message to the `log` array
 *
 * @param {String} sender Who is sending this message (CLIENT|SERVER)
 * @param {String} data Data that is being sent
 * @param {Boolean} binary If set to true, do not log the entire message but only the length of it in bytes
 */
SMTPClient.prototype._log = function(sender, data, binary){
    if(this._logLength){
        this.log.push({sender: sender, data: !binary ? data || "" :
            "<"+TextEncoder("utf-8").encode(data || "").length+" bytes of data>"});
        if(this.log.length > this._logLength){
            this.log = this.log.slice(-this._logLength);
        }
    }
}

/**
 * Send a string command to the server, also append \r\n if needed
 *
 * @param {String} str String to be sent to the server
 */
SMTPClient.prototype._sendCommand = function(str){
    this._log("CLIENT", str);
    console.log("\nC: " + str.replace(/\r/g, "<CR>").replace(/\n/g, "<LF>\n"));
    this.waitDrain = this.socket.send(str + (str.substr(-2) != "\r\n" ? "\r\n" : ""));
};

/**
 * Intitiate authentication sequence if needed
 */
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
            // LOGIN is a 3 step authentication process
            // C: AUTH LOGIN
            // C: BASE64(USER)
            // C: BASE64(PASS)
            this._currentAction = this._actionAUTH_LOGIN_USER;
            this._sendCommand("AUTH LOGIN");
            return;
        case "PLAIN":
            // AUTH PLAIN is a 1 step authentication process
            // C: AUTH PLAIN BASE64(\0 USER \0 PASS)
            this._currentAction = this._actionAUTHComplete;
            this._sendCommand(
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

// ACTIONS FOR RESPONSES FROM THE SMTP SERVER

/**
 * Initial response from the server, must have a status 220
 *
 * @param {Object} command Parsed command from the server {statusCode, data, line}
 */
SMTPClient.prototype._actionGreeting = function(command){
    if(command.statusCode != 220){
        this._onError(new Error("Invalid greeting from server - " + command.line));
        return;
    }

    this._currentAction = this._actionEHLO;
    this._sendCommand("EHLO "+this.options.name);
};

/**
 * Response to EHLO. If the response is an error, try HELO instead
 *
 * @param {Object} command Parsed command from the server {statusCode, data, line}
 */
SMTPClient.prototype._actionEHLO = function(command){
    var match;

    if(!command.success){
        // Try HELO instead
        this._currentAction = this._actionHELO;
        this._sendCommand("HELO "+this.options.name);
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

/**
 * Response to HELO
 *
 * @param {Object} command Parsed command from the server {statusCode, data, line}
 */
SMTPClient.prototype._actionHELO = function(command){
    if(!command.success){
        this._onError(new Error("Invalid response for EHLO/HELO - " + command.line));
        return;
    }
    this._authenticateUser.call(this);
};

/**
 * Response to AUTH LOGIN, if successful expects base64 encoded username
 *
 * @param {Object} command Parsed command from the server {statusCode, data, line}
 */
SMTPClient.prototype._actionAUTH_LOGIN_USER = function(command){
    if(command.statusCode != 334  || command.data != "VXNlcm5hbWU6"){
        this._onError(new Error("Invalid login sequence while waiting for '334 VXNlcm5hbWU6' - " + command.line));
        return;
    }
    this._currentAction = this._actionAUTH_LOGIN_PASS;
    this._sendCommand(window.btoa(unescape(encodeURIComponent(this.options.auth.user))));
};

/**
 * Response to AUTH LOGIN username, if successful expects base64 encoded password
 *
 * @param {Object} command Parsed command from the server {statusCode, data, line}
 */
SMTPClient.prototype._actionAUTH_LOGIN_PASS = function(command){
    if(command.statusCode != 334  || command.data != "UGFzc3dvcmQ6"){
        this._onError(new Error("Invalid login sequence while waiting for '334 UGFzc3dvcmQ6' - " + command.line));
        return;
    }
    this._currentAction = this._actionAUTHComplete;
    this._sendCommand(window.btoa(unescape(encodeURIComponent(this.options.auth.pass))));
};

/**
 * Checks if authentication succeeded or not. If successfully authenticated
 * emit `idle` to indicate that an e-mail can be sent using this connection
 *
 * @param {Object} command Parsed command from the server {statusCode, data, line}
 */
SMTPClient.prototype._actionAUTHComplete = function(command){
    if(!command.success){
        this._onError(new Error("Invalid login - " + command.line));
        return;
    }

    this._authenticatedAs = this.options.auth.user;

    this._currentAction = this._actionIdle;
    this.onidle(); // ready to take orders
};

/**
 * Used when the connection is idle and the server emits timeout
 *
 * @param {Object} command Parsed command from the server {statusCode, data, line}
 */
SMTPClient.prototype._actionIdle = function(command){
    if(command.statusCode > 300){
        this._onError(new Error(command.line));
        return;
    }

    this._onError(new Error("Was not expecting - " + command.line));
};

/**
 * Response to MAIL FROM command. Proceed to defining RCPT TO list if successful
 *
 * @param {Object} command Parsed command from the server {statusCode, data, line}
 */
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
        this._sendCommand("RCPT TO:<"+this._envelope.curRecipient+">");
    }
};

/**
 * Response to a RCPT TO command. If the command is unsuccessful, try the next one,
 * as this might be related only to the current recipient, not a global error, so
 * the following recipients might still be valid
 *
 * @param {Object} command Parsed command from the server {statusCode, data, line}
 */
SMTPClient.prototype._actionRCPT = function(command){
    if(!command.success){
        // this is a soft error
        this._envelope.rcptFailed.push(this._envelope.curRecipient);
    }

    console.log("\nFAILED:\n" + JSON.stringify(this._envelope.rcptFailed))

    if(!this._envelope.rcptQueue.length){
        if(this._envelope.rcptFailed.length < this._envelope.to.length){
            this._currentAction = this._actionDATA;
            this._sendCommand("DATA");
        }else{
            this._onError(new Error("Can't send mail - all recipients were rejected"));
            this._currentAction = this._actionIdle;
            return;
        }
    }else{
        this._envelope.curRecipient = this._envelope.rcptQueue.shift();
        this._currentAction = this._actionRCPT;
        this._sendCommand("RCPT TO:<"+this._envelope.curRecipient+">");
    }
};

/**
 * Response to the RSET command. If successful, clear the current authentication
 * information and reauthenticate.
 *
 * @param {Object} command Parsed command from the server {statusCode, data, line}
 */
SMTPClient.prototype._actionRSET = function(command){
    if(!command.success){
        this._onError(new Error("Reset command failed - " + command.line));
        return;
    }

    this._authenticatedAs = null;

    this._authenticateUser.call(this);
};

/**
 * Response to the DATA command. Server is now waiting for a message, so emit `onwaiting`
 *
 * @param {Object} command Parsed command from the server {statusCode, data, line}
 */
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

/**
 * Response from the server, once the message stream has ended with <CR><LF>.<CR><LF>
 * Emits `onsend`.
 *
 * @param {Object} command Parsed command from the server {statusCode, data, line}
 */
SMTPClient.prototype._actionStream = function(command){
    if(!command.success){
        // Message failed
        this.onsend(false);
    }else{
        // Message sent succesfully
        this.onsend(true);
    }

    // Waiting for new connections
    this._currentAction = this._actionIdle;
    this.onidle();
};