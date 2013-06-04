[← Back to index](../README.md#index)

# MIME Types

`mimeTypes` allows you to detect file extensions for content types and vice-versa.

## Usage

### AMD

Either require [firemail.js](../firemail.js) and use `firemail.mimeTypes` or require [mimeTypes.js](../lib/mimeFunctions/mimeTypes.js) as `mimeTypes`

### Global context

Include files [mimeTypeList.js](../lib/mimeFunctions/mimeTypeList.js), [extensionList.js](../lib/mimeFunctions/extensionList.js) and [mimeTypes.js](../lib/mimeFunctions/mimeTypes.js) on the page.

```html
<script src="mimeTypes.js"></script>
<script src="mimeTypeList.js"></script>
<script src="extensionList.js"></script>
```

This exposes global variable `mimeTypes`

## Methods

### detectExtension

 Returns file extension for a content type string. If no suitable extensions are found, 'bin' is used as the default extension.

    mimeTypes.detectExtension(mimeType) -> String

  * **mimeType** - Content type to be checked for

For example:

    mimeTypes.detectExtension("image/jpeg")

results in

    "jpeg"


### detectMimeType

Returns content type for a file extension. If no suitable content types are found, 'application/octet-stream' is used as the default content type

    mimeTypes.detectMimeType(extension) -> String

  * **extension** Extension to be checked for

For example:

    mimeTypes.detectExtension("jpeg")

results in

    "image/jpeg"

