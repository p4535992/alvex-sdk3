model.jsonModel = {
    services: [
        {
            name: "alfresco/services/LoggingService",
            config: {
                loggingPreferences: {
                    enabled: true,
                    all: true,
                    warn: true,
                    error: true
                }
            }
        },
        "alvex/services/FileUploadService",
        "alfresco/services/ContentService",
        "alfresco/services/DialogService",
        "alfresco/services/DocumentService",
        "alfresco/services/SiteService",
        "alfresco/services/NotificationService",
        "alfresco/services/LightboxService"
    ],
    widgets: [
        {
            name: "alfresco/layout/HorizontalWidgets",
            config: {
                widgetMarginLeft: 10,
                widgetMarginRight: 10,
                widgets: [
                    {
                        name: "alfresco/buttons/AlfButton",
                        config: {
                            label: "set value",
                            publishTopic: "SET_FORM_VALUE",
                            publishPayload: {
                                pew: "2018-01-12|2018-01-30"
                            },
                            publishGlobal: true
                        }
                    },
                    {
                        name: "alfresco/forms/Form",
                        config: {
                            setValueTopic: "SET_FORM_VALUE",
                            okButtonPublishTopic: "_PICKED_DATA",
                            widgets: [
                                {
                                    name: "alvex/forms/controls/DateRange",
                                    config: {
                                        label: "test date range",
                                        name: "pew"
                                    }
                                }
                            ]
                        }
                    }

                ]
            }
        }
    ]
};
