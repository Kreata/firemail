# E-mail components for FirefoxOS apps

**firemail** allows you to send e-mails from a FirefoxOS app with ease. **firemail** has no external dependencies and it only uses standard APIs offered by FirefoxOS.

firemail is not entirely FirefoxOS specific. SMTP client requires TCPSocket support which is supported by FirefoxOS, for converting strings TextEncoder is needed and this is supported by FirefoxOS and Firefox. Other components probably run in every modern browser.

See [demo app](https://github.com/andris9/firemail/tree/master/example) for a complete example of sending a formatted mail with firemail.

![firemail](http://tahvel.info/firemail2.png)

## tl;dr - send an email using firemail

### Install with volo

    volo add andris9/firemail

### Require firemail

    var firemail = require("firemail");

### Ensure privileges

Opening TCP sockets to a SMTP server requires special privileges. You need to set the type of your application to "privileged" and add "tcp-socket" to the permissions list in the application manifest.

```
{
    "type" : "privileged",
    "permissions": {
        "tcp-socket": {
            "description" : "Testime socketit"
        }
    },
    ...
}
```

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
        text: "Hello world!",
        html: "<b>Hello world!</b>"
    }, function(err, success){
        alert(err || success);
    });

See all options for the sendmail method [here](docs/sendmail.md#api).

## Running the tests

**Step 1**

Install and run the testserver (running on port 1025, so make sure this port is available) with `npm`:

```bash
git clone git@github.com:andris9/firemail.git
cd firemail
volo install
cd test/smtpServer
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
  * [mimefuncs](https://github.com/Kreata/mimefuncs)
  * [mimetypes](https://github.com/Kreata/mimetypes)
  * [addressparser](https://github.com/Kreata/addressparser)
  * [mailComposer](docs/mailComposer.md)
  * [sendmail](docs/sendmail.md)

Additionally `mailParser` object is exposed as well but this is in early alpha stage and the development has kind of stalled as other issues have arised that take my free time. If you are still interested in parsing e-mails, see [the testfile](test/mailParser/mailParser.js) for `mailParser`.

## License

**MIT**