
// Bulk load all firemail components into one object

define([

    "./lib/mimeFunctions/mimeFunctions",
    "./lib/mimeFunctions/mimeTypes",
    "./lib/mimeFunctions/addressParser",
    "./lib/mailComposer/mailComposer",
    "./lib/sendmail/sendmail",
    "./lib/smtpClient/smtpClient"
    ], function(mimeFunctions, mimeTypes, addressParser, mailComposer, sendmail, smtpClient) {

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