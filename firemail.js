
// Bulk load all firemail components into one object

define([

    "./lib/mimeFunctions/mimeFunctions",
    "./lib/mimeFunctions/mimeTypes",
    "./lib/mimeFunctions/addressParser",

    "./lib/smtpClient/smtpClient"
    ], function(mimeFunctions, mimeTypes, addressParser, smtpClient) {

        return {
            mimeFunctions: mimeFunctions,
            mimeTypes: mimeTypes,
            addressParser: addressParser,
            smtpClient: smtpClient
        };
    }
);