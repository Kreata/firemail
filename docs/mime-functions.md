[← Back to index](../README.md#index)

# MIME Functions

`MIMEFunctions` allows you to encode and decode between different MIME related
encodings. Quoted-Printable, Base64 etc. Additionally it allows you to
parse header lines and formatted e-mail address strings.

All input can use any charset (in this case, the value must not be a string but an arraybuffer of Uint8Array) but output is always unicode.

## Usage

Include files [address-parser.js](mime-functions/address-parser.js) and [mime-functions.js](mime-functions/mime-functions.js) on the page.

```html
<script src="address-parser.js"></script>
<script src="mime-functions.js"></script>
```

## Methods

### foldLines

Folds a long line according to the RFC 5322 <http://tools.ietf.org/html/rfc5322#section-2.1.1>

    MIMEFunctions.foldLines(str [, lineLengthMax[, afterSpace]]) -> String

  * **str** - String to be folded
  * **lineLengthMax** - Maximum length of a line (defaults to 76)
  * **afterSpace** - If true, leave a space in th end of a line

For example:

    MIMEFunctions.foldLines("Content-Type: multipart/alternative; boundary=\"----zzzz----\"")

results in

    Content-Type: multipart/alternative;
         boundary="----zzzz----"

### mimeWordEncode

Encodes a string into mime encoded word format <http://en.wikipedia.org/wiki/MIME#Encoded-Word>  (see also `mimeWordDecode`)

    MIMEFunctions.mimeWordEncode(str [, mimeWordEncoding[, maxLength[, fromCharset]]]) -> String

  * **str** - String or ArrayBuffer (Uint8Array) to be encoded
  * **mimeWordEncoding** - Encoding for the mime word, either Q or B (default is "Q")
  * **maxLength** - If set, split mime words into several chunks if needed
  * **fromCharset** - If the first parameter is an arraybuffer, use this encoding to decode the value to unicode

For example:

    MIMEFunctions.mimeWordEncode("See on õhin test", "Q");

Becomes with UTF-8 and Quoted-printable encoding

    =?UTF-8?Q?See_on_=C3=B5hin_test?=

### mimeWordDecode

Decodes a string from mime encoded word format (see also `mimeWordEncode`)

    MIMEFunctions.mimeWordDecode(str) -> String

  * **str** - String to be decoded

For example

    MIMEFunctions.mimeWordDecode("=?UTF-8?Q?See_on_=C3=B5hin_test?=");

will become

    See on õhin test

### quotedPrintableEncode

Encodes a string into Quoted-printable format (see also `quotedPrintableDecode`). Maximum line
length for the generated string is 76 + 2 bytes.

    MIMEFunctions.quotedPrintableEncode(str [, fromCharset]) -> String

  * **str** - String or an arraybuffer to mime encode
  * **fromCharset** - If the first parameter is an arraybuffer, use this charset to decode the value to unicode before encoding

### quotedPrintableDecode

Decodes a string from Quoted-printable format  (see also `quotedPrintableEncode`).

    MIMEFunctions.quotedPrintableDecode(str [, fromCharset]) -> String

  * **str** - Mime encoded string
  * **fromCharset** - Use this charset to decode mime encoded string to unicode

### base64Encode

Encodes a string into Base64 format (see also `base64Decode`). Maximum line
length for the generated string is 76 + 2 bytes.

    MIMEFunctions.base64Encode(str [, fromCharset]) -> String

  * **str** - String or an arraybuffer to base64 encode
  * **fromCharset** - If the first parameter is an arraybuffer, use this charset to decode the value to unicode before encoding

### base64Decode

Decodes a string from Base64 format  (see also `base64Encode`).

    MIMEFunctions.base64Decode(str [, fromCharset]) -> String

  * **str** Base64 encoded string
  * **fromCharset** Use this charset to decode base64 encoded string to unicode

### mimeWordEncode

Encodes a string to a mime word.

    MIMEFunctions.mimeWordEncode(str[, mimeWordEncoding[, maxLength[, fromCharset]]]) -> String

  * **str** - String or arraybuffer to be encoded
  * **mimeWordEncoding** - Encoding for the mime word, either Q or B (default is "Q")
  * **maxLength** - If set, split mime words into several chunks if needed
  * **fromCharset** - If the first parameter is an arraybuffer, use this charset to decode the value to unicode before encoding

### mimeWordsEncode

Encodes non ascii sequences in a string to mime words.

    MIMEFunctions.mimeWordsEncode(str[, mimeWordEncoding[, maxLength[, fromCharset]]]) -> String

  * **str** - String or arraybuffer to be encoded
  * **mimeWordEncoding** - Encoding for the mime word, either Q or B (default is "Q")
  * **maxLength** - If set, split mime words into several chunks if needed
  * **fromCharset** - If the first parameter is an arraybuffer, use this charset to decode the value to unicode before encoding

### mimeWordDecode

Decodes a complete mime word encoded string

    MIMEFunctions.mimeWordDecode(str) -> String

  * **str** - String to be decoded. Mime words have charset information included so need to specify it here

### mimeWordsDecode

Decodes a string that might include one or several mime words. If no mime words are found from the string, the original string is returned

    MIMEFunctions.mimeWordsDecode(str) -> String

  * **str** - String to be decoded

### headerLineEncode

Encodes and folds a header line for a MIME message header. Shorthand for `mimeWordsEncode` + `foldLines`.

    MIMEFunctions.headerLineEncode(key, value[, fromCharset])

  * **key** - Key name, will not be encoded
  * **value** - Value to be encoded
  * **fromCharset** - If the `value` parameter is an arraybuffer, use this charset to decode the value to unicode before encoding

### headerLineDecode

Unfolds a header line and splits it to key and value pair. The return value is in the form of `{key: "subject", value: "test"}`. The value is not mime word decoded, you need to do your own decoding based on the rules for the specific header key.

    MIMEFunctions.headerLineDecode(headerLine) -> Object

  * **headerLine** - Single header line, might include linebreaks as well if folded

### headerLinesDecode

Parses a block of header lines. Does not decode mime words as every header
might have its own rules (eg. formatted email addresses and such).

Return value is an object of headers, where header keys are object keys. NB! Several values with the same key make up an array of values for the same key.

    MIMEFunctions.headerLinesDecode(headers) -> Object

  * **headers** Headers string

  