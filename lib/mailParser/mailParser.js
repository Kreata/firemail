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
        }

        parent.childNodes.push(node);

        return node;
    }

    MailParser.prototype.write = function(chunk){
        if(!chunk.length){
            return true;
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
    }

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
    }


    MailParser.prototype._analyzeHeader = function(){
        var contentType;
        for(var i = this.node.headerLines.length - 1; i>=0; i--){
            if(i && this.node.headerLines[i].charAt(0).match(/^\s/)){
                this.node.headerLines[i-1] = this.node.headerLines[i-1].replace(/\s+$/, "") + " " + this.node.headerLines[i].replace(/^\s+/, "");
                this.node.headerLines.splice(i, 1);
            }else{
                this.node.headerLines[i] = this.node.headerLines[i].trim();
                this._parseHeaderLine(this.node.headerLines[i]);
            }
        }

        contentType = [].concat(this.node.headers["content-type"] || [])[0];

        if(contentType){
            contentType["content-type"] = (contentType["content-type"] || "").toLowerCase();
            if(contentType["content-type"].match(/^multipart\//) && contentType.boundary){
                this.node.multipart = contentType["content-type"].substr(10);
                this.node.boundary = contentType.boundary || "";
            }
        }
    }

    MailParser.prototype._parseHeaderLine = function(line){
        var parts = line.split(":"),
            key = parts.shift().trim().toLowerCase(),
            value = parts.join(":").trim();

        switch(key){
            case "content-type":{
                value = this._parseHeaderValue(key, value);
            }
        }

        if(Array.isArray(this.node.headers[key])){
            this.node.headers[key].push(value);
        }else if(this.node.headers[key]){
            this.node.headers[key] = [this.node.headers[key], value];
        }else{
            this.node.headers[key] = value;
        }

    }

    MailParser.prototype._parseBodyLine = function(line){
        var boundary = this.node.boundary;
        line = line || "";

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

    }

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
    }

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
    }

    MailParser.prototype.getParsedTree = function(){

        var processNode = function(node){
            var curNode = {
                headers: node.headers
            };

            if(node.childNodes && node.childNodes.length){
                curNode.childNodes = node.childNodes.map(processNode);
            }

            if(node.body){
                curNode.body = node.body;
            }

            return curNode;
        }

        return processNode(this.tree.childNodes[0] || false);
    }

    return function(){
        return new MailParser();
    };
}));