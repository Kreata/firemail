require(["../firemail"], function(firemail) {

    window.sendMail = function(){

        // Disable "Send mail" button
        document.getElementById("sendBtn").disabled = true;

        // Setup e-mail object
        var mail = {
            from: document.getElementById("from").value,
            to: document.getElementById("to").value,
            subject: document.getElementById("subject").value,
            text: document.getElementById("text").value,

            headers:{
                "x-mailer": "firemail"
            },

            smtp: {
                host: document.getElementById("host").value,
                port: Number(document.getElementById("port").value),
                useSSL: !!document.getElementById("ssl").checked,
                auth: document.getElementById("user").value ? {
                        user: document.getElementById("user").value,
                        pass: document.getElementById("pass").value
                    } : false
            }
        };

        // Store mail data
        localStorage.firemailDemo = JSON.stringify(mail);

        // Callback function to run once the message has been sent
        var callback = function(err, success){
            if(err){
                alert(err.message || err);
            }else{
                alert(success ? "Mail sent" : "Failed sending mail");
            }
            document.getElementById("sendBtn").disabled = false;
        };

        // If attachment has been specified load the contents before sending
        if(document.getElementById("attachment").files.length){

            var reader = new FileReader(),
                file = document.getElementById("attachment").files[0];

            // run once the file has been loaded
            reader.onload = function(evt){

                // add an attachment object to the attachment list
                mail.attachments = [{
                    content: new Uint8Array(evt.target.result),
                    fileName: file.fileName,
                    contentType: file.type
                }];

                // Send mail
                firemail.sendmail(mail, callback);
            };

            // start loading file
            reader.readAsArrayBuffer(file);
        }else{

            // Send mail
            firemail.sendmail(mail, callback);
        }
    };

});