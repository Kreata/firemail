var MIMETypes = {

    /**
     * Returns file extension for a content type string. If no suitable extensions
     * are found, 'bin' is used as the default extension
     *
     * @param {String} mimeType Content type to be checked for
     * @return {String} File extension
     */
    detectExtension: function(mimeType){
        mimeType = (mimeType || "").toString().toLowerCase().replace(/\s/g, "");
        if(!(mimeType in MIMETypes._mimeTypes)){
            return "bin";
        }

        if(typeof MIMETypes._mimeTypes[mimeType] == "string"){
            return MIMETypes._mimeTypes[mimeType];
        }

        var mimeParts = mimeType.split("/");

        // search for name match
        for(var i=0, len = MIMETypes._mimeTypes[mimeType].length; i < len; i++){
            if(mimeParts[1] == MIMETypes._mimeTypes[mimeType][i]){
                return MIMETypes._mimeTypes[mimeType][i];
            }
        }

        // use the first one
        return MIMETypes._mimeTypes[mimeType][0];
    },

    /**
     * Returns content type for a file extension. If no suitable content types
     * are found, 'application/octet-stream' is used as the default content type
     *
     * @param {String} extension Extension to be checked for
     * @return {String} File extension
     */
    detectMimeType: function(extension){
        extension = (extension || "").toString().toLowerCase().replace(/\s/g, "").replace(/^\./g, "");

        if(!(extension in MIMETypes._extensions)){
            return "application/octet-stream";
        }

        if(typeof MIMETypes._extensions[extension] == "string"){
            return MIMETypes._extensions[extension];
        }

        var mimeParts;

        // search for name match
        for(var i=0, len = MIMETypes._extensions[extension].length; i < len; i++){
            mimeParts = MIMETypes._extensions[extension][i].split("/");
            if(mimeParts[1] == extension){
                return MIMETypes._extensions[extension][i];
            }
        }

        // use the first one
        return MIMETypes._extensions[extension][0];
    }
};