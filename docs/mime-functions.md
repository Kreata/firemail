[← Back to index](../README.md#index)

# MIME Functions

MIME functions allow you to encode and decode between different MIME related
encodings. Quoted-Prinatble, BASE64 etc. Additionally it allows you to
parse header lines and formatted e-mail address strings.

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

    Content-Type: multipart/alternative; boundary="----zzzz----"

will become

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
    
  - `str` (String): String to be decoded

For example

    MIMEFunctions.mimeWordDecode("=?UTF-8?Q?See_on_=C3=B5hin_test?=");

will become

    See on õhin test

### quotedPrintableEncode

Encodes a string into Quoted-printable format (see also `quotedPrintableDecode`)

    MIMEFunctions.quotedPrintableEncode(str [, fromCharset]) -> String
    
  * **str** String or an arraybuffer to mime encode
  * **fromCharset** If the first parameter is an arraybuffer, use this encoding to decode the value to unicode

### decodeQuotedPrintable

Decodes a string from Quoted-printable format  (see also `quotedPrintableEncode`)

    MIMEFunctions.quotedPrintableDecode(str [, fromCharset]) -> String
    
  * **str** Mime encoded string
  * **fromCharset** Use this charset to decode mime encoded string to unicode
  
...