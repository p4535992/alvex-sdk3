package com.alvexcore.share;

import org.alfresco.web.site.SlingshotUserFactory;
        import org.json.JSONException;
        import org.json.JSONObject;
        import org.springframework.extensions.surf.FrameworkUtil;
        import org.springframework.extensions.surf.RequestContext;
        import org.springframework.extensions.surf.exception.ConnectorServiceException;
        import org.springframework.extensions.surf.exception.UserFactoryException;
        import org.springframework.extensions.surf.site.AlfrescoUser;
        import org.springframework.extensions.surf.support.ThreadLocalRequestContext;
        import org.springframework.extensions.surf.util.StringBuilderWriter;
        import org.springframework.extensions.webscripts.Status;
        import org.springframework.extensions.webscripts.connector.Connector;
        import org.springframework.extensions.webscripts.connector.ConnectorContext;
        import org.springframework.extensions.webscripts.connector.HttpMethod;
        import org.springframework.extensions.webscripts.connector.Response;
        import org.springframework.extensions.webscripts.json.JSONWriter;

        import java.io.ByteArrayInputStream;
        import java.io.IOException;
        import java.util.Map;


public class MNUserFactory extends SlingshotUserFactory {

    public static final String CM_MIDDLENAME = "{http://www.alfresco.org/model/content/1.0}middleName";
    public static String PROP_CM_MIDDLENAME = "middleName";

    @Override
    protected AlfrescoUser constructUser(JSONObject properties, Map<String, Boolean> capabilities,
                                         Map<String, Boolean> immutability) throws JSONException {
        AlfrescoUser user = super.constructUser(properties, capabilities, immutability);
        user.setProperty(PROP_CM_MIDDLENAME, properties.has(CM_MIDDLENAME) ? properties.getString(CM_MIDDLENAME) : null);
        return user;
    }

    @SuppressWarnings("deprecation")
    @Override
    public void saveUser(AlfrescoUser user) throws UserFactoryException {
        RequestContext context = (RequestContext) ThreadLocalRequestContext.getRequestContext();
        if (!context.getUserId().equals(user.getId())) {
            throw new UserFactoryException("Unable to persist user with different Id that current Id.");
        }

        StringBuilderWriter buf = new StringBuilderWriter(512);
        JSONWriter writer = new JSONWriter(buf);

        try {
            writer.startObject();

            writer.writeValue("username", user.getId());

            writer.startValue("properties");
            writer.startObject();
            writer.writeValue(CM_FIRSTNAME, user.getFirstName());
            writer.writeValue(CM_LASTNAME, user.getLastName());
            writer.writeValue(CM_MIDDLENAME, user.getStringProperty(PROP_CM_MIDDLENAME));
            writer.writeValue(CM_JOBTITLE, user.getJobTitle());
            writer.writeValue(CM_ORGANIZATION, user.getOrganization());
            writer.writeValue(CM_LOCATION, user.getLocation());
            writer.writeValue(CM_EMAIL, user.getEmail());
            writer.writeValue(CM_TELEPHONE, user.getTelephone());
            writer.writeValue(CM_MOBILE, user.getMobilePhone());
            writer.writeValue(CM_SKYPE, user.getSkype());
            writer.writeValue(CM_INSTANTMSG, user.getInstantMsg());
            writer.writeValue(CM_GOOGLEUSERNAME, user.getGoogleUsername());
            writer.writeValue(CM_COMPANYADDRESS1, user.getCompanyAddress1());
            writer.writeValue(CM_COMPANYADDRESS2, user.getCompanyAddress2());
            writer.writeValue(CM_COMPANYADDRESS3, user.getCompanyAddress3());
            writer.writeValue(CM_COMPANYPOSTCODE, user.getCompanyPostcode());
            writer.writeValue(CM_COMPANYFAX, user.getCompanyFax());
            writer.writeValue(CM_COMPANYEMAIL, user.getCompanyEmail());
            writer.writeValue(CM_COMPANYTELEPHONE, user.getCompanyTelephone());



            writer.endObject();
            writer.endValue();

            writer.startValue("content");
            writer.startObject();
            writer.writeValue(CM_PERSONDESCRIPTION, user.getBiography());
            writer.endObject();
            writer.endValue();

            writer.endObject();

            Connector conn = FrameworkUtil.getConnector(context, ALFRESCO_ENDPOINT_ID);
            ConnectorContext c = new ConnectorContext(HttpMethod.POST);
            c.setContentType("application/json");
            //MOD 4535992
            //Response res = conn.call("/slingshot/profile/userprofile", c,
            Response res = conn.call("/slingshot/profile/userprofile2", c,
                    new ByteArrayInputStream(buf.toString().getBytes()));
            if (Status.STATUS_OK != res.getStatus().getCode()) {
                throw new UserFactoryException("Remote error during User save: " + res.getStatus().getMessage());
            }
        } catch (IOException ioErr) {
            throw new UserFactoryException("IO error during User save: " + ioErr.getMessage(), ioErr);
        } catch (ConnectorServiceException cse)	{
            throw new UserFactoryException("Configuration error during User save: " + cse.getMessage(), cse);
        }
    }
}