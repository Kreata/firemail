this.MIMEFunctionsTests = {

    'mimeEncode UTF-8': function (test) {
        var str = "tere ÕÄÖÕ",
            encodedStr = "tere =C3=95=C3=84=C3=96=C3=95";

        test.equal(MIMEFunctions.mimeEncode(str), encodedStr);
        test.done();
    },

    'mimeEncode non UTF-8': function (test) {
        var buf = new Uint8Array([0xBD, 0xC5]),
            encoding = "ks_c_5601-1987",
            encodedStr = "=EC=8B=A0";

        test.equal(MIMEFunctions.mimeEncode(buf, encoding), encodedStr);
        test.done();
    },

    'mimeDecode UTF-8': function (test) {
        var str = "tere ÕÄÖÕ",
            encodedStr = "tere =C3=95=C3=84=C3=96=C3=95";
            
        test.equal(MIMEFunctions.mimeDecode(encodedStr), str);
        test.done();
    },

    'mimeDecode non UTF-8': function (test) {
        var str = "신",
            encoding = "ks_c_5601-1987",
            encodedStr = "=BD=C5";
            
        test.equal(MIMEFunctions.mimeDecode(encodedStr, encoding), str);
        test.done();
    }
}