# E-mail components for FirefoxOS apps

firemail is not entirely FirefoxOS specific. SMTP client requires TCPSocket support which is currently only supported by FirefoxOS but other components probably run in every modern browser.

See [demo app](https://github.com/andris9/firemail/tree/master/example) for a complete example of sending a formatted mail with firemail.

![firemail](http://tahvel.info/firemail.png)


## tl;dr - send an email using firemail

### Install with volo

    volo add andris9/firemail

### Require firemail

    var firemail = require("firemail");


### Send some mail

    firemail.sendmail({
        stmp:{
            host: "smtp.gmail.com",
            useSSL: true,
            auth: {
                user: "yourgmail@user",
                pass: "password"
            }
        },
        from: "sender@example.com",
        to: "receiver@example.com",
        subject: "test message",
        text: "Hello world!"
    }, function(err, success){
        alert(err || success);
    });

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

Install the application to the FirefoxOS simulator (use the [manifest file](manifest.webapp) in the root directory)

**Step 3**

Open the application in the simulator. The launch page has a link to [nodeunit](https://github.com/caolan/nodeunit) unit tests.

## Index

**firemail** can be used as a AMD module. You can load the files separately or all in one bunch
by requireing [firemail.js](firemail.js). If you load the files with no AMD support, globals
will be used instead.

**firemail** exposes the following objects.

  * [smtpClient](docs/smtpClient.md)
  * [mimeFunctions](docs/mimeFunctions.md)
  * [mimeTypes](docs/mimeTypes.md)
  * [addressParser](docs/addressParser.md)
  * [mailComposer](docs/mailComposer.md)
  * [sendmail](docs/sendmail.md)

## License

**MIT**