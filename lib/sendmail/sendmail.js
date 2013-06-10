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
        define(['../mailComposer/mailComposer', '../smtpClient/smtpClient'], factory);
    } else {
        root.sendmail = factory(root.mailComposer, root.smtpClient);
    }
}(this, function(mailComposer, smtpClient) {

    "use strict";

// TODO: graceful error handling

    function Sendmail(options){
        this.options = options || {};
        this._smtpClient = null;
        this._sendQueue = [];
        this._idle = false;
        this._currentMail = null;
        this._currentCallback = null;
    }

    Sendmail.prototype.send = function(mail, callback){
        this._sendQueue.push([mail, callback]);

        if(!this._smtpClient){
            this._smtpClient = smtpClient(this.options.host, this.options.port, this.options);
            this._smtpClient.onidle = this._sendMail.bind(this);
            this._smtpClient.onclose = this._closeClient.bind(this);
            this._smtpClient.connect();
        }else if(this._idle){
            this._sendMail();
        }
    };

    Sendmail.prototype._sendMail = function(){
        var mail, callback, composer;

        if(!this._sendQueue.length){
            this._idle = true;
            return;
        }

        mail = this._sendQueue.shift();

        this._idle = false;

        callback = mail.pop();
        mail = mail.shift();

        composer = mailComposer();

        ["subject", "from", "sender", "to", "cc", "bcc", "reply-to", "in-reply-to", "references"].forEach((function(key){
            if(key in mail){
                composer.setHeader(key, composer.encodeHeaderValue(key, mail[key]));
            }
        }).bind(this));

        if(mail.headers){
            Object.keys(mail.headers).forEach(function(key){
                composer.setHeader(key, composer.encodeHeaderValue(key, mail.headers[key]));
            });
        }

        if(mail.html){
            composer.setHtml(mail.html);
        }

        if(mail.text){
            composer.setText(mail.text);
        }

        [].concat(mail.attachments || []).forEach(function(attachment){
            composer.addAttachment(attachment);
        });

        composer.ondata = (function(chunk){
            if(!this._smtpClient.send(chunk)){
                composer.suspend();
            }
        }).bind(this);

        composer.onend = (function(){
            this._smtpClient.end();
        }).bind(this);

        this._smtpClient.ondrain = function(){
            composer.resume();
        };

        this._smtpClient.onready = function(failedRecipients){
            composer.stream();
        };

        this._smtpClient.ondone = (function(success){
            callback(null, success);
        }).bind(this);

        this._smtpClient.useEnvelope(composer.getEnvelope());
    };

    Sendmail.prototype._closeClient = function(){
        this._smtpClient = null;
        if(this._sendQueue.length){
            setTimeout((function(){
                this._smtpClient = smtpClient(this.options.host, this.options.port, this.options);
                this._smtpClient.onidle = this._sendMail.bind(this);
                this._smtpClient.onclose = this._closeClient.bind(this);
                this._smtpClient.connect();
            }).bind(this), 1000);
        }
    };

    return function(options){
        return new Sendmail(options);
    };
}));
