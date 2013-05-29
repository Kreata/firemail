
var MIMEFunctions = {
/*
    mimeEncode: function(str, fromCharset){
        toCharset = toCharset || "UTF-8";
        fromCharset = fromCharset || "UTF-8";

        var buffer = convert(str || "", toCharset, fromCharset),
            ranges = [[0x09],
                      [0x0A],
                      [0x0D],
                      [0x20],
                      [0x21],
                      [0x23, 0x3C],
                      [0x3E],
                      [0x40, 0x5E],
                      [0x60, 0x7E]],
            result = "";
        
        for(var i=0, len = buffer.length; i<len; i++){
            if(MIMEFunctions._checkRanges(buffer.get(i), ranges)){
                result += String.fromCharCode(buffer.get(i));
                continue;
            }
            result += "="+(buffer.get(i)<0x10?"0":"")+buffer.get(i).toString(16).toUpperCase();
        }

        return result;
    },

    mimeDecode: function(str, toCharset, fromCharset){
        str = (str || "").toString();
        toCharset = toCharset || "UTF-8";
        fromCharset = fromCharset || "UTF-8";

        var encodedBytesCount = (str.match(/\=[\da-fA-F]{2}/g) || []).length,
            bufferLength = str.length - encodedBytesCount * 2,
            chr, hex,
            buffer = new Buffer(bufferLength),
            bufferPos = 0;

        for(var i=0, len = str.length; i<len; i++){
            chr = str.charAt(i);
            if(chr == "=" && (hex = str.substr(i+1, 2)) && /[\da-fA-F]{2}/.test(hex)){
                buffer.set(bufferPos++, parseInt(hex, 16));
                i+=2;
                continue;
            }
            buffer.set(bufferPos++, chr.charCodeAt(0));
        }

        if(fromCharset.toUpperCase().trim() == "BINARY"){
            return buffer;
        }
        return convert(buffer, toCharset, fromCharset);
    },

    encodeBase64: function(str, toCharset, fromCharset){
        var buffer = convert(str || "", toCharset, fromCharset);
        return MIMEFunctions._addSoftLinebreaks(buffer.toString("base64"), "base64");
    },

    decodeBase64: function(str, toCharset, fromCharset){
        var buffer = new Buffer((str || "").toString(), "base64");
        return convert(buffer, toCharset, fromCharset);
    },

    decodeQuotedPrintable: function(str, toCharset, fromCharset){
        str = (str || "").toString();
        str = str.replace(/\=(?:\r?\n|$)/g, "");
        return MIMEFunctions.mimeDecode(str, toCharset, fromCharset);
    },

    encodeQuotedPrintable: function(str, toCharset, fromCharset){
        var mimeEncodedStr = MIMEFunctions.mimeEncode(str, toCharset, fromCharset);

        // fix line breaks
        mimeEncodedStr = mimeEncodedStr.replace(/\r?\n|\r/g, function(lineBreak, spaces){
            return "\r\n";
        }).replace(/[\t ]+$/gm, function(spaces){
            return spaces.replace(/ /g, "=20").replace(/\t/g, "=09");
        });

        return MIMEFunctions._addSoftLinebreaks(mimeEncodedStr, "qp");
    },

    encodeMimeWord: function(str, encoding, maxLength, toCharset, fromCharset){
        toCharset = (toCharset || "utf-8").toString().toUpperCase().trim();
        encoding = (encoding || "Q").toString().toUpperCase().trim().charAt(0);
        var encodedStr;

        if(maxLength && maxLength > 7 + toCharset.length){
            maxLength -= (7 + toCharset.length);
        }

        if(encoding == "Q"){
            encodedStr = MIMEFunctions.mimeEncode(str, toCharset, fromCharset);
            encodedStr = encodedStr.replace(/[\r\n\t_]/g, function(chr){
                var code = chr.charCodeAt(0);
                return "=" + (code<0x10?"0":"") + code.toString(16).toUpperCase();
            }).replace(/\s/g, "_");
        }else if(encoding == "B"){
            encodedStr = convert(str || "", toCharset, fromCharset).toString("base64").trim();
        }

        if(maxLength && encodedStr.length > maxLength){
            if(encoding == "Q"){
                encodedStr = MIMEFunctions.splitEncodedString(encodedStr, maxLength).join("?= =?"+toCharset+"?"+encoding+"?");
            }else{
                encodedStr = encodedStr.replace(new RegExp(".{"+maxLength+"}","g"),"$&?= =?"+toCharset+"?"+encoding+"?");
                if(encodedStr.substr(-(" =?"+toCharset+"?"+encoding+"?=").length) == " =?"+toCharset+"?"+encoding+"?="){
                    encodedStr = encodedStr.substr(0, encodedStr.length -(" =?"+toCharset+"?"+encoding+"?=").length);
                }
                if(encodedStr.substr(-(" =?"+toCharset+"?"+encoding+"?").length) == " =?"+toCharset+"?"+encoding+"?"){
                    encodedStr = encodedStr.substr(0, encodedStr.length -(" =?"+toCharset+"?"+encoding+"?").length);
                }
            }
        }

        return "=?"+toCharset+"?"+encoding+"?"+encodedStr+ (encodedStr.substr(-2)=="?="?"":"?=");
    },

    decodeMimeWord: function(str, toCharset){
        str = (str || "").toString().trim();

        var fromCharset, encoding, match;

        match = str.match(/^\=\?([\w_\-]+)\?([QqBb])\?([^\?]+)\?\=$/i);
        if(!match){
            return convert(str, toCharset);
        }

        fromCharset = match[1];
        encoding = (match[2] || "Q").toString().toUpperCase();
        str = (match[3] || "").replace(/_/g, " ");

        if(encoding == "B"){
            return MIMEFunctions.decodeBase64(str, toCharset, fromCharset);
        }else if(encoding == "Q"){
            return MIMEFunctions.mimeDecode(str, toCharset, fromCharset);    
        }else{
            return str;
        }

    },

    decodeMimeWords: function(str, toCharset){
        var remainder = "", lastCharset, curCharset;
        str = (str || "").toString();

        str = str.
                replace(/(=\?[^?]+\?[QqBb]\?[^?]+\?=)\s+(?==\?[^?]+\?[QqBb]\?[^?]+\?=)/g, "$1").
                replace(/\=\?([\w_\-]+)\?([QqBb])\?[^\?]+\?\=/g, (function(mimeWord, charset, encoding){

                      curCharset = charset + encoding;

                      return MIMEFunctions.decodeMimeWord(mimeWord);
                  }).bind(MIMEFunctions.);

        return convert(str, toCharset);
    },

    foldLine: function(str, lineLengthMax, afterSpace, lineMargin){
        lineLengthMax = lineLengthMax || 76;
        lineMargin = lineMargin || Math.floor(lineLengthMax/5);
        str = (str || "").toString().trim();

        var pos = 0, len = str.length, result = "", line, match;

        while(pos < len){
            line = str.substr(pos, lineLengthMax);
            if(line.length < lineLengthMax){
                result += line;
                break;
            }
            if((match = line.match(/^[^\n\r]*(\r?\n|\r)/))){
                line = match[0];
                result += line;
                pos += line.length;
                continue;
            }else if((match = line.substr(-lineMargin).match(/(\s+)[^\s]*$/))){
                line = line.substr(0, line.length - (match[0].length - (!!afterSpace ? (match[1] || "").length : 0)));
            }else if((match = str.substr(pos + line.length).match(/^[^\s]+(\s*)/))){
                line = line + match[0].substr(0, match[0].length - (!afterSpace ? (match[1] || "").length : 0));
            }
            result += line;
            pos += line.length;
            if(pos < len){
                result += "\r\n";
            }
        }

        return result;
    },

    encodeMimeWords: function(value, encoding, maxLength, toCharset, fromCharset){
        var decodedValue = convert((value || ""), "utf-8", fromCharset).toString("utf-8"),
            encodedValue;

        encodedValue = decodedValue.replace(/([^\s\u0080-\uFFFF]*[\u0080-\uFFFF]+[^\s\u0080-\uFFFF]*(?:\s+[^\s\u0080-\uFFFF]*[\u0080-\uFFFF]+[^\s\u0080-\uFFFF]*\s*)?)+/g, (function(str, o){
            return str.length?MIMEFunctions.encodeMimeWord(str, encoding || "Q", maxLength, toCharset):"";
        }).bind(MIMEFunctions.);

        return encodedValue;
    },

    encodeHeaderLine: function(key, value, toCharset, fromCharset){
        var encodedValue = MIMEFunctions.encodeMimeWords(value, 52, toCharset, fromCharset);
        return MIMEFunctions.foldLine(key+": "+encodedValue, 76);
    },

    parseHeaderLines: function(headers, toCharset){
        var lines = headers.split(/\r?\n|\r/),
            headersObj = {},
            key, value,
            header,
            i, len;

        for(i=lines.length-1; i>=0; i--){
            if(i && lines[i].match(/^\s/)){
                lines[i-1] += "\r\n" + lines[i];
                lines.splice(i, 1);
            }
        }

        for(i=0, len = lines.length; i<len; i++){
            header = MIMEFunctions.decodeHeaderLine(lines[i]);
            key = (header[0] || "").toString().toLowerCase().trim();
            value = header[1] || "";
            if(!toCharset || (toCharset || "").toString().trim().match(/^utf[\-_]?8$/i)){
                value = value.toString("utf-8");
            }
            if(!headersObj[key]){
                headersObj[key] = [value];
            }else{
                headersObj[key].push(value);
            }
        }

        return headersObj;
    },

    decodeHeaderLine: function(header, toCharset){
        var line = (header || "").toString().replace(/(?:\r?\n|\r)[ \t]*$/g, " ").trim(),
            match = line.match(/^\s*([^:]+):(.*)$/),
            key = (match && match[1] || "").trim(),
            value = (match && match[2] || "").trim();

        value = MIMEFunctions.decodeMimeWords(value, toCharset);
        return [key, value];
    },

    splitEncodedString: function(str, maxlen){
        var curLine, match, chr, done,
            lines = [];

        while(str.length){
            curLine = str.substr(0, maxlen);
            
            // move incomplete escaped char back to main
            if((match = curLine.match(/\=[0-9A-F]?$/i))){
                curLine = curLine.substr(0, match.index);
            }

            done = false;
            while(!done){
                done = true;
                // check if not middle of a unicode char sequence
                if((match = str.substr(curLine.length).match(/^\=([0-9A-F]{2})/i))){
                    chr = parseInt(match[1], 16);
                    // invalid sequence, move one char back anc recheck
                    if(chr < 0xC2 && chr > 0x7F){
                        curLine = curLine.substr(0, curLine.length-3);
                        done = false;
                    }
                }
            }

            if(curLine.length){
                lines.push(curLine);
            }
            str = str.substr(curLine.length);
        }

        return lines;
    },

    parseAddresses: MIMEAddressParser.parse
*/
};

/*



*/

/**
 * Adds soft line breaks (the ones that will be stripped out when decoding) to
 * ensure that no line in the message is never longer than 76 symbols
 *
 * Lines can't be longer than 76 + <CR><LF> = 78 bytes
 * http://tools.ietf.org/html/rfc2045#section-6.7
 *
 * @param {String} str Encoded string
 * @param {String} encoding Either "qp" or "base64" (the default)
 * @return {String} String with forced line breaks
 */
MIMEFunctions._addSoftLinebreaks = function(str, encoding){
    var lineLengthMax = 76;

    encoding = (encoding || "base64").toString().toLowerCase().trim();
    
    if(encoding == "qp"){
        return MIMEFunctions._addQPSoftLinebreaks(str, lineLengthMax);
    }else{
        return MIMEFunctions._addBase64SoftLinebreaks(str, lineLengthMax);
    }
}

/**
 * Adds soft line breaks (the ones that will be stripped out when decoding base64) to
 * ensure that no line in the message is never longer than lineLengthMax
 *
 * @param {String} base64EncodedStr String in BASE64 encoding
 * @param {Number} lineLengthMax Maximum length of a line
 * @return {String} String with forced line breaks
 */
MIMEFunctions._addBase64SoftLinebreaks = function(base64EncodedStr, lineLengthMax){
    base64EncodedStr = (base64EncodedStr || "").toString().trim();
    return base64EncodedStr.replace(new RegExp(".{" +lineLengthMax+ "}", "g"),"$&\r\n").trim();
}

/**
 * Adds soft line breaks (the ones that will be stripped out when decoding QP) to
 * ensure that no line in the message is never longer than lineLengthMax
 *
 * Not sure of how and why this works, but at least it seems to be working :/
 *
 * @param {String} qpEncodedStr String in Quoted-Printable encoding
 * @param {Number} lineLengthMax Maximum length of a line
 * @return {String} String with forced line breaks
 */
MIMEFunctions._addQPSoftLinebreaks = function(qpEncodedStr, lineLengthMax){
    qpEncodedStr = (qpEncodedStr || "").toString()

    var pos = 0, len = qpEncodedStr.length, 
        match, code, line, 
        lineMargin = Math.floor(lineLengthMax/3), 
        result = "";

    // insert soft linebreaks where needed
    while(pos < len){
        line = qpEncodedStr.substr(pos, lineLengthMax);
        if((match = line.match(/\r\n/))){
            line = line.substr(0, match.index + match[0].length);
            result += line;
            pos += line.length;
            continue;
        }

        if(line.substr(-1)=="\n"){
            // nothing to change here
            result += line;
            pos += line.length;
            continue;
        }else if((match = line.substr(-lineMargin).match(/\n.*?$/))){
            // truncate to nearest line break
            line = line.substr(0, line.length - (match[0].length - 1));
            result += line;
            pos += line.length;
            continue;
        }else if(line.length > lineLengthMax - lineMargin && (match = line.substr(-lineMargin).match(/[ \t\.,!\?][^ \t\.,!\?]*$/))){
            // truncate to nearest space
            line = line.substr(0, line.length - (match[0].length - 1));
        }else if(line.substr(-1)=="\r"){
            line = line.substr(0, line.length-1);
        }else{
            if(line.match(/\=[\da-f]{0,2}$/i)){

                // push incomplete encoding sequences to the next line
                if((match = line.match(/\=[\da-f]{0,1}$/i))){
                    line = line.substr(0, line.length - match[0].length);
                }

                // ensure that utf-8 sequences are not split
                while(line.length>3 && line.length < len - pos && !line.match(/^(?:=[\da-f]{2}){1,4}$/i) && (match = line.match(/\=[\da-f]{2}$/ig))){
                    code = parseInt(match[0].substr(1,2), 16);
                    if(code<128){
                        break;
                    }

                    line = line.substr(0, line.length-3);

                    if(code >=0xC0){
                        break;
                    }
                }
                
            }
        }
        
        if(pos + line.length < len && line.substr(-1)!="\n"){
            if(line.length==76 && line.match(/\=[\da-f]{2}$/i)){
                line = line.substr(0, line.length-3);
            }
            else if(line.length==76){
                line = line.substr(0, line.length-1);
            }
            pos += line.length;
            line += "=\r\n";
        }else{
            pos += line.length;
        }
        
        result += line;
    }

    return result;
}

/**
 * Checks if a number is in specified ranges or not
 *
 * @param {Number} nr Number to check for
 * @ranges {Array} ranges Array of range duples
 * @return {Boolean} Returns true, if nr was found to be at least one of the specified ranges
 */
MIMEFunctions._checkRanges = function(nr, ranges){
    for(var i = ranges.length - 1; i >= 0; i--){
        if(!ranges[i].length){
            continue;
        }
        if(ranges[i].length == 1 && nr == ranges[i][0]){
            return true;
        }
        if(ranges[i].length == 2 && nr >= ranges[i][0] && nr <= ranges[i][1]){
            return true;
        }
    }
    return false;
}

/**
 * Character set encoding and decoding functions
 */
MIMEFunctions.charset = {

    /**
     * Encodes an unicode string into an arraybuffer (Uint8Array) object as UTF-8
     *
     * TextEncoder only supports unicode encodings (utf-8, utf16le/be) but no other,
     * so we force UTF-8 here.
     *
     * @param {String} str String to be encoded
     * @return {Uint8Array} UTF-8 encoded arraybuffer
     */
    encode: function(str){
        return new TextEncoder("UTF-8").encode(str);
    },

    /**
     * Decodes a string from arraybuffer to an unicode string using specified encoding
     *
     * @param {Uint8Array} arraybuffer Binary data to be decoded
     * @param {String} encoding="UTF-8" Binary data is decoded into string using this charset
     * @return {String} Decded string
     */
    decode: function(arraybuffer, encoding){
        encoding = encoding || "UTF-8";
        return new TextDecoder(encoding).decode(arraybuffer);
    }
}

/**
 * Base64 encoding and decoding functions
 */
MIMEFunctions.base64 = {

    /**
     * Encodes input into base64
     *
     * @param {String|Uint8Array} data Data to be encoded into base64
     * @return {String} Base64 encoded string
     */
    encode: function(data){
        if(!data){
            return "";
        }

        if(typeof data == "string"){
            // window.btoa uses pseudo binary encoding, so unicode strings
            // need to be converted before encoding
            return window.btoa(unescape(encodeURIComponent(data)));
        }

        var len = data.byteLength,
            binStr="";
        
        for(var i = 0; i < len; i++){
            binStr += String.fromCharCode(data[i]);
        }
        return window.btoa(binStr);
    },

    /**
     * Decodes base64 encoded string into an unicode string or Uint8Array
     *
     * NB! Throws on invalid sequence. Spaces are allowed.
     *
     * @param {String} data Base64 encoded data
     * @param {String} [outputEncoding="arraybuffer"] Output encoding, either "string" or "arraybuffer" (Uint8Array)
     * @return {String|Uint8Array} Decoded string
     */
    decode: function(data, outputEncoding){

        // ensure no unwanted stuffing spaces
        data = (data || "").replace(/\s/g, "");

        outputEncoding = (outputEncoding || "arraybuffer").toLowerCase().trim();

        var binStr, len, buf;

        if(outputEncoding == "string"){
            // window.atob uses pseudo binary encoding, so unicode strings
            // need to be converted after decoding
            return decodeURIComponent(escape(window.atob(data)));
        }else{
            binStr = window.atob(data);
            len = binStr.length;
            buf = new Uint8Array(new ArrayBuffer(len));
            for(i = 0; i < len; i++) {
                buf[i] = binStr.charCodeAt(i);
            }
            return buf;
        }
    }
}

