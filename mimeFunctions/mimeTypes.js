var mimeTypes = {

    /**
     * Returns file extension for a content type string. If no suitable extensions
     * are found, 'bin' is used as the default extension
     *
     * @param {String} mimeType Content type to be checked for
     * @return {String} File extension
     */
    detectExtension: function(mimeType){
        mimeType = (mimeType || "").toString().toLowerCase().replace(/\s/g, "");
        console.log(mimeType)
        console.log(mimeTypes._mimeTypes)
        if(!(mimeType in mimeTypes._mimeTypes)){
            return "bin";
        }

        if(typeof mimeTypes._mimeTypes[mimeType] == "string"){
            return mimeTypes._mimeTypes[mimeType];
        }

        var mimeParts = mimeType.split("/");

        // search for name match
        for(var i=0, len = mimeTypes._mimeTypes[mimeType].length; i < len; i++){
            if(mimeParts[1] == mimeTypes._mimeTypes[mimeType][i]){
                return mimeTypes._mimeTypes[mimeType][i];
            }
        }

        // use the first one
        return mimeTypes._mimeTypes[mimeType][0];
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

        if(!(extension in mimeTypes._extensions)){
            return "application/octet-stream";
        }

        if(typeof mimeTypes._extensions[extension] == "string"){
            return mimeTypes._extensions[extension];
        }

        var mimeParts;

        // search for name match
        for(var i=0, len = mimeTypes._extensions[extension].length; i < len; i++){
            mimeParts = mimeTypes._extensions[extension][i].split("/");
            if(mimeParts[1] == extension){
                return mimeTypes._extensions[extension][i];
            }
        }

        // use the first one
        return mimeTypes._extensions[extension][0];
    }
};