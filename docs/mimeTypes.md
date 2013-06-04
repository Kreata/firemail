[← Back to index](../README.md#index)

# MIME Types

`mimeTypes` allows you to detect file extensions for content types and vice-versa.

## Usage

Include files [mimeTypes.js](mimeFunctions/mimeTypes.js), [listMimeTypes.js](mimeFunctions/listMimeTypes.js) and [listExtensions.js](mimeFunctions/listExtensions.js) on the page.

```html
<script src="mimeTypes.js"></script>
<script src="listMimeTypes.js"></script>
<script src="listExtensions.js"></script>
```

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

