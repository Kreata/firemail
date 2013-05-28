# E-mail modules for FirefoxOS

*SMTP client currently only, but at least that's something as well*

## Running the tests

**Step 1**

Install and run the testserver (running on port 1025, so make sure this port is available) with `npm`:

```bash
cd test/smtp-server
npm install
npm start
```

NB! Since self signed certificates are not allowed, only unsecure connections are tested against this test server. For secure connection tests external server (smtp.gmail.com) is used.

**Step 2**

Install the application to the FirefoxOS simulator (use the manifest file in the root directory)

**Step 3**

Open the application in the simulator. The launch page is a [nodeunit](https://github.com/caolan/nodeunit) testrunner.

## SMTPClient

### Quirks

  * `STARTTLS` is currently not supported
  * Only `PLAIN` and `USER` authentication mechanisms are supported

### Usage

Include files [smtp-response-parser.js](smtp-client/smtp-response-parser.js) and [smtp-client.js](smtp-client/smtp-client.js) on the page.

```html
<script src="smtp-response-parser.js"></script>
<script src="smtp-client.js"></script>
```

Create SMTPClient object with: 

```javascript
var client = new SMTPClient(host, port, options)
```

where

  * **host** is the hostname to connect to (defaults to "localhost")
  * **port** is the port to connect to
  * **options** is an optional options object (see below)

### Connection options

The following connection options can be used with `simplesmtp.connect`:

  * **useSSL** *Boolean* Set to true, to use encrypted connection
  * **name** *String* Client hostname for introducing itself to the server
  * **auth** *Object* Authentication options. Depends on the preferred authentication method. Usually `{user, pass}`
  * **authMethod** *String* Force specific authentication method (eg. `"PLAIN"` for using `AUTH PLAIN`)
  * **disableEscaping** *Boolean* If set to true, do not escape dots on the beginning of the lines
  * **logLength** *Number* How many messages between the client and the server to log. Set to false to disable logging. Defaults to 6

### Connection events

Once a connection is set up the following events can be listened to:

  * **onidle** - the connection to the SMTP server has been successfully set up and the client is waiting for an envelope. **NB!** this event is emitted multiple times - if an e-mail has been sent and the client has nothing to do, `onidle` is emitted again.
  * **onready** `(failedRecipients)` - the envelope is passed successfully to the server and a message stream can be started. The argument is an array of e-mail addresses not accepted as recipients by the server. If none of the recipient addresses is accepted, `onerror` is emitted instead.
  * **ondone** `(success)` - the message was sent
  * **onerror** `(err)` - An error occurred. The connection will be closed shortly afterwards, so expect an `onclose` event as well
  * **onend** - connection to the client is closed

Example:

```javascript
client.onidle = function(){
    console.log("Connection has been established");
    // this event will be called again once a message has been sent
    // so do not just initiate a new message here, as infinite loops might occur
}
```

### Sending an envelope

When an `onidle` event is emitted, an envelope object can be sent to the server.
This includes a string `from` and a single string or an array of strings for `to` property.

Envelope can be sent with `client.useEnvelope(envelope)`

```javascript
// run only once as 'idle' is emitted again after message delivery
var alreadySending = false;

client.onidle = function(){
    if(alreadySending){
        return;
    }
    alreadySending = true;
    client.useEnvelope({
        from: "me@example.com",
        to: ["receiver1@example.com", "receiver2@example.com"]
    });
}
```

The `to` part of the envelope must include **all** recipients from `To:`, `Cc:` and `Bcc:` fields.

If envelope setup up fails, an error is emitted. If only some (not all)
recipients are not accepted, the mail can still be sent. An `onready` event
is emitted when the server has accepted the `from` and at least one `to`
address.

```javascript
client.onready = function(failedRecipients){
    if(failedRecipients.length){
        console.log("The following addresses were rejected: ", failedRecipients);
    }
    // start transfering the e-mail
}
```

### Sending a message

When `onready` event is emitted, it is possible to start sending mail. To do this
you can send the message with `client.send` calls (you also need to call `client.end()` once 
the message is completed). 

**NB!** you do need to escape the dots by yourself (unless you specificly define so with `disableEscaping` option).

```javascript
client.onready = function(){
    client.send("Subject: test\r\n");
    client.send("\r\n");
    client.send("Message body");
    client.end();
}
```

Once the message is delivered an `ondone` event is emitted. The event has an
parameter which indicates if the message was accepted by the server (`true`) or not (`false`).

```
client.ondone = function(success){
    if(success){
        console.log("The message was transmitted successfully with "+response);
    }
}
```

### Logging

At any time you can access the traffic log between the client and the server from the `client.log` array.

```javascript
client.ondone = function(success){
    // show the last message
    console.log(client.log.slice(-1));
}
```

## License

**MIT**