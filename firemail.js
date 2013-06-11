
// Bulk load all firemail components into one object

define([

    "./lib/mimeFunctions/mimeFunctions",
    "./lib/mimeFunctions/mimeTypes",
    "./lib/mimeFunctions/addressParser",
    "./lib/mailComposer/mailComposer",
    "./lib/smtpClient/smtpClient",
    "./lib/sendmail/sendmail"

    ], function(mimeFunctions, mimeTypes, addressParser, mailComposer, smtpClient, sendmail) {

        return {
            mimeFunctions: mimeFunctions,
            mimeTypes: mimeTypes,
            addressParser: addressParser,
            smtpClient: smtpClient,
            mailComposer: mailComposer,
            sendmail: sendmail
        };
    }
);