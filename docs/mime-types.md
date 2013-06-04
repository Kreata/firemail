[← Back to index](../README.md#index)

# MIME Types

`MIMETypes` allows you to detect file extensions for content types and vice-versa.

## Usage

Include files [mime-types.js](mime-functions/mime-types.js), [list-mime-types.js](mime-functions/list-mime-types.js) and [list-extensions.js](mime-functions/list-extensions.js) on the page.

```html
<script src="mime-types.js"></script>
<script src="list-mime-types.js"></script>
<script src="list-extensions.js"></script>
```

## Methods

### detectExtension

 Returns file extension for a content type string. If no suitable extensions are found, 'bin' is used as the default extension.

    MIMETypes.detectExtension(mimeType) -> String

  * **mimeType** - Content type to be checked for

For example:

    MIMETypes.detectExtension("image/jpeg")

results in

    "jpeg"


### detectMimeType

Returns content type for a file extension. If no suitable content types are found, 'application/octet-stream' is used as the default content type

    MIMETypes.detectMimeType(extension) -> String

  * **extension** Extension to be checked for

For example:

    MIMETypes.detectExtension("jpeg")

results in

    "image/jpeg"

