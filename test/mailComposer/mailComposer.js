this.mailComposerTests = {
    'Create mailComposer object': function(test) {
        var mc = mailComposer();
        test.ok(true, mc instanceof mailComposer);
        test.done();
    },

    'bodyTree: plaintext': function(test){
        var mc = mailComposer();
        mc.setTextBody("test");
        test.deepEqual(mc._buildBodyTree(), {"contentType":"text/plain","content":"text"});
        test.done();
    },

    'bodyTree: html': function(test){
        var mc = mailComposer();
        mc.setHTMLBody("html");
        test.deepEqual(mc._buildBodyTree(), {"contentType":"text/html","content":"html"});
        test.done();
    },

    'bodyTree: plaintext and html': function(test){
        var mc = mailComposer();
        mc.setHTMLBody("html");
        mc.setTextBody("test");
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/alternative","multipart":true,"childNodes":[{"contentType":"text/plain","content":"text"},{"contentType":"text/html","content":"html"}]});
        test.done();
    },

    'bodyTree: plaintext and attachment': function(test){
        var mc = mailComposer();
        mc.setTextBody("test");
        mc.addAttachment({content: "test"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/mixed","multipart":true,"childNodes":[{"contentType":"text/plain","content":"text"},{"attachment":{"content":"test"}}]});
        test.done();
    },

    'bodyTree: plaintext and several attachments': function(test){
        var mc = mailComposer();
        mc.setTextBody("test");
        mc.addAttachment({content: "test1"});
        mc.addAttachment({content: "test2"});
        mc.addAttachment({content: "test3"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/mixed","multipart":true,"childNodes":[{"contentType":"text/plain","content":"text"},{"attachment":{"content":"test1"}},{"attachment":{"content":"test2"}},{"attachment":{"content":"test3"}}]});
        test.done();
    },

    'bodyTree: plaintext and cid attachment': function(test){
        var mc = mailComposer();
        mc.setTextBody("test");
        mc.addAttachment({content: "test", contentId: "test"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/mixed","multipart":true,"childNodes":[{"contentType":"text/plain","content":"text"},{"attachment":{"content":"test", "contentId": "test"}}]});
        test.done();
    },

    'bodyTree: plaintext and attachment and cid attachment': function(test){
        var mc = mailComposer();
        mc.setTextBody("test");
        mc.addAttachment({content: "test"});
        mc.addAttachment({content: "test", contentId: "test"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/mixed","multipart":true,"childNodes":[{"contentType":"text/plain","content":"text"},{"attachment":{"content":"test"}},{"attachment":{"content":"test", "contentId": "test"}}]});
        test.done();
    },

    'bodyTree: html and attachment': function(test){
        var mc = mailComposer();
        mc.setHTMLBody("test");
        mc.addAttachment({content: "test"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/mixed","multipart":true,"childNodes":[{"contentType":"text/html","content":"html"},{"attachment":{"content":"test"}}]});
        test.done();
    },

    'bodyTree: html and cid attachment': function(test){
        var mc = mailComposer();
        mc.setHTMLBody("test");
        mc.addAttachment({content: "test", contentId: "test"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/related","multipart":true,"childNodes":[{"contentType":"text/html","content":"html"},{"attachment":{"content":"test","contentId":"test"}}]});
        test.done();
    },

    'bodyTree: html and attachment and cid attachment': function(test){
        var mc = mailComposer();
        mc.setHTMLBody("test");
        mc.addAttachment({content: "test"});
        mc.addAttachment({content: "test", contentId: "test"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/mixed","multipart":true,"childNodes":[{"contentType":"multipart/related","multipart":true,"childNodes":[{"contentType":"text/html","content":"html"},{"attachment":{"content":"test","contentId":"test"}}]},{"attachment":{"content":"test"}}]});
        test.done();
    },

    'bodyTree: plaintext and html and attachment': function(test){
        var mc = mailComposer();
        mc.setTextBody("test");
        mc.setHTMLBody("test");
        mc.addAttachment({content: "test"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/mixed","multipart":true,"childNodes":[{"contentType":"multipart/alternative","multipart":true,"childNodes":[{"contentType":"text/plain","content":"text"},{"contentType":"text/html","content":"html"}]},{"attachment":{"content":"test"}}]});
        test.done();
    },

    'bodyTree: plaintext and html and cid attachment': function(test){
        var mc = mailComposer();
        mc.setTextBody("test");
        mc.setHTMLBody("test");
        mc.addAttachment({content: "test", contentId: "test"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/alternative","multipart":true,"childNodes":[{"contentType":"text/plain","content":"text"},{"contentType":"multipart/related","multipart":true,"childNodes":[{"contentType":"text/html","content":"html"},{"attachment":{"content":"test","contentId":"test"}}]}]});
        test.done();
    },

    'bodyTree: plaintext and html and attachment and cid attachment': function(test){
        var mc = mailComposer();
        mc.setTextBody("test");
        mc.setHTMLBody("test");
        mc.addAttachment({content: "test"});
        mc.addAttachment({content: "test", contentId: "test"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/mixed","multipart":true,"childNodes":[{"contentType":"multipart/alternative","multipart":true,"childNodes":[{"contentType":"text/plain","content":"text"},{"contentType":"multipart/related","multipart":true,"childNodes":[{"contentType":"text/html","content":"html"},{"attachment":{"content":"test","contentId":"test"}}]}]},{"attachment":{"content":"test"}}]});
        test.done();
    }


}