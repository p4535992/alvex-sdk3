package com.alvexcore.repo;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.security.person.PersonServiceImpl;
import org.alfresco.service.namespace.QName;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * Extending PersonService to support middle name.
 */
public class MNamePersonServiceImpl extends PersonServiceImpl {

    private static Set<QName> mutableProperties;

    static
    {
        Set<QName> props = new HashSet<QName>();
        props.add(ContentModel.PROP_HOMEFOLDER);
        props.add(ContentModel.PROP_FIRSTNAME);
        props.add(MiddleNameContentModel.PROP_MIDDLENAME);
        props.add(ContentModel.PROP_LASTNAME);
        props.add(ContentModel.PROP_EMAIL);
        props.add(ContentModel.PROP_ORGID);
        mutableProperties = Collections.unmodifiableSet(props);
    }
    public void init() {
        super.init();
    }
    public Set<QName> getMutableProperties()
    {
        return mutableProperties;
    }
}
