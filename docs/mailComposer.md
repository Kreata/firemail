[← Back to index](../README.md#index)

# Mail Composer

`mailComposer` allows you to generate and stream multipart mime messages.

**NB!!** no tests, not ready yet. Generating messages works but not completely.

## Usage

### AMD

Either require [firemail.js](../firemail.js) and use `firemail.mailComposer` or require [mailComposer.js](../lib/mailComposer/mailComposer.js) as `mailComposer`

## API

Create `mailComposer` object with:

```javascript
var composer = mailComposer();
```

## Data events

Once a message has been set up and streaming starts, the following events are emitted:

  * **ondata** `(chunk)`  - Emits an 7bit ASCII string (actually still unicode, but only 7bit symbols are used) for pipeing to SMTP
  * **onend** - the entire message has been consumed