# E-mail modules for FirefoxOS

*SMTP client currently only, but that's something as well*

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

## License

**MIT**