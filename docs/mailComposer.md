[← Back to index](../README.md#index)

# Mail Composer

`mailComposer` allows you to generate and stream multipart mime messages.

**NB!!** Not ready yet. Generating messages works but not completely. Header fields (including
subject ect.) are not mime encoded if not ascii.

## Usage

### AMD

Either require [firemail.js](../firemail.js) and use `firemail.mailComposer` or require [mailComposer.js](../lib/mailComposer/mailComposer.js) as `mailComposer`

## API

Create `mailComposer` object with:

```javascript
var composer = mailComposer();
```

## Methods

### setHeader

Sets a header value for the specified key. If previous value with the same key exists, it is overwritten.
If you want to set multiple values for the same key, use an array as the value.

    mailComposer.setHeader(key, value)

  * **key** - String to be folded
  * **value** - Either a string value or an array of string values for the key

For example:

    mailComposer.setHeader("x-mailer", "my awesome mailer")

### setText

Set the plaintext body of the message. Unicode strings are allowed.

    mailComposer.setText(text)

  * **text** - plaintext body

For example:

    mailComposer.setText("Hello world!\r\nYours faithfully\r\nSender");

### setHtml

Set the HTML body of the message. Unicode strings are allowed.

    mailComposer.setHtml(html)

  * **html** - HTML body

For example:

    mailComposer.setHtml("<p>Hello world!</p> <p>Yours faithfully<br/>Sender</p>");

### addAttachment

Adds an attachment to the message. Can be called several times.
For embedded images, use `contentId` property
     
    mailComposer.addAttachment(attachment)

  * **attachment** - Attachment object

Attachment object has the following options:

  * **attachment.contentDisposition** optional, defaults to `"attachment"`
  * **attachment.contentId** - optional, use with embedded images (`cid:` urls)
  * **attachment.contentType** - optional, if not set will be detected by `fileName`
  * **attachment.fileName** - optional file name
  * **attachment.content** - either a string or an arraybuffer (Uint8Array)

For example:

    mailComposer.addAttachment({
        contentDisposition: "attachment",
        contentId: "mytest@firemail",
        contentType: "text/plain",
        fileName: "test.txt",
        content: "hello world!"
    });

### suspend

Suspends emitting any more ondata events until resumed.

    mailComposer.suspend()

### resume

Resumes suspended ondata events.

    mailComposer.resume()

## Data events

Once a message has been set up and streaming starts, the following events are emitted:

  * **ondata** `(chunk)`  - Emits an 7bit ASCII string (actually still unicode, but only 7bit symbols are used) for pipeing to SMTP
  * **onend** - the entire message has been consumed