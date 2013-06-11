[← Back to index](../README.md#index)

# sendmail

**sendmail** allows you to send rich formatted e-mails using your defined SMTP settings

## Usage

### AMD

Either require [firemail.js](../firemail.js) and use `firemail.sendmail` or require [sendmail.js](../lib/sendmail/sendmail.js) as `sendmail`

## API

`sendmail` is a function

    sendmail(mailData, callback)

  * **mailData** - object defining SMTP settings and the mail data
  * **callback** `(err, success)` - callback function which is run if an error occurs or the mail has been sent

**mailData** can include the following properties. All fields accept unicode.

  * **smtp** - SMTP settings, see below
  * **from** - a formatted e-mail address (`"My Name <my@name.ee>"`)
  * **to** - comma separated list of (formatted) e-mail addresses
  * **cc** - comma separated list of (formatted) e-mail addresses
  * **bcc** - comma separated list of (formatted) e-mail addresses
  * **reply-to** - a formatted e-mail address (`"My Name <my@name.ee>"`)
  * **subject** - message subject
  * **in-reply-to** - message id that is being replied to
  * **references** - an array or space separated list of message ids that are being replied to
  * **text** - plaintext message
  * **html** - html message
  * **attachments** - an array of attachments, see below

**mailData.smtp** can include the following properties

  * **host** - hostname of the server (defaults to *'localhost'*)
  * **port** - port to connect to (defaults to *25*)
  * **useSSL** - boolean value, if set to true connect using SSL/TLS
  * **auth** - authentication info, an object in the form of `{user: "username", pass: "password"}`

**mailData.attachments** array can include attachments objects with the following properties

  * **contentDisposition** optional, defaults to `"attachment"`
  * **contentId** - optional, use with embedded images (`cid:` urls)
  * **contentType** - optional, if not set will be detected by `fileName`
  * **fileName** - optional file name
  * **content** - either a string or an arraybuffer (Uint8Array)

## Example

The following example loads `sendmail` module and sends an e-mail.

    require(["sendmail"], function(sendmail) {

        sendmail({
                from: "Sender Name <sender@example.com>",
                to: "Receiver Name <receiver@example.com>, another.receiver@example.com",
                subject: "Test message with uncide characters ✓",
                html: "<p>Hello world!</p>",

                smtp:{
                    host: "smtp.gmail.com",
                    useSSL: true,
                    auth: {
                        user: "my.gmail@gmail.com",
                        pass: "password"
                    }
                }
            }, function(err, success){
                    alert(err || success);
                });

    });