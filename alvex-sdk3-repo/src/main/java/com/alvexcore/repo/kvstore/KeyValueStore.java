package com.alvexcore.repo.kvstore;

import org.springframework.beans.factory.annotation.Required;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentMap;

public class KeyValueStore {
    private String storeImpl;

    private KeyValueStoreProvider provider;
    private List<KeyValueStoreAware> beansToNotify = new ArrayList<>();

    public ConcurrentMap getStore(String storeName)
    {
        return provider.getStore(storeName);
    }

    public void registerProvider(KeyValueStoreProvider provider) throws Exception
    {
        if (storeImpl.equals(provider.getId())) {
            if (this.provider == null) {
                this.provider = provider;
                beansToNotify.forEach(bean -> bean.onKeyValueStoreReady());
            } else
                throw new Exception(String.format("Multiple providers with the same id %s found", storeImpl));
        }
    }

    public void notifyOnReady(KeyValueStoreAware bean)
    {
        beansToNotify.add(bean);
    }

    @Required
    public void setStoreImpl(String storeImpl) {
        this.storeImpl = storeImpl;
    }
}
