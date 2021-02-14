package com.alvexcore.repo.informPolicy;

import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.action.executer.MailActionExecuter;
import org.alfresco.repo.policy.Behaviour;
import org.alfresco.repo.policy.JavaBehaviour;
import org.alfresco.repo.policy.PolicyComponent;
import org.alfresco.repo.version.VersionServicePolicies.AfterCreateVersionPolicy;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.action.Action;
import org.alfresco.service.cmr.action.ActionService;
import org.alfresco.service.cmr.preference.PreferenceService;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.version.Version;
import org.alfresco.service.cmr.version.VersionHistory;
import org.alfresco.service.cmr.version.VersionService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.alfresco.service.namespace.RegexQNamePattern;
import org.apache.log4j.Logger;

import java.io.Serializable;
import java.util.*;
import org.alfresco.repo.admin.RepositoryState;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by azverev on 11/13/15.
 */
public class InformPolicy
        implements AfterCreateVersionPolicy
{
    protected Logger logger = Logger.getLogger(InformPolicy.class);
    protected VersionService versionService;
    protected PersonService personService;
    protected PolicyComponent policyComponent;
    protected NodeService nodeService;
    protected ServiceRegistry serviceRegistry;
    protected ActionService actionService;
    protected RepositoryState repositoryState;
    protected ContentService contentService;

    private HashMap<String, String> templates;
    private String mailfrom;
    private String subject;
    private boolean creator;
    private boolean lasteditor;
    private boolean editors;
    private boolean associated;
    private boolean infavorites;

    private Action mailAction;

    public void setVersionService(VersionService versionService) {this.versionService = versionService; }
    public void setNodeService(NodeService nodeService) {this.nodeService = nodeService; }
    public void setPersonService(PersonService personService) {this.personService = personService; }
    public void setContentService(ContentService contentService) {this.contentService = contentService; }
    public void setActionService(ActionService actionService) {this.actionService = actionService; }
    public void setPolicyComponent(PolicyComponent policyComponent) {this.policyComponent = policyComponent; }
    public void setServiceRegistry(ServiceRegistry serviceRegistry) {this.serviceRegistry = serviceRegistry; }
    public void setRepositoryState(RepositoryState repositoryState) { this.repositoryState = repositoryState; }


    public void setMailfrom(String mailfrom) {this.mailfrom = mailfrom; }
    public void setSubject(String subject) {this.subject = subject; }
    public void setCreator(boolean creator) {this.creator = creator; }
    public void setLasteditor(boolean lasteditor) {this.lasteditor = lasteditor; }
    public void setEditors(boolean editors) {this.editors = editors; }
    public void setAssociated(boolean associated) {this.associated = associated; }
    public void setInfavorites(boolean infavorites) {this.infavorites = infavorites; }

    public static final QName infavorites_documents_association_qname = QName.createQName("http://itdhq.com/prefix/infav", "infavorites_documents_association");
    public static final QName infavorites_folders_association_qname = QName.createQName("http://itdhq.com/prefix/infav", "infavorites_folders_association");

    protected static final String creator_preference = "com.alvexcore.documentchangeinform.creator";
    protected static final String lasteditor_preference = "com.alvexcore.documentchangeinform.lasteditor";
    protected static final String editor_preference = "com.alvexcore.documentchangeinform.editor";
    protected static final String associated_preference = "com.alvexcore.documentchangeinform.associated";
    protected static final String infavorites_preference = "com.alvexcore.documentchangeinform.infavorites";
    
    
    //MOD 4535992 GLOBAL PROPERTIES
    protected static final String ALVEX_INFORM_POLICY_ENABLE = "alvex.inform-policy.enable";
    protected Properties globalProperties;

	public void setGlobalProperties(Properties globalProperties) {
		this.globalProperties = globalProperties;
	}
	
	public void init()
    {
    	if(globalProperties.get(ALVEX_INFORM_POLICY_ENABLE)!=null && Boolean.parseBoolean(String.valueOf(globalProperties.get(ALVEX_INFORM_POLICY_ENABLE)))) {
	        logger.debug("Inform policy is online.");
	        Behaviour afterCreateVersionBehaviour = new JavaBehaviour(this, "afterCreateVersion", Behaviour.NotificationFrequency.TRANSACTION_COMMIT);
	        this.policyComponent.bindClassBehaviour(QName.createQName(NamespaceService.ALFRESCO_URI, "afterCreateVersion"), InformPolicy.class, afterCreateVersionBehaviour);
	
	        // Adding template paths
	        templates = new HashMap<>(5);
	        templates.put("creator", "PATH:\"/app:company_home/app:dictionary/app:email_templates/cm:document_change_notification/cm:inform_mail_template_creator.html.ftl\"");
	        templates.put("lasteditor", "PATH:\"/app:company_home/app:dictionary/app:email_templates/cm:document_change_notification/cm:inform_mail_template_lasteditor.html.ftl\"");
	        templates.put("associated", "PATH:\"/app:company_home/app:dictionary/app:email_templates/cm:document_change_notification/cm:inform_mail_template_associated.html.ftl\"");
	        templates.put("editors", "PATH:\"/app:company_home/app:dictionary/app:email_templates/cm:document_change_notification/cm:inform_mail_template_editors.html.ftl\"");
	        templates.put("infavorites", "PATH:\"/app:company_home/app:dictionary/app:email_templates/cm:document_change_notification/cm:inform_mail_template_favorited.html.ftl\"");
    	}else {
    		 logger.debug("Inform policy is offline.");
    	}
    }

    @Override
    public void afterCreateVersion(NodeRef versionableNode, Version version) {
    	if(globalProperties.get(ALVEX_INFORM_POLICY_ENABLE)!=null && Boolean.parseBoolean(String.valueOf(globalProperties.get(ALVEX_INFORM_POLICY_ENABLE)))) {
	        HashSet<String> informedUsers = new HashSet<>();
	        String lasteditorname = getLastEditor(version);
	        String creatorname = getDocumentCreator(versionableNode);
	
	        // Because I can!
	        HashMap<String, Serializable> versioninfo = (HashMap<String, Serializable>) version.getVersionProperties();
	        HashMap<String, Serializable> fortemplate = new HashMap<>();
	        fortemplate.put("documentname", versioninfo.get("name").toString());
	        fortemplate.put("updatedate", versioninfo.get("created").toString());
	        fortemplate.put("versionlabel", versioninfo.get("versionLabel").toString());
	        fortemplate.put("lasteditorname", lasteditorname);
	        fortemplate.put("creatorname", creatorname);
	
	        logger.debug("Notifying users about new version of the document :" + nodeService.getProperty(versionableNode, ContentModel.PROP_NAME));
	
	        // Version creator
	        if (creator) {
	            logger.debug("Notifying creator of the document");
	            if (null == getPreference(creatorname, creator_preference) ||
	                    "true" == getPreference(creatorname, creator_preference)) {
	                NodeRef mailCreatorTemplate = getMailTemplate(templates.get("creator"));
	                sendMail(creatorname, mailCreatorTemplate, fortemplate);
	                informedUsers.add(creatorname);
	            }
	        }
	
	        // Last editor
	        if (lasteditor) {
	            logger.debug("Notifying last editor of the document");
	            if ((null == getPreference(lasteditorname, lasteditor_preference) ||
	                    "true" == getPreference(lasteditorname, lasteditor_preference)) &&
	                    !informedUsers.contains(lasteditorname)) {
	
	                NodeRef mailLastEditorTemplate = getMailTemplate(templates.get("lasteditor"));
	                sendMail(lasteditorname, mailLastEditorTemplate, fortemplate);
	                informedUsers.add(lasteditorname);
	            }
	        }
	
	        // All associated
	        if (associated) {
	            logger.debug("Notifying users associated with the document");
	            Set<String> associatedusernames = getAssociatedUsers(versionableNode);
	            associatedusernames.removeAll(informedUsers);
	            associatedusernames.removeAll(getUnsubscribed(associatedusernames, associated_preference));
	            if (associatedusernames.size() > 0) {
	                NodeRef mailAssociatedTemplate = getMailTemplate(templates.get("associated"));
	                for (String user: associatedusernames)
	                {
	                    sendMail(user, mailAssociatedTemplate, fortemplate);
	                }
	                informedUsers.addAll(associatedusernames);
	            }
	        }
	
	        // All editors
	        if (editors) {
	            logger.debug("Notifying all previous editors of the document");
	            Set<String> editornames = getEditors(versionableNode);
	            logger.debug("Editors :" + editornames.toString());
	            editornames.removeAll(informedUsers);
	            editornames.removeAll(getUnsubscribed(editornames, editor_preference));
	            if (editornames.size() > 0) {
	                NodeRef mailEditorsTemplate = getMailTemplate(templates.get("editors"));
	                for (String user: editornames)
	                {
	                    sendMail(user, mailEditorsTemplate, fortemplate);
	                }
	                informedUsers.addAll(editornames);
	            }
	        }
	
	        // All favorited
	        if (infavorites) {
	            logger.debug("Notifying persons who favorited this document if still not");
	            Set<String> favoritednames = getFavoritedUsers(versionableNode);
	            logger.debug("Favorited :" + favoritednames.toString());
	            favoritednames.removeAll(informedUsers);
	            favoritednames.removeAll(getUnsubscribed(favoritednames, infavorites_preference));
	            if (favoritednames.size() > 0) {
	                NodeRef mailEditorsTemplate = getMailTemplate(templates.get("infavorites"));
	                for (String user: favoritednames)
	                {
	                    sendMail(user, mailEditorsTemplate, fortemplate);
	                }
	                informedUsers.addAll(favoritednames);
	            }
	        }
    	}else {
    		 logger.debug("Inform policy is offline.");
    	}

    }

    private String getDocumentCreator(NodeRef document)
    {
        logger.debug("Getting creator for the document");
        String owner = (String) nodeService.getProperty(document, ContentModel.PROP_CREATOR);
        return owner;
    }

    private String getLastEditor(Version version)
    {
        logger.debug("Getting last editor for the document");
        String editor = (String) version.getVersionProperty("creator");
        return editor;
    }

    private HashSet<String> getEditors(NodeRef document)
    {
        logger.debug("Getting complete editors history for the document");
        VersionHistory versionHistory = versionService.getVersionHistory(document);
        ArrayList<Version> allVersions = new ArrayList(versionHistory.getAllVersions());

        HashSet<String> users = new HashSet<>();
        for(Version version: allVersions)
        {
            users.add((String) version.getVersionProperty("creator"));
        }
        return users;
    }

    private Set<String> getAssociatedUsers(NodeRef versionableNode)
    {
        logger.debug("Getting associated users for the document");
        Set <String> associatedUsers = new HashSet<>();
        ArrayList<AssociationRef> associationsTarget = (ArrayList<AssociationRef>) nodeService.getTargetAssocs(versionableNode, RegexQNamePattern.MATCH_ALL);
        for (AssociationRef assoc: associationsTarget)
        {
            NodeRef target = assoc.getTargetRef();
            if (nodeService.getType(target).equals(ContentModel.TYPE_PERSON)) {
                associatedUsers.add(personService.getPerson(target).getUserName());
            }
        }
        return associatedUsers;
    }

    private Set<String> getFavoritedUsers(NodeRef versionableNode)
    {
        logger.debug("Getting favorited user from association (possible with InFavorites extension)");
        List<AssociationRef> interested = nodeService.getSourceAssocs(versionableNode, infavorites_documents_association_qname);
        interested.addAll(nodeService.getSourceAssocs(versionableNode, infavorites_folders_association_qname));
        Set<String> res = new HashSet<>();
        for (AssociationRef sourceAssoc: interested)
        {
            NodeRef person = sourceAssoc.getSourceRef();
            res.add(personService.getPerson(person).getUserName());
        }
        return res;
    }

    private NodeRef getMailTemplate(String templatePATH) throws AlfrescoRuntimeException
    {
        // If we do not handle this case, it causes nasty crash on startup
        if(repositoryState.isBootstrapping()) {
            logger.info("Mail templates are not available during repo bootstrap");
            return null;
        }

        logger.debug("Getting mail templates from repository");
        ResultSet resultSet = serviceRegistry.getSearchService().query(new StoreRef(StoreRef.PROTOCOL_WORKSPACE, "SpacesStore"), SearchService.LANGUAGE_LUCENE, templatePATH);
        if (resultSet.length() == 0) {
            // Cause we have no better solution. Because policy works
            // during deployment of system exception causes crash.
            //throw new AlfrescoRuntimeException("Can't find email template!");
            logger.error("Template node not found!");
            return null;
        }
        return resultSet.getNodeRef(0);
    }

    private void sendMail(String username, NodeRef emailTemplateNodeRef, HashMap<String, Serializable> fortemplate) throws AlfrescoRuntimeException
    {
        logger.debug("Sending notification to " + username);
        // Exit gracefully on missing template, since we can crash Alfresco startup otherwise.
        // It happens because startup procedure may bootstrap content, triggering our policy.
        if (null == emailTemplateNodeRef) {
            // Cause we have no better solution - 2.
            logger.error("Can't send email notification! Bad template node!");
            return;
        }
            Action mailAction = actionService.createAction(MailActionExecuter.NAME);
            mailAction.setParameterValue(MailActionExecuter.PARAM_TEMPLATE, emailTemplateNodeRef);
            mailAction.setParameterValue(MailActionExecuter.PARAM_SUBJECT, subject);
            mailAction.setParameterValue(MailActionExecuter.PARAM_FROM, mailfrom);
            mailAction.setParameterValue(MailActionExecuter.PARAM_TO_MANY, username);

            // Here begins magic!
            Map<String, Serializable> templateArgs = (Map<String, Serializable>) fortemplate.clone();
            templateArgs.put("firstName", nodeService.getProperty(personService.getPerson(username), ContentModel.PROP_FIRSTNAME));
            templateArgs.put("lastName", nodeService.getProperty(personService.getPerson(username), ContentModel.PROP_LASTNAME));

            Map<String, Serializable> templateModel = new HashMap<>();
            templateModel.put("args", (Serializable) templateArgs);
            mailAction.setParameterValue(MailActionExecuter.PARAM_TEMPLATE_MODEL, (Serializable) templateModel);

            actionService.executeAction(mailAction, null, false, true);
    }

    private Set<String> getUnsubscribed(Set<String> users, String subscribe_preference) {
        Set<String> unsubscribed_users = new HashSet<>();
        for (String username: users) {
            if (null != getPreference(username, subscribe_preference) &&
                    "false" == getPreference(username, subscribe_preference)) {
                unsubscribed_users.add(username);
            }
        }
        return  unsubscribed_users;
    }


    private JSONObject getPreferencesObject(String userName) throws JSONException
    {
        JSONObject jsonPrefs = null;

        // Get the user node reference
        NodeRef personNodeRef = this.personService.getPerson(userName);
        if (personNodeRef == null)
        {
            throw new AlfrescoRuntimeException("Cannot get preferences for " + userName
                    + " because he/she does not exist.");
        }

        // Check for preferences aspect
        if (this.nodeService.hasAspect(personNodeRef, ContentModel.ASPECT_PREFERENCES)) {
            // Get the preferences for this user
            ContentReader reader = this.contentService.getReader(personNodeRef,
                    ContentModel.PROP_PREFERENCE_VALUES);
            if (reader != null)
            {
                jsonPrefs = new JSONObject(reader.getContentString());
            }
        }
        return jsonPrefs;
    }

    private Serializable getPreference(String userName, String preferenceName)
    {
        String preferenceValue = null;
        try
        {
            JSONObject jsonPrefs = getPreferencesObject(userName);
            if(jsonPrefs != null)
            {
                if(jsonPrefs.has(preferenceName))
                {
                    preferenceValue = jsonPrefs.getString(preferenceName);
                }
            }
        }
        catch (JSONException exception)
        {
            throw new AlfrescoRuntimeException("Can not get preferences for " + userName + " because there was an error pasing the JSON data.", exception);
        }

        return preferenceValue;
    }

}
