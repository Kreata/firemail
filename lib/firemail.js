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
        define(['../../mailcomposer/mailcomposer', '../../smtpclient/smtpclient'], factory);
    } else {
        root.firemail = factory(root.mailcomposer, root.smtpclient);
    }
}(this, function(mailcomposer, smtpclient) {

    "use strict";

    /**
     * Generates an instance to send mail and sends immediatelly
     *
     * @constructor
     * @param {Object} mail E-mail properties
     * @param {Function} callback Callback to run after the mail has been sent
     */
    function Sendmail(mail, callback){

        this.callback = callback;
        this.mail = mail || {};
        this.mail.smtp = this.mail.smtp || {};

        /**
         * If set to true, do not run callback any more
         */
        this._returned = false;

        // Setup SMTP client

        /**
         * SMTP client
         */
        this._smtpclient = smtpclient(this.mail.smtp.host, this.mail.smtp.port, this.mail.smtp);

        // Setup SMTP events
        this._smtpclient.onidle = this._smtpclientOnIdle.bind(this);
        this._smtpclient.onclose = this._smtpclientOnClose.bind(this);
        this._smtpclient.onerror = this._smtpclientOnError.bind(this);
        this._smtpclient.ondrain = this._smtpclientOnDrain.bind(this);
        this._smtpclient.onready = this._smtpclientOnReady.bind(this);
        this._smtpclient.ondone = this._smtpclientOnDone.bind(this);

        // Setup mail composer

        /**
         * MailComposer object
         */
        this._composer = mailcomposer();

        // Setup MailComposer events
        this._composer.ondata = this._composerOnData.bind(this);
        this._composer.onend = this._composerOnEnd.bind(this);

        // Initiate mail sending by connecting to SMTP
        this._smtpclient.connect();
    }

    /**
     * Fired when SMTP client enters idled state (after successfull auth)
     * Setups the mail and transfers the envelope to SMTP
     */
    Sendmail.prototype._smtpclientOnIdle = function(){
        // Set default options
        ["subject", "from", "sender", "to", "cc", "bcc", "reply-to", "in-reply-to", "references"].forEach((function(key){
            if(key in this.mail){
                this._composer.setHeader(key, this._composer.encodeHeaderValue(key, this.mail[key]));
            }
        }).bind(this));

        // Generate Message-ID
        this._composer.setHeader("message-id", this._composer.encodeHeaderValue("message-id", Date.now() + Math.random().toString(16).substr(1) + "@firemail"));
        // Generate Date
        this._composer.setHeader("date", new Date().toUTCString());

        // Add any custom header values. Will overwrite any previously set (including message-id and date)
        if(this.mail.headers){
            Object.keys(this.mail.headers).forEach((function(key){
                this._composer.setHeader(key, this._composer.encodeHeaderValue(key, this.mail.headers[key]));
            }).bind(this));
        }

        // Add HTML body
        if(this.mail.html){
            this._composer.setHtml(this.mail.html);
        }

        // Add plaintext body
        if(this.mail.text){
            this._composer.setText(this.mail.text);
        }

        // Add attachments
        [].concat(this.mail.attachments || []).forEach((function(attachment){
            this._composer.addAttachment(attachment);
        }).bind(this));

        // send envelope to smtp
        this._smtpclient.useEnvelope(this._composer.getEnvelope());
    };

    /**
     * Fired when SMTP client enters Ready state (envelope has been set up and data can be sent)
     * Starts streaming by the mail composer
     */
    Sendmail.prototype._smtpclientOnReady = function(){
        this._composer.stream();
    };

    /**
     * Fired when SMTP client emits ondrain event. Mail composer can resume streaming
     */
    Sendmail.prototype._smtpclientOnDrain = function(){
        this._composer.resume();
    };

    /**
     * Fired when SMTP client emits ondone event (e-mail has been sent)
     *
     * @param {Boolean} success If true, the mail was sent successfully
     */
    Sendmail.prototype._smtpclientOnDone = function(success){
        this._smtpclient.onidle = function(){}; // prevent sending the mail again
        this._smtpclient.quit(); // QUIT
        this._returned = true;
        this.callback(null, success);
    };

    /**
     * Fired when SMTP client emits an error. NB! might not have a `message` property
     *
     * @param {Error} err Error received
     */
    Sendmail.prototype._smtpclientOnError = function(err){
        if(!this._returned){
            this._returned = true;
            this.callback(err);
        }else{
            //console.log(err.message || err);
        }
    };

    /**
     * Connection to the SMTP server has been closed
     */
    Sendmail.prototype._smtpclientOnClose = function(){
        //console.log("Connection closed");
    };

    /**
     * Fired when mail cposer emits a chunk. If writing to SMTP yields in false
     * (tcp buffer is filled), suspends receiving any more data events until
     * SMTP emits ondrain
     *
     * @param {String} data Chunk to be sent to the SMTP server
     */
    Sendmail.prototype._composerOnData = function(chunk){
        if(!this._smtpclient.send(chunk)){
            this._composer.suspend();
        }
    };

    /**
     * Fired when mail cposer has emitted the entire message
     */
    Sendmail.prototype._composerOnEnd = function(){
        this._smtpclient.end();
    };

    return function(mail, callback){
        return new Sendmail(mail, callback);
    };
}));
