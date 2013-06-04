this.mimeFunctionsTests = {

    'mimeEncode UTF-8': function (test) {
        var str = "tere ÕÄÖÕ",
            encodedStr = "tere =C3=95=C3=84=C3=96=C3=95";

        test.equal(mimeFunctions.mimeEncode(str), encodedStr);
        test.done();
    },

    'mimeEncode non UTF-8': function (test) {
        var buf = new Uint8Array([0xBD, 0xC5]),
            encoding = "ks_c_5601-1987",
            encodedStr = "=EC=8B=A0";

        test.equal(mimeFunctions.mimeEncode(buf, encoding), encodedStr);
        test.done();
    },

    'mimeDecode UTF-8': function (test) {
        var str = "tere ÕÄÖÕ",
            encodedStr = "tere =C3=95=C3=84=C3=96=C3=95";

        test.equal(mimeFunctions.mimeDecode(encodedStr), str);
        test.done();
    },

    'mimeDecode non UTF-8': function (test) {
        var str = "신",
            encoding = "ks_c_5601-1987",
            encodedStr = "=BD=C5";

        test.equal(mimeFunctions.mimeDecode(encodedStr, encoding), str);
        test.done();
    },

    'base64Encode UTF-8': function (test) {
        var str = "tere ÕÄÖÕ",
            encodedStr = "dGVyZSDDlcOEw5bDlQ==";

        test.equal(mimeFunctions.base64Encode(str), encodedStr);
        test.done();
    },

    'base64Encode non UTF-8': function (test) {
        var buf = new Uint8Array([0xBD, 0xC5]),
            encoding = "ks_c_5601-1987",
            encodedStr = "7Iug";

        test.equal(mimeFunctions.base64Encode(buf, encoding), encodedStr);
        test.done();
    },

    'base64Decode UTF-8': function (test) {
        var str = "tere ÕÄÖÕ",
            encodedStr = "dGVyZSDDlcOEw5bDlQ==";

        test.equal(mimeFunctions.base64Decode(encodedStr), str);
        test.done();
    },

    'base64Decode non UTF-8': function (test) {
        var str = "신",
            encoding = "ks_c_5601-1987",
            encodedStr = "vcU=";

        test.equal(mimeFunctions.base64Decode(encodedStr, encoding), str);
        test.done();
    },

    'quotedPrintableEncode UTF-8': function (test) {
        var str = "tere ÕÄ \t\nÕÄ \t\nÖÕ",
            encodedStr = "tere =C3=95=C3=84=20=09\r\n=C3=95=C3=84=20=09\r\n=C3=96=C3=95";

        test.equal(mimeFunctions.quotedPrintableEncode(str), encodedStr);
        test.done();
    },

    'quotedPrintableDecode UTF-8': function (test) {
        var str = "tere ÕÄ \t\r\nÕÄ \t\r\nÖÕ",
            encodedStr = "tere =C3=95=C3=84=20=09\r\n=C3=95=\r\n=C3=84=\r\n=20=09\r\n=C3=96=C3=95=";

        test.equal(mimeFunctions.quotedPrintableDecode(encodedStr), str);
        test.done();
    },

    'quotedPrintableEncode add soft line breaks': function (test) {
        var str = "õäöüõäöüõäöüõäöüõäöüõäöüõäöõ",
            encodedStr = "=C3=B5=C3=A4=C3=B6=C3=BC=C3=B5=C3=A4=C3=B6=C3=BC=C3=B5=C3=A4=C3=B6=C3=BC=\r\n"+
                         "=C3=B5=C3=A4=C3=B6=C3=BC=C3=B5=C3=A4=C3=B6=C3=BC=C3=B5=C3=A4=C3=B6=C3=BC=\r\n"+
                         "=C3=B5=C3=A4=C3=B6=C3=B5";

        test.equal(mimeFunctions.quotedPrintableEncode(str), encodedStr);
        test.done();
    },

    "Encode short string": function(test){
        test.equal("Tere =C3=95=C3=84=C3=96=C3=9C!", mimeFunctions.quotedPrintableEncode(new Uint8Array([0x54,0x65,0x72,0x65,0x20,0xD5,0xC4,0xD6,0xDC,0x21]), "Latin_1"));
        test.equal("Tere =C3=95=C3=84=C3=96=C3=9C=C5=A0=C5=BD!", mimeFunctions.quotedPrintableEncode("Tere ÕÄÖÜŠŽ!"));
        test.equal("Tere =C5=A0=C5=BD!", mimeFunctions.quotedPrintableEncode(new Uint8Array([0x54,0x65,0x72,0x65,0x20,0xD0,0xDE,0x21]), "Win-1257"));
        test.done();
    },

    "Don't wrap between encoded chars": function(test){
        var wrapped = "a__________________________",
            wrappedEncoded = "a=5F=5F=5F=5F=5F=5F=5F=5F=5F=5F=5F=5F=5F=5F=5F=5F=5F=5F=5F=5F=5F=5F=5F=5F=\r\n=5F=5F";
        test.equal(wrappedEncoded, mimeFunctions.quotedPrintableEncode(wrapped));
        test.done();
    },

    "Encode long string": function(test){
        var longLine = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"+
                       "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"+
                       "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"+
                       "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            longLineEncoded = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLM=\r\n"+
                              "NOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ=\r\n"+
                              "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklm=\r\n"+
                              "nopqrstuvwxyz0123456789";

        test.equal(longLineEncoded, mimeFunctions.quotedPrintableEncode(longLine));
        test.done();
    },

    "Quote at line edge": function(test){
        var str = 'Title: <a href="http://www.elezea.com/2012/09/iphone-5-local-maximum/">The future of e-commerce is storytelling</a> <br>',
            strEncoded = "Title: <a href=3D=22http://www.elezea.com/2012/09/iphone-5-local-maximum/=\r\n=22>The future of e-commerce is storytelling</a> =\r\n<br>";
        test.equal(strEncoded, mimeFunctions.quotedPrintableEncode(str));
        test.done();
    },

    "Wordwrap long string with UTF-8 sequence on edge": function(test){
        var longLine = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"+
                       "ABCDEFGHIÄÄÄPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"+
                       "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"+
                       "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            longLineEncoded = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHI=\r\n"+
                              "=C3=84=C3=84=C3=84PQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJ=\r\n"+
                              "KLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVW=\r\n"+
                              "XYZabcdefghijklmnopqrstuvwxyz0123456789";
        test.equal(longLineEncoded, mimeFunctions.quotedPrintableEncode(longLine));
        test.done();
    },

    "Decode string": function(test){
        var longLine = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"+
                       "ABCDEFGHIÄÄÄPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"+
                       "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"+
                       "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            longLineEncoded = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHI=\r\n"+
                              "=C3=84=C3=84=C3=84PQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJ=\r\n"+
                              "KLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVW=\r\n"+
                              "XYZabcdefghijklmnopqrstuvwxyz0123456789";

        test.equal(longLine, mimeFunctions.quotedPrintableDecode(longLineEncoded));
        test.done();
    },

    "Decode string with soft linebreaks": function(test){
        var input = "Tere =\r\nvana kere=",
            output = "Tere vana kere";

        test.equal(output, mimeFunctions.quotedPrintableDecode(input));
        test.done();
    },

    "Surrogate pair": function(test){
        // 💩 pile of poo
        test.equal("=F0=9F=92=A9", mimeFunctions.quotedPrintableEncode('\ud83d\udca9'));
        test.equal("\ud83d\udca9", mimeFunctions.quotedPrintableDecode('=F0=9F=92=A9'));
        test.done();
    },

    "Encode Mime Word QP": function(test){
        test.equal("=?UTF-8?Q?J=C3=B5ge-va=C5=BD?=",
            mimeFunctions.mimeWordEncode(new Uint8Array([0x4A,0xF5,0x67,0x65,0x2D,0x76,0x61,0xDE]), "Q", "iso-8859-13"));
        test.done();
    },

    "Split on maxLength QP": function(test){
        var inputStr = "Jõgeva Jõgeva Jõgeva mugeva Jõgeva Jõgeva Jõgeva Jõgeva Jõgeva",
            outputStr = "=?UTF-8?Q?J=C3=B5geva_?= =?UTF-8?Q?J=C3=B5geva_?= =?UTF-8?Q?J=C3=B5geva?= mugeva "+
                    "=?UTF-8?Q?J=C3=B5geva_?= =?UTF-8?Q?J=C3=B5geva_?= =?UTF-8?Q?J=C3=B5geva_?= "+
                    "=?UTF-8?Q?J=C3=B5geva_?= =?UTF-8?Q?J=C3=B5geva?=",
            encoded = mimeFunctions.mimeWordsEncode(inputStr, "Q", 16);

        test.equal(outputStr, encoded);
        test.equal(inputStr, mimeFunctions.mimeWordsDecode(encoded));
        test.done();
    },

    "Split on maxLength Base64": function(test){
        var inputStr = "Jõgeva Jõgeva Jõgeva mugeva Jõgeva Jõgeva Jõgeva Jõgeva Jõgeva",
            outputStr = "=?UTF-8?B?SsO1Zw==?= =?UTF-8?B?ZXZh?= =?UTF-8?B?IErDtQ==?= =?UTF-8?B?Z2V2?= "+
                    "=?UTF-8?B?YSBK?= =?UTF-8?B?w7VnZQ==?= =?UTF-8?B?dmE=?= mugeva =?UTF-8?B?SsO1Zw==?= "+
                    "=?UTF-8?B?ZXZh?= =?UTF-8?B?IErDtQ==?= =?UTF-8?B?Z2V2?= =?UTF-8?B?YSBK?= "+
                    "=?UTF-8?B?w7VnZQ==?= =?UTF-8?B?dmEg?= =?UTF-8?B?SsO1Zw==?= =?UTF-8?B?ZXZh?= "+
                    "=?UTF-8?B?IErDtQ==?= =?UTF-8?B?Z2V2?= =?UTF-8?B?YQ==?=",
            encoded = mimeFunctions.mimeWordsEncode(inputStr,"B", 19);

        test.equal(outputStr, encoded);
        test.equal(inputStr, mimeFunctions.mimeWordsDecode(encoded));
        test.done();
    },

    "Fold long header line": function(test){
        var inputStr = "Subject: Testin command line kirja õkva kakva mõni tõnis kõllas põllas tõllas rõllas jušla kušla tušla musla",
            outputStr = "Subject: Testin command line kirja =?UTF-8?Q?=C3=B5kva?= kakva\r\n"+
                        " =?UTF-8?Q?m=C3=B5ni_t=C3=B5nis_k=C3=B5llas_p=C3=B5?=\r\n"+
                        " =?UTF-8?Q?llas_t=C3=B5llas_r=C3=B5llas_ju=C5=A1la_?=\r\n"+
                        " =?UTF-8?Q?ku=C5=A1la_tu=C5=A1la?= musla",
            encodedHeaderLine = mimeFunctions.mimeWordsEncode(inputStr, "Q", 52);

        test.equal(outputStr, mimeFunctions.foldLines(encodedHeaderLine, 76));
        test.done();
    },

    "Fold flowed text": function(test){
        var inputStr = "Testin command line kirja õkva kakva mõni tõnis kõllas põllas tõllas rõllas jušla kušla tušla musla Testin command line kirja õkva kakva mõni tõnis kõllas põllas tõllas rõllas jušla kušla tušla musla",
            outputStr = "Testin command line kirja õkva kakva mõni tõnis kõllas põllas tõllas rõllas \r\n"+
                        "jušla kušla tušla musla Testin command line kirja õkva kakva mõni tõnis \r\n"+
                        "kõllas põllas tõllas rõllas jušla kušla tušla musla";

        test.equal(outputStr, mimeFunctions.foldLines(inputStr, 76, true));
        test.done();
    },

    "Ascii range": function(test){
        var input1 = "метель\" вьюга",
            input2 = "метель'вьюга",
            output1 = "=?UTF-8?Q?=D0=BC=D0=B5=D1=82=D0=B5=D0=BB=D1=8C=22_?= =?UTF-8?Q?=D0=B2=D1=8C=D1=8E=D0=B3=D0=B0?=",
            output2 = "=?UTF-8?Q?=D0=BC=D0=B5=D1=82=D0=B5=D0=BB=D1=8C'?= =?UTF-8?Q?=D0=B2=D1=8C=D1=8E=D0=B3=D0=B0?=";

        test.equal(mimeFunctions.mimeWordsEncode(input1, "Q", 52), output1);
        test.equal(mimeFunctions.mimeWordsDecode(output1), input1);

        test.equal(mimeFunctions.mimeWordsEncode(input2, "Q", 52), output2);
        test.equal(mimeFunctions.mimeWordsDecode(output2), input2);

        test.done();
    },

    "mimeWordsDecode example": function(test){
        test.equal("Hello: See on õhin test", mimeFunctions.mimeWordsDecode("Hello: =?UTF-8?q?See_on_=C3=B5hin_test?="));
        test.equal("=?UTF-8?Q?See_on_=C3=B5hin_test?=", mimeFunctions.mimeWordEncode("See on õhin test"));
        test.equal("See on õhin test", mimeFunctions.mimeWordDecode("=?UTF-8?q?See_on_=C3=B5hin_test?="));
        test.done();
    },

    "Decode Mime Word QP": function(test){
        test.equal("Jõge-vaŽ", mimeFunctions.mimeWordDecode("=?ISO-8859-13?Q?J=F5ge-va=DE?="));
        test.done();
    },

    "Decode Mime Words": function(test){
        test.equal("Jõge-vaŽ zz Jõge-vaŽJõge-vaŽJõge-vaŽ", mimeFunctions.mimeWordsDecode("=?ISO-8859-13?Q?J=F5ge-va=DE?= zz =?ISO-8859-13?Q?J=F5ge-va=DE?= =?ISO-8859-13?Q?J=F5ge-va=DE?= =?ISO-8859-13?Q?J=F5ge-va=DE?="));
        test.equal("Sssś Lałalalala", mimeFunctions.mimeWordsDecode("=?UTF-8?B?U3NzxZsgTGHFgmFsYQ==?= =?UTF-8?B?bGFsYQ==?="));
        test.done();
    },

    "Encode and fold header line": function(test){
        var key = "Subject",
            value =  "Testin command line kirja õkva kakva mõni tõnis kõllas põllas tõllas rõllas jušla kušla tušla musla",
            outputStr = "Subject: Testin command line kirja =?UTF-8?Q?=C3=B5kva?= kakva\r\n"+
                        " =?UTF-8?Q?m=C3=B5ni_t=C3=B5nis_k=C3=B5llas_p=C3=B5?=\r\n"+
                        " =?UTF-8?Q?llas_t=C3=B5llas_r=C3=B5llas_ju=C5=A1la_?=\r\n"+
                        " =?UTF-8?Q?ku=C5=A1la_tu=C5=A1la?= musla",
            encodedHeaderLine = mimeFunctions.headerLineEncode(key, value);

        test.equal(outputStr, encodedHeaderLine);
        test.done();
    },

    "Parse headers": function(test){
        var headersObj = {
                "subject": "Tere =?UTF-8?Q?J=C3=B5geva?=",
                "x-app": ["My =?UTF-8?Q?=C5=A1=C5=A1=C5=A1=C5=A1?= app line 1", "My =?UTF-8?Q?=C5=A1=C5=A1=C5=A1=C5=A1?= app line 2"],
                "long-line": "tere =?UTF-8?Q?=C3=B5klva?= karu =?UTF-8?Q?m=C3=B5kva_=C5=A1apaka=C5=A1?= tutikas suur maja, =?UTF-8?Q?k=C3=B5rge?= hoone, segane jutt"
            },
            headersStr = "Subject: Tere =?UTF-8?Q?J=C3=B5geva?=\r\n"+
                         "X-APP: My =?UTF-8?Q?=C5=A1=C5=A1=C5=A1=C5=A1?= app line 1\r\n"+
                         "X-APP: My =?UTF-8?Q?=C5=A1=C5=A1=C5=A1=C5=A1?= app line 2\r\n"+
                         "Long-Line: tere =?UTF-8?Q?=C3=B5klva?= karu\r\n"+
                         " =?UTF-8?Q?m=C3=B5kva_=C5=A1apaka=C5=A1?= tutikas suur maja,\r\n"+
                         " =?UTF-8?Q?k=C3=B5rge?= hoone, segane jutt";

        test.deepEqual(headersObj, mimeFunctions.headerLinesDecode(headersStr));
        test.done();
    }
};