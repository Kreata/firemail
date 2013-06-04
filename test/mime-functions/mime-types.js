this.MIMETypesTests = {

    'Exact match for an extension': function (test) {
        var extension = "doc",
            contentType = "application/msword";

        test.equal(MIMETypes.detectMimeType(extension), contentType);
        test.done();
    },

    'Exact match for a content type': function (test) {
        var extension = "doc",
            contentType = "application/msword";

        test.equal(MIMETypes.detectExtension(contentType), extension);
        test.done();
    },

    'Best match for an extension': function (test) {
        var extension = "js",
            contentType = "application/javascript";

        test.equal(MIMETypes.detectMimeType(extension), contentType);
        test.done();
    },

    'Best match for a content type': function (test) {
        var extension = "jpeg",
            contentType = "image/jpeg";

        test.equal(MIMETypes.detectExtension(contentType), extension);
        test.done();
    }
};