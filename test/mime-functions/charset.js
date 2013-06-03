this.CharsetTests = {

    'Encode UTF-8 to ArrayBuffer': function (test) {
        var str = "신",
            encoded = new Uint8Array([0xEC, 0x8B, 0xA0]);

        test.deepEqual(encoded, MIMEFunctions.charset.encode(str));
        test.done();
    },

    'Decode utf-8 arraybuffer': function (test) {
        var str = "신",
            encoded = new Uint8Array([0xEC, 0x8B, 0xA0]);

        test.deepEqual(str, MIMEFunctions.charset.decode(encoded));
        test.done();
    },

    'Decode non utf-8 arraybuffer': function (test) {
        var str = "신",
            encoding = "ks_c_5601-1987",
            encoded = new Uint8Array([0xBD, 0xC5]);

        test.deepEqual(str, MIMEFunctions.charset.decode(encoded,encoding));
        test.done();
    },

    'Convert non utf-8 to arraybuffer': function (test) {
        var converted = new Uint8Array([0xEC, 0x8B, 0xA0]),
            encoding = "ks_c_5601-1987",
            encoded = new Uint8Array([0xBD, 0xC5]);

        test.deepEqual(converted, MIMEFunctions.charset.convert(encoded, encoding));
        test.done();
    }

};