define(["alfresco/services/_BaseUploadService",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/Deferred",
        "dojo/on",
        "dojo/promise/all"],
    function(BaseUploadService, declare, lang, array, Deferred, on, all) {
        return declare([BaseUploadService], {

            uploadURL: "alvex/api/upload",

            onUploadRequest: function alvex_services__BaseUploadService__onUploadRequest(payload) {

                // A files reference will take precedence over actual files in the payload
                if (lang.exists("filesRefs", payload)) {
                    var files = this.alfGetData(payload.filesRefs);
                    if (files) {
                        payload.files = files;
                    }
                }

                // Make sure we have enough information to continue
                if (payload.files && payload.targetData) {

                    // Make sure the upload display widget is present
                    this.showUploadsWidget().then(lang.hitch(this, function() {

                        // Validate the files
                        var filesToUpload = this.validateFiles(payload.files);

                        // After the files are uploaded, call any final actions
                        var filePromises = array.map(filesToUpload, function(file) {
                            return (file._dfd = new Deferred()).promise;
                        });
                        all(filePromises).then(lang.hitch(this, function() {
                            this.onUploadsBatchComplete(payload);
                        }));

                        // Update the total number of in-progress files
                        this.totalNewUploads += filesToUpload.length;

                        // Start the uploads
                        this.startFileUploads(filesToUpload, payload.targetData, payload.alvexUploadResponseTopic);

                        // Update the total progress
                        this.updateAggregateProgress();
                    }));

                } else {
                    this.alfLog("warn", "A request was received to upload files but either no 'files' attribute or no 'targetData' attribute was defined", payload, this);
                }
            },

            startFileUploads: function alvex_services__BaseUploadService__startFileUploads(filesToUpload, targetData, alvexUploadResponseTopic) {

                // Recursively add files to the queue
                var nextFile;
                while ((nextFile = filesToUpload.shift())) {

                    // Ensure a unique file ID
                    var fileId = Date.now();
                    while (this.fileStore.hasOwnProperty(fileId)) {
                        fileId = Date.now();
                    }

                    // Add the data to the upload property of XMLHttpRequest so that we can determine which file each
                    // progress update relates to (the event argument passed in the progress function does not contain
                    // file name details)
                    var request = new XMLHttpRequest();
                    request.upload._fileData = fileId;

                    // Add the event listener functions to the upload properties of the XMLHttpRequest object
                    on(request.upload, "progress", lang.hitch(this, this.uploadProgressListener, fileId));
                    on(request.upload, "load", lang.hitch(this, this.successListener, fileId));
                    on(request.upload, "error", lang.hitch(this, this.failureListener, fileId));
                    on(request.upload, "abort", lang.hitch(this, this.cancelListener, fileId));

                    // Construct an object containing the data required for file upload
                    // Note that we use .name and NOT .fileName which is non-standard and will break FireFox 7
                    var fileName = nextFile.name,
                        uploadData = this.constructUploadData(nextFile, fileName, targetData);

                    // Add the upload data to the file store
                    this.fileStore[fileId] = {
                        state: this.STATE_ADDED,
                        fileName: fileName,
                        uploadData: uploadData,
                        request: request,
                        progress: 0,
                        alvexUploadResponseTopic: alvexUploadResponseTopic ? alvexUploadResponseTopic : ""
                    };

                    // Update the display widget with the details of the file that will be uploaded
                    this.uploadDisplayWidget.addInProgressFile(fileId, nextFile);
                }

                // Start uploads
                this.spawnFileUploads();
            },

            processUploadCompletion: function alvex_services__BaseUploadService__processUploadCompletion(fileId, evt) {

                // Check the response code
                var fileInfo = this.fileStore[fileId],
                    responseCode = fileInfo.request.status,
                    successful = responseCode >= 200 && responseCode < 300;

                // Handle according to success
                if (successful) {

                    // Get the response and update the file-info object
                    var response = JSON.parse(fileInfo.request.responseText);
                    switch (this.apiVersion)
                    {
                        case 0:
                        {
                            fileInfo.nodeRef = response.nodeRef;
                            fileInfo.fileName = response.fileName;
                            fileInfo.state = this.STATE_SUCCESS;
                            break;
                        }
                        case 1:
                        {
                            fileInfo.nodeRef = "workspace://SpacesStore/" + response.id;
                            fileInfo.fileName = response.name;
                            fileInfo.state = this.STATE_SUCCESS;
                            break;
                        }
                        default:
                            this.alfLog("error", "Unknown Upload API version specified: " + this.apiVersion);
                    }

                    // Notify uploads-display widget of completion
                    this.uploadDisplayWidget.handleCompletedUpload(fileId, evt, fileInfo);

                    // Execute post-upload actions
                    this.onUploadFinished(fileId);
                }
                else {
                    this.processUploadFailure(fileId, evt);
                }
            },

            /**
             * Called if a request fails or completes with a non-success status code.
             *
             * @instance
             * @param {object} fileId The unique identifier of the file
             * @param {object} evt The completion event
             */
            processUploadFailure: function alvex_services__BaseUploadService__processUploadFailure(fileId, evt) {
                var fileInfo = this.fileStore[fileId];
                if (fileInfo) {
                    fileInfo.state = this.STATE_FAILURE;
                    this.uploadDisplayWidget.handleFailedUpload(fileId, evt, fileInfo.request);
                    this.onUploadFinished(fileId);
                }
            }
        });
    });