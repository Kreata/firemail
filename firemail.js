
// Bulk load all firemail components into one object

define([

    "./lib/mimefuncs",
    "./lib/mimetypes/mimetypes",
    "./lib/addressparser",
    "./lib/mailComposer/mailComposer",
    "./lib/smtpClient/smtpClient",
    "./lib/sendmail/sendmail"

    ], function(mimefuncs, mimetypes, addressparser, mailComposer, smtpClient, sendmail) {

        return {
            mimefuncs: mimefuncs,
            mimetypes: mimetypes,
            addressparser: addressparser,
            smtpClient: smtpClient,
            mailComposer: mailComposer,
            sendmail: sendmail
        };
    }
);