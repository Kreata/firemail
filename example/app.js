require(["../firemail"], function(firemail) {

    window.sendMail = function(){
        document.getElementById("sendBtn").disabled = true;

        var sender = firemail.sendmail({
            host: document.getElementById("host").value,
            port: Number(document.getElementById("port").value) || 25,
            useSSL: !!document.getElementById("ssl").checked,
            auth: document.getElementById("user").value ? {
                    user: document.getElementById("user").value,
                    pass: document.getElementById("pass").value
                } : false,
            debug: true
        });

        var mail = {
            from: document.getElementById("from").value,
            to: document.getElementById("to").value,
            subject: document.getElementById("subject").value,
            text: document.getElementById("text").value
        };

        var callback = function(err, success){
            alert(success ? "Mail sent" : "Failed");
            document.getElementById("sendBtn").disabled = false;
        };

        if(document.getElementById("attachment").files.length){
            var reader = new FileReader();
            var file = document.getElementById("attachment").files[0];
            reader.onload = function(evt){
                mail.attachments = [{
                    content: new Uint8Array(evt.target.result),
                    fileName: file.fileName,
                    contentType: file.type
                }];

                sender.send(mail, callback);
            };
            reader.readAsArrayBuffer(file);
        }else{
            sender.send(mail, callback);
        }
    };

});