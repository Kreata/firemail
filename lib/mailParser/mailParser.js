// Copyright (c) 2013 Andris Reinman
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// AMD shim
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['../mimeFunctions/mimeFunctions', '../mimeFunctions/mimeTypes'], factory);
    } else {
        root.mailParser = factory(root.mimeFunctions, root.mimeTypes);
    }
}(this, function(mimeFunctions, mimeTypes) {

    "use strict";

    function MailParser(){
        this._remainder = "";

        this.tree = {root: true};
        this.node = this._createNode(this.tree);
        this.lines = [];
    }

    MailParser.prototype._createNode = function(parent){
        if(!parent.childNodes){
            parent.childNodes = [];
        }

        var node = {
            parent: parent,
            headerLines: [],
            headers: {},
            body: "",
            isHeader: true
        };

        parent.childNodes.push(node);

        return node;
    };

    MailParser.prototype.write = function(chunk){
        if(!chunk.length){
            return true;
        }

        if(typeof chunk == "object"){
            // assume arraybuffer, convert to "binary" string
            chunk = String.fromCharCode.apply(String, new Uint8Array(chunk));
        }

        // allow lines to be split by \r, \n and \r\n
        var lines = (this._remainder + chunk).match(/(^|[^\r\n])*(?:\r?\n|\r)|[^\r\n]+$/g);

        if(lines.length && lines[lines.length - 1].slice(-1) != "\n"){
            this._remainder = lines.pop();
        }else{
            this._remainder = "";
        }

        if(lines.length){
            this.lines = this.lines.concat(lines);
        }

        return this._analyzeLines();
    };

    MailParser.prototype.end = function(chunk){
        chunk = chunk || "";

        // allow lines to be split by \r, \n and \r\n
        var lines = (this._remainder + chunk).match(/(^|[^\r\n])*(?:\r?\n|\r)|[^\r\n]+$/g);

        if(this.lines.length){
            this.lines = this.lines.concat(lines);
        }

        this._analyzeLines();

        if(!this.node.isHeader && this.node.lastLine){
            this._parseBodyLine();
        }
    };


    MailParser.prototype._analyzeHeader = function(){

        // unfold lines
        for(var i = this.node.headerLines.length - 1; i>=0; i--){
            if(i && this.node.headerLines[i].charAt(0).match(/^\s/)){
                this.node.headerLines[i-1] = this.node.headerLines[i-1].replace(/\s+$/, "") + " " + this.node.headerLines[i].replace(/^\s+/, "");
                this.node.headerLines.splice(i, 1);
            }
        }

        // parse lines
        this.node.headerLines = this.node.headerLines.map((function(line){
            return this._parseHeaderLine(line.trim());
        }).bind(this));
    };

    MailParser.prototype._parseHeaderLine = function(line){

        line = this._handleCharset(line);

        var parts = line.split(":"),
            key = parts.shift().trim().toLowerCase(),
            value = parts.join(":").trim();

        switch(key){

            case "content-type":
                value = this._parseHeaderValue(key, value);
                if(!this.node.headers[key]){
                    value["content-type"] = (value["content-type"] || "").toLowerCase();
                    this.node.contentType = value["content-type"];
                    if(["text/plain", "text/html"].indexOf(value["content-type"]) < 0){
                        this.node.attachment = true;
                    }
                    if(value.charset){
                        this.node.charset = mimeFunctions.charset.normalizeCharset(value.charset);
                    }
                    if(value["content-type"].match(/^multipart\//) && value.boundary){
                        this.node.multipart = value["content-type"].substr(10);
                        this.node.boundary = value.boundary || "";
                    }
                }
                break;

            case "content-transfer-encoding":
                value = value.trim().split(/[ ;]/).shift().toLowerCase().trim();
                break;
        }

        if(Array.isArray(this.node.headers[key])){
            this.node.headers[key].push(value);
        }else if(this.node.headers[key]){
            this.node.headers[key] = [this.node.headers[key], value];
        }else{
            this.node.headers[key] = value;
        }

    };

    MailParser.prototype._handleCharset = function(line){
        line = line || "";
        var buf;
        if(this.node.charset){
            buf = new Uint8Array(line.length);
            for(var i=0, len = line.length; i<len; i++){
                buf[i] = line.charCodeAt(i);
            }
            try{
                line = new TextDecoder(this.node.charset).decode(buf);
            }catch(E){}
        }
        return line;
    };

    MailParser.prototype._parseBodyLine = function(line){
        var boundary = this.node.boundary;

        line = this._handleCharset(line);

        if(!this.node.multipart){

            if(this.node.endBoundary && line.substr(0, this.node.endBoundary.length + 2) == "--" + this.node.endBoundary){
                if(this.node.lastLine){
                    this.node.body += this.node.lastLine.replace(/\r?\n|\r$/, "");
                    this.node.lastLine = false;
                }

                this.node = this.node.parent;
                // continue
            }else{
                if(this.node.lastLine){
                    this.node.body += this.node.lastLine;
                }
                this.node.lastLine = line;
                return;
            }
        }

        line = line.trim();
        if(!line){
            return;
        }

        if(line == "--" + this.node.boundary + "--"){
            this.node = this.node.parent;
            return;
        }

        if(line == "--" + this.node.boundary){
            boundary = this.node.boundary;
            this.node = this._createNode(this.node);
            this.node.endBoundary = boundary;
            return;
        }

    };

    MailParser.prototype._parseHeaderValue = function(key, value){
        var parts = value.split(";");
        value = {};

        value[key] = parts.shift().trim().toLowerCase();

        parts.forEach(function(part){
            var parts = part.split("="),
                k = parts.shift().trim().toLowerCase(),
                val = parts.join("=").trim();

            if(val.charAt(0) == '"'){
                val = val.replace(/^["\s]+|["\s]+$/g, "");
            }else if(val.charAt(0) == "'"){
                val = val.replace(/^['\s]+|['\s]+$/g, "");
            }else if(val.charAt(0) == "<"){
                val = val.replace(/^[<\s]+|[>\s]+$/g, "");
            }
            if(k != key){
                value[k] = val;
            }
        });

        return value;
    };

    MailParser.prototype._analyzeLines = function(){
        var line;

        while(this.lines.length){
            line = this.lines.shift();

            if(this.node.isHeader && !line.replace(/^[\r\n]+$/g, "")){
                this.node.isHeader = false;
                this._analyzeHeader();
                continue;
            }

            if(this.node.isHeader){
                this.node.headerLines.push(line);
                continue;
            }
            this._parseBodyLine(line);
        }
    };

    MailParser.prototype._processBody = function(node){
        var textFormat = (node.headers["content-type"] &&
                node.headers["content-type"].format || "fixed").toLowerCase(),
            delSp = (node.headers["content-type"] &&
                node.headers["content-type"].delsp || "no").toLowerCase();

        if(textFormat == "flowed"){
            node.body = node.body.
                // remove space stuffing http://tools.ietf.org/html/rfc3676#section-4.4
                replace(/^ /gm, "").
                // remove newline after space http://tools.ietf.org/html/rfc3676#section-4.1
                // FIXME: currently usenet signatures ("-- ") are not preserved
                replace(/([ ])(?:\r?\n|\r)/g,
                    // delsp removes trailing space when unfolding
                    delSp == "yes" ? "": "$1");
        }

        if(!node.attachment){
            switch(node.headers["content-transfer-encoding"] || "8bit"){
                case "base64":
                    return mimeFunctions.base64Decode(node.body, node.charset || "iso-8859-1");
                case "quoted-printable":
                    return mimeFunctions.quotedPrintableDecode(node.body, node.charset || "iso-8859-1");
            }
        }
        return node.body;
    };

    MailParser.prototype.getParsedTree = function(){

        var textBody = "", htmlBody = "", tree;

        var processNode = (function(node){
            var curNode = {
                headers: node.headers
            };

            if(node.childNodes && node.childNodes.length){
                curNode.childNodes = node.childNodes.map(processNode);
            }

            if(!node.attachment && node.body){
                if(node.headers["content-type"] && node.headers["content-type"]["content-type"] == "text/html"){
                    if(htmlBody.length && !htmlBody.substr(-1).match(/\s/)){
                        htmlBody += "\n" + node.body;
                    }else{
                        htmlBody += node.body;
                    }
                }else{
                    if(textBody.length && !textBody.substr(-1).match(/\s/)){
                        textBody += "\n" + node.body;
                    }else{
                        textBody += node.body;
                    }
                }
            }

            if(node.body){
                curNode.body = this._processBody(node);
            }
            curNode.attachment = !!node.attachment;

            return curNode;
        }).bind(this);

        tree = processNode(this.tree.childNodes[0] || false);

        if(tree && textBody){
            tree.text = textBody;
        }

        if(tree && htmlBody){
            tree.html = htmlBody;
        }

        return tree;
    };

    return function(){
        return new MailParser();
    };
}));