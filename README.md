# Send E-mails from FirefoxOS

**firemail** allows you to send e-mails from a FirefoxOS app with ease

See [example app](https://github.com/Kreata/firemail-example) for a complete example of sending a formatted mail with `firemail` from FirefoxOS.

Dependencies for `firemail`:

  * [mimefuncs](https://github.com/Kreata/mimefuncs) - Encode and decode quoted printable and base64 strings
  * [mimetypes](https://github.com/Kreata/mimetypes) - Convert extensions to Content-Type values and vice versa 
  * [addressparser](https://github.com/Kreata/addressparser) - Parse e-mail address lists
  * [mailcomposer](https://github.com/Kreata/mailcomposer) - Compose e-mails
  * [smtpclient](https://github.com/Kreata/smtpclient) - SMTP client for FirefoxOS

## tl;dr - send an email using firemail

### Volo

Install with [volo](http://volojs.org/):

    volo add Kreata/firemail/v0.1.1

### AMD

Require [firemail.js](lib/firemail.js) as `firemail`

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

## Documentation

  * [Firemail API](docs/firemail.md#api)

## Tests

Unit tests for firemail reside in the [example app](https://github.com/Kreata/firemail-example).

## License

**MIT**
