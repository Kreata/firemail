# E-mail components for FirefoxOS apps

**firemail** allows you to send e-mails from a FirefoxOS app with ease

**firemail** is not entirely FirefoxOS specific. SMTP client requires TCPSocket support which is supported by FirefoxOS, for converting strings TextEncoder is needed and this is supported by FirefoxOS and Firefox. Other components probably run in every modern browser.

See [example app](https://github.com/Kreata/firemail-example) for a complete example of sending a formatted mail with firemail.

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
            "description" : "SMTP access"
        }
    },
    ...
}
```

### Send some mail

    firemail({
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

See all options for the firemail function [here](docs/firemail.md#api).

## Tests

Unit tests for firemail reside in the [example app](https://github.com/Kreata/firemail-example).

## License

**MIT**
