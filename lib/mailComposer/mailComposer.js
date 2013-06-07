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
        define([
            "../mimeFunctions/mimeFunctions",
            "../mimeFunctions/mimeTypes",
            "../punycode/punycode"
            ], factory);
    } else {
        root.mailComposer = factory(mimeFunctions, mimeTypes);
    }
}(this, function(mimeFunctions, mimeTypes, punycode) {

    "use strict";

    function MailComposer(){
        this._headers = {order:[], values:{}};

        this._body = {};
        this._envelope = {};

        this._unrelatedAttachments = [];
        this._relatedAttachments = [];

        this._gencounter = 0;

        this._startTime = Date.now(); // needed for generating boundaries

        this.setHeader("MIME-Version", "1.0");
    }

    MailComposer.prototype.ondata = function(){};
    MailComposer.prototype.onend = function(){};

    MailComposer.prototype.setHeader = function(key, value){
        value = (value || "").replace(/\r?\n|\r/g, " "); // no newlines allowed

        key = (key || "").toString().trim().toLowerCase().replace(/^MIME\b|^[a-z]|\-[a-z]/ig, function(c){
            return c.toUpperCase();
        });

        if(this._headers.order.indexOf(key) <=0){
            this._headers.order.unshift(key);
        }

        this._headers.values[key] = [].concat(value || []).reverse();
    }

    MailComposer.prototype.setTextBody = function(text){
        this._body.text = (text || "").toString();
    }

    MailComposer.prototype.setHTMLBody = function(html){
        this._body.html = (html || "").toString();
    }

    MailComposer.prototype.addAttachment = function(attachment){
        if(attachment.cid){
            this._relatedAttachments.push(attachment);
        }else{
            this._unrelatedAttachments.push(attachment);
        }
    }

    MailComposer.prototype._generateHeader = function(){
        var headerLines = [];
        this._headers.order.forEach((function(key){
            this._headers.values[key].forEach((function(value){
                headerLines.push(mimeFunctions.foldLines(key + ": " + value, 76));
            }).bind(this));
        }).bind(this));

        return headerLines.join("\r\n");
    }

    MailComposer.prototype._buildTextNode = function(){
        var node = {
            contentType: "text/plain",
            content: "text"
        };

        return node;
    }

    MailComposer.prototype._buildHTMLNode = function(){
        var node = {};

        if(!this._relatedAttachments.length){
            return {
                contentType: "text/html",
                content: "html"
            }
        }

        node = {
            contentType: "multipart/related",
            multipart: true,
            childNodes: []
        }

        node.childNodes.push({
            contentType: "text/html",
            content: "html"
        });

        this._relatedAttachments.forEach(function(attachment){
            node.childNodes.push({
                attachment: attachment
            });
        });

        return node;
    }

    MailComposer.prototype._buildAlternative = function(){
        var node = {
            contentType: "multipart/alternative",
            multipart: true,
            childNodes: []
        }

        if(this._body.text){
            node.childNodes.push(this._buildTextNode());
        }

        if(this._body.html){
            node.childNodes.push(this._buildHTMLNode());
        }

        if(!node.childNodes.length){
            return false;
        }

        if(node.childNodes.length == 1){
            return node.childNodes.shift();
        }

        return node;
    }

    MailComposer.prototype._buildMixedNode = function(){
        var node = {
            contentType: "multipart/mixed",
            multipart: true,
            childNodes: []
        };

        if(this._body.text && this._body.html){
            node.childNodes.push(this._buildAlternative());
        }else if(this._body.text){
            node.childNodes.push(this._buildTextNode());
        }else if(this._body.html){
            node.childNodes.push(this._buildHTMLNode());
        }

        this._unrelatedAttachments.forEach(function(attachment){
            node.childNodes.push({
                attachment: attachment
            });
        });

        if(!this._body.html){
            this._relatedAttachments.forEach(function(attachment){
                node.childNodes.push({
                    attachment: attachment
                });
            });            
        }

        if(!node.childNodes.length){
            return false;
        }

        if(node.childNodes.length == 1){
            return node.childNodes.shift();
        }

        return node;
    }

    MailComposer.prototype._buildBodyTree = function(){
        return this._buildMixedNode();
    }

    MailComposer.prototype._flattenBodyTree = function(){
        var flatTree = [],
            boundaryCount = 0;

        var walkNode = function(node, curBorder){
            var flatNode = {
                boundary: curBorder
            };

            Object.keys(node).forEach(function(key){
                if(key != "childNodes"){
                    flatNode[key] = node[key];
                }
            });

            flatTree.push(flatNode);

            if(node.childNodes){
                flatNode.boundaryOpen = ++boundaryCount;
                node.childNodes.forEach(function(childNode){
                    walkNode(childNode, boundaryCount);
                });
                flatTree.push({boundaryClose: flatNode.boundaryOpen})
            }
        }

        walkNode(this._buildMixedNode());

        return flatTree;
    }

    MailComposer.prototype._generateBoundary = function(nr){
        return "----firemail-?=_" + nr + "-" + this._startTime;
    }

    MailComposer.prototype._prepareTextPart = function(text, callback){
        return callback();
    }

    MailComposer.prototype._prepareHTMLPart = function(html, callback){
        return callback();
    }

    MailComposer.prototype._prepareAttachment = function(attachment, callback){
        if(!attachment.headers["Content-Type"]){
            attachment.headers["Content-Type"] = "application/octet-stream";
        }
        return callback();
    }

    MailComposer.prototype._prepareHeaders = function(bodyPart, callback){
        if(bodyPart.content == "text"){
            return this._prepareTextPart(bodyPart, callback);
        }

        if(bodyPart.content == "html"){
            return this._prepareHTMLPart(bodyPart, callback);
        }

        if(bodyPart.attachment){
            return this._prepareAttachment(bodyPart, callback);
        }

        return callback();
    }


    MailComposer.prototype._streamText = function(bodyPart, callback){
        this.ondata(this._body.text + "\r\n");
        return callback();
    }

    MailComposer.prototype._streamHTML = function(bodyPart, callback){
        this.ondata(this._body.html + "\r\n");
        return callback();
    }

    MailComposer.prototype._streamAttachment = function(bodyPart, callback){
        this.ondata(JSON.stringify(bodyPart) + "\r\n");
        return callback();
    }

    MailComposer.prototype._streamBody = function(bodyPart, callback){
        if(bodyPart.content == "text"){
            return this._streamText(bodyPart, callback);
        }

        if(bodyPart.content == "html"){
            return this._streamHTML(bodyPart, callback);
        }

        if(bodyPart.attachment){
            return this._streamAttachment(bodyPart, callback);
        }

        return callback();
    }

    MailComposer.prototype._processBodyPart = function(bodyPart, callback){

        bodyPart.headers = bodyPart.headers || {};

        var header = "";

        if(bodyPart.contentType){
            bodyPart.headers["Content-Type"] = bodyPart.contentType;
        }

        if(bodyPart.boundary){
            header += "--" + this._generateBoundary(bodyPart.boundary) + "\r\n";
        }

        if(bodyPart.boundaryOpen){
            bodyPart.headers["Content-Type"] += "; boundary=\""+this._generateBoundary(bodyPart.boundaryOpen) + "\"";
        }

        this._prepareHeaders(bodyPart, (function(){

            Object.keys(bodyPart.headers).forEach(function(key){
                header += key + ": " + bodyPart.headers[key] + "\r\n";
            });

            this.ondata(header + (header.length ? "\r\n" : ""));

            this._streamBody(bodyPart, (function(){

                if(bodyPart.boundaryClose){
                    this.ondata("--"+this._generateBoundary(bodyPart.boundaryClose) + "--" + (bodyPart.boundaryClose > 1 ? "\r\n\r\n": ""));
                }

                callback();
            }).bind(this));

        }).bind(this));
    }

    MailComposer.prototype.stream = function(){
        var i = 0,
            flatBodyTree = this._flattenBodyTree(),
            headers = this._generateHeader();

        var processBodyParts = (function(){
            if(i >= flatBodyTree.length){
                this.onend();
            }

            var bodyPart = flatBodyTree[i++];
            this._processBodyPart(bodyPart, processBodyParts);
        }).bind(this);

        if(headers){
            this.ondata(headers + "\r\n");
        }
        processBodyParts();
    }

    return function(){
        return new MailComposer();
    };
}));
