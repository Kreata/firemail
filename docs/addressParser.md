[← Back to index](../README.md#index)

# Address parser

`addressParser` allows you to parse mime formatted e-mail address lists. NB! this module does not decode any mime-word or punycode encoded strings, it is only a basic parser for parsing the base data, you need to decode the encoded parts later by yourself.

## Usage

### AMD

Either require [firemail.js](../firemail.js) and use `firemail.addressParser` or require [addressParser.js](../lib/mimeFunctions/addressParser.js) as `addressParser`

### Global context

Include file [addressParser.js](../lib/mimeFunctions/addressParser.js) on the page.

```html
<script src="addressParser.js"></script>
```

This exposes global variable `addressParser`

## Methods

### parse

 Parses a list of mime formatted e-mail addresses. Returned array includes objects in the form of `{name, address}`

    addressParser.parse(addressStr) -> String

  * **addressStr** - Address field

For example:

    addressParser.parse(('"Bach, Sebastian" <sebu@example.com>, mozart@example.com (Mozzie)');

results in

    [{name: "Bach, Sebastian", address: "sebu@example.com"},
     {name: "Mozzie", address: "mozart@example.com"}]

