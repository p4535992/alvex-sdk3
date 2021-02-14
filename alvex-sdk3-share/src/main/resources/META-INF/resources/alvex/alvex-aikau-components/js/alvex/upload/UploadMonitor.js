define(["alfresco/upload/UploadMonitor",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo",
        "dojo/_base/array"],
    function(UploadMonitor, declare, lang, domClass, domConstruct, dojo, array) {
        return declare([UploadMonitor], {

            addInProgressFile: function alvex_upload_UploadMonitor__addInProgressFile(fileId, file) {
                dojo.query(".alfresco-layout-StickyPanel").style("visibility", "visible");
                // Add new row
                var itemRow = domConstruct.create("tr", {
                        className: this.baseClass + "__item"
                    }, this.inProgressItemsNode),
                    itemName = domConstruct.create("td", {
                        className: this.baseClass + "__item__name"
                    }, itemRow),
                    itemNameContent = domConstruct.create("div", {
                        className: this.baseClass + "__item__name__content",
                        textContent: this.getDisplayText(file),
                        title: this.getDisplayText(file, true)
                    }, itemName),
                    itemProgress = domConstruct.create("td", {
                        className: this.baseClass + "__item__progress"
                    }, itemRow),
                    itemProgressContent = domConstruct.create("span", {
                        className: this.baseClass + "__item__progress__content",
                        textContent: this.displayUploadPercentage ? "0%" : ""
                    }, itemProgress),
                    itemStatus = domConstruct.create("td", {
                        className: this.baseClass + "__item__status"
                    }, itemRow),
                    itemActions = domConstruct.create("td", {
                        className: this.baseClass + "__item__actions"
                    }, itemRow),
                    progressRow = domConstruct.create("tr", {}, this.inProgressItemsNode),
                    progressCell = domConstruct.create("td", {
                        colspan: 4,
                        className: this.baseClass + "__item__progress-cell"
                    }, progressRow),
                    progressBar = domConstruct.create("div", {
                        className: this.baseClass + "__item__progress-bar"
                    }, progressCell);

                // Add localised status messages
                domConstruct.create("span", {
                    className: this.baseClass + "__item__status__inprogress",
                    textContent: this.message("upload.status.inprogress")
                }, itemStatus);
                domConstruct.create("span", {
                    className: this.baseClass + "__item__status__finishing",
                    textContent: this.message("upload.status.finishing")
                }, itemStatus);
                domConstruct.create("span", {
                    className: this.baseClass + "__item__status__successful",
                    textContent: this.message("upload.status.successful")
                }, itemStatus);
                domConstruct.create("span", {
                    className: this.baseClass + "__item__status__unsuccessful",
                    textContent: this.message("upload.status.unsuccessful")
                }, itemStatus);
                var errorIconNode = domConstruct.create("span", {
                    className: this.baseClass + "__item__status__unsuccessful_icon"
                }, itemStatus);

                // Store in uploads map
                var upload = this._uploads[fileId] = {
                    id: fileId,
                    file: file,
                    actionPayload: {
                        uploadId: fileId,
                        fileSize: file.size,
                        fileName : file.name,
                        fileObj: file
                    },
                    nodes: {
                        row: itemRow,
                        name: itemNameContent,
                        errorIcon: errorIconNode,
                        progress: itemProgressContent,
                        progressRow: progressRow,
                        progressBar: progressBar
                    }
                };

                // Add actions
                this.addActions(upload.actionPayload, itemActions);
            },

            handleCompletedUpload: function alvex_upload_UploadMonitor__handleCompletedUpload(fileId, /*jshint unused:false*/ completionEvt, /*jshint unused:false*/ fileInfo) {
                var request = fileInfo["request"];
                var upload = this._uploads[fileId];
                if (upload) {

                    // Mark as completed and move to successful section
                    upload.completed = true;
                    upload.nodes.progressBar.parentNode.removeChild(upload.nodes.progressBar);
                    domConstruct.place(upload.nodes.row, this.successfulItemsNode, "first");
                    domClass.remove(upload.nodes.row, this.baseClass + "__item--finishing");

                    // Parse the request to get the information about the resulting nodes that have been created
                    // This information could be used to allow actions or links to be generated for the uploaded content
                    // before the display is closed...
                    if (request && request.responseText) {
                        var response = request.responseText;
                        try {
                            response = JSON.parse(response);
                        } catch (e) {
                            this.alfLog("debug", "Unable to parse upload response as JSON", response);
                        }
                        upload.actionPayload.response = response;
                        this.alfPublish(fileInfo["alvexUploadResponseTopic"], {
                            isUploaded: true,
                            response: response,
                            file: upload.file
                        }, true);
                        this.nukeUploadWindow();
                    }
                } else {
                    this.alfLog("warn", "Attempt to mark as complete an upload that is not being tracked (id=" + fileId + ")");
                }
            },
            nukeUploadWindow: function() {
                var allDone = true;
                array.forEach(this._uploads,function (upload) {
                    allDone = (upload.completed) ? allDone : false;
                });
                if (allDone) {
                    this.reset();
                    //I really don't think that's appropriate
                    dojo.query(".alfresco-layout-StickyPanel").style("visibility", "hidden");
                }
            }
        });
    });
