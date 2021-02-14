package com.alvexcore.repo.kvstore;

import org.springframework.beans.factory.InitializingBean;

public abstract class AbstractKeyValueStoreProvider implements KeyValueStoreProvider, InitializingBean {

    private KeyValueStore store;

    public void setStore(KeyValueStore store) throws Exception {
        this.store = store;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        initialize();
        store.registerProvider(this);
    }

    protected abstract void initialize() throws Exception;
}
