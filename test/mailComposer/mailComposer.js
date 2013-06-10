this.mailComposerTests = {
    'Create mailComposer object': function(test) {
        var mc = mailComposer();
        test.ok(true, mc instanceof mailComposer);
        test.done();
    },

    'bodyTree: plaintext': function(test){
        var mc = mailComposer();
        mc.setText("test");
        test.deepEqual(mc._buildBodyTree(), {"contentType":"text/plain","content":"text"});
        test.done();
    },

    'bodyTree: html': function(test){
        var mc = mailComposer();
        mc.setHtml("html");
        test.deepEqual(mc._buildBodyTree(), {"contentType":"text/html","content":"html"});
        test.done();
    },

    'bodyTree: attachment': function(test){
        var mc = mailComposer();
        mc.addAttachment({content: "test"});
        test.deepEqual(mc._buildBodyTree(), {"attachment":{"content":"test"}});
        test.done();
    },

    'bodyTree: plaintext and html': function(test){
        var mc = mailComposer();
        mc.setHtml("html");
        mc.setText("test");
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/alternative","multipart":true,"childNodes":[{"contentType":"text/plain","content":"text"},{"contentType":"text/html","content":"html"}]});
        test.done();
    },

    'bodyTree: plaintext and attachment': function(test){
        var mc = mailComposer();
        mc.setText("test");
        mc.addAttachment({content: "test"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/mixed","multipart":true,"childNodes":[{"contentType":"text/plain","content":"text"},{"attachment":{"content":"test"}}]});
        test.done();
    },

    'bodyTree: plaintext and several attachments': function(test){
        var mc = mailComposer();
        mc.setText("test");
        mc.addAttachment({content: "test1"});
        mc.addAttachment({content: "test2"});
        mc.addAttachment({content: "test3"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/mixed","multipart":true,"childNodes":[{"contentType":"text/plain","content":"text"},{"attachment":{"content":"test1"}},{"attachment":{"content":"test2"}},{"attachment":{"content":"test3"}}]});
        test.done();
    },

    'bodyTree: plaintext and cid attachment': function(test){
        var mc = mailComposer();
        mc.setText("test");
        mc.addAttachment({content: "test", contentId: "test"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/mixed","multipart":true,"childNodes":[{"contentType":"text/plain","content":"text"},{"attachment":{"content":"test", "contentId": "test"}}]});
        test.done();
    },

    'bodyTree: plaintext and attachment and cid attachment': function(test){
        var mc = mailComposer();
        mc.setText("test");
        mc.addAttachment({content: "test"});
        mc.addAttachment({content: "test", contentId: "test"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/mixed","multipart":true,"childNodes":[{"contentType":"text/plain","content":"text"},{"attachment":{"content":"test"}},{"attachment":{"content":"test", "contentId": "test"}}]});
        test.done();
    },

    'bodyTree: html and attachment': function(test){
        var mc = mailComposer();
        mc.setHtml("test");
        mc.addAttachment({content: "test"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/mixed","multipart":true,"childNodes":[{"contentType":"text/html","content":"html"},{"attachment":{"content":"test"}}]});
        test.done();
    },

    'bodyTree: html and cid attachment': function(test){
        var mc = mailComposer();
        mc.setHtml("test");
        mc.addAttachment({content: "test", contentId: "test"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/related","multipart":true,"childNodes":[{"contentType":"text/html","content":"html"},{"attachment":{"content":"test","contentId":"test"}}]});
        test.done();
    },

    'bodyTree: html and attachment and cid attachment': function(test){
        var mc = mailComposer();
        mc.setHtml("test");
        mc.addAttachment({content: "test"});
        mc.addAttachment({content: "test", contentId: "test"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/mixed","multipart":true,"childNodes":[{"contentType":"multipart/related","multipart":true,"childNodes":[{"contentType":"text/html","content":"html"},{"attachment":{"content":"test","contentId":"test"}}]},{"attachment":{"content":"test"}}]});
        test.done();
    },

    'bodyTree: plaintext and html and attachment': function(test){
        var mc = mailComposer();
        mc.setText("test");
        mc.setHtml("test");
        mc.addAttachment({content: "test"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/mixed","multipart":true,"childNodes":[{"contentType":"multipart/alternative","multipart":true,"childNodes":[{"contentType":"text/plain","content":"text"},{"contentType":"text/html","content":"html"}]},{"attachment":{"content":"test"}}]});
        test.done();
    },

    'bodyTree: plaintext and html and cid attachment': function(test){
        var mc = mailComposer();
        mc.setText("test");
        mc.setHtml("test");
        mc.addAttachment({content: "test", contentId: "test"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/alternative","multipart":true,"childNodes":[{"contentType":"text/plain","content":"text"},{"contentType":"multipart/related","multipart":true,"childNodes":[{"contentType":"text/html","content":"html"},{"attachment":{"content":"test","contentId":"test"}}]}]});
        test.done();
    },

    'bodyTree: plaintext and html and attachment and cid attachment': function(test){
        var mc = mailComposer();
        mc.setText("test");
        mc.setHtml("test");
        mc.addAttachment({content: "test"});
        mc.addAttachment({content: "test", contentId: "test"});
        test.deepEqual(mc._buildBodyTree(), {"contentType":"multipart/mixed","multipart":true,"childNodes":[{"contentType":"multipart/alternative","multipart":true,"childNodes":[{"contentType":"text/plain","content":"text"},{"contentType":"multipart/related","multipart":true,"childNodes":[{"contentType":"text/html","content":"html"},{"attachment":{"content":"test","contentId":"test"}}]}]},{"attachment":{"content":"test"}}]});
        test.done();
    },

    flattenBodyTree: function(test){
        var mc = mailComposer();
        mc.setText("test");
        mc.setHtml("test");
        mc.addAttachment({content: "test"});
        mc.addAttachment({content: "test", contentId: "test"});
        test.deepEqual(mc._flattenBodyTree(), [{"boundary":0,"contentType":"multipart/mixed","multipart":true,"boundaryOpen":1},{"boundary":1,"contentType":"multipart/alternative","multipart":true,"boundaryOpen":2},{"boundary":2,"contentType":"text/plain","content":"text"},{"boundary":2,"contentType":"multipart/related","multipart":true,"boundaryOpen":3},{"boundary":3,"contentType":"text/html","content":"html"},{"boundary":3,"attachment":{"content":"test","contentId":"test"}},{"boundaryClose":3},{"boundaryClose":2},{"boundary":1,"attachment":{"content":"test"}},{"boundaryClose":1}]);
        test.done();
    },

    'pause and resume': function(test){
        var mc = mailComposer(),
            paused = true;
        mc.setText("test");
        mc.setHtml("test");
        mc.addAttachment({content: "test"});
        mc.addAttachment({content: "test", contentId: "test"});

        mc.ondata = function(chunk){
            test.ok(!paused);
            mc.suspend();
            paused = true;
            setTimeout(function(){
                paused = false;
                mc.resume();
            }, 20);
        };

        mc.onend = function(){
            test.done();
        };

        mc.suspend();
        mc.stream();

        setTimeout(function(){
            paused = false;
            mc.resume();
        }, 20);
    },

    'generateHeader': function(test){
        var mc = mailComposer();
        mc.setHeader("test1", "abc");
        mc.setHeader("test2", "def");
        mc.setHeader("test3", "def");
        mc.setHeader("test3", ["ghi", "jkl"]);
        test.deepEqual(mc._generateHeader(), "Test3: jkl\r\n"+
                                             "Test3: ghi\r\n"+
                                             "Test2: def\r\n"+
                                             "Test1: abc\r\n"+
                                             "MIME-Version: 1.0");
        test.done();
    },

    'encodeHeaderValue': function(test){
        var mc = mailComposer();
        test.equal('"Mati =?UTF-8?Q?J=C3=B5gi?=" <=?UTF-8?Q?mati.j=C3=B5gi?=@xn--matijgi-50a.ee>, "Andris Reinman" <andris@node.ee>, andmekala@hot.ee', mc.encodeHeaderValue("from", ["Mati Jõgi <mati.jõgi@matijõgi.ee>, Andris Reinman <andris@node.ee>", "andmekala@hot.ee"]));
        test.equal('=?UTF-8?Q?=C3=84ksi_n=C3=B5id_?=teeb tegusid', mc.encodeHeaderValue("subject", "Äksi nõid teeb tegusid"));
        test.equal('<sssssss>', mc.encodeHeaderValue("in-reply-to", "sssssss"));
        test.equal('<sssssss>', mc.encodeHeaderValue("in-reply-to", "<sssssss>"));
        test.equal('<sfdsfds> <sfsfdsfdfs> <wwww> <rrr> <ooo> <qqq> <ddd>', mc.encodeHeaderValue("references", ["sfdsfds", "sfsfdsfdfs", "<wwww>", "<rrr> <ooo>", "qqq ddd"]));
        test.equal('"=?UTF-8?Q?=C3=95nne_M=C3=A4ger?=" <onne.mager@xn--nnemger-8wa2m.ee>', mc.encodeHeaderValue("To", ["Õnne Mäger <onne.mager@õnnemäger.ee>"]));
        test.done();
    }

};