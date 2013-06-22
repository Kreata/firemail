function loadParserTestFile(name, callback) {

    // relative to testrunner
    var mimePath = "./mailParser/MimeBack/messages-directory";

    var ajaxRequest = function(url, callback){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function(evt) {
            if (this.status == 200) {
                callback(null, new Uint8Array(this.response));
            }else{
                callback(new Error("Invalid status " + this.status));
            }
        };

        xhr.send();
    };

    ajaxRequest(mimePath + "/" + name, function(err, data){
        if(err){
            callback(err);
        }else{
            callback(null, data);
        }
    });
}