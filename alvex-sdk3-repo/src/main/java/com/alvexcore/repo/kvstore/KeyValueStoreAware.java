package com.alvexcore.repo.kvstore;

import org.springframework.beans.factory.annotation.Required;

public abstract class KeyValueStoreAware {
    protected KeyValueStore keyValueStore;

    @Required
    public void setKeyValueStore(KeyValueStore keyValueStore) {
        this.keyValueStore = keyValueStore;
        keyValueStore.notifyOnReady(this);
    }

    protected abstract void onKeyValueStoreReady();
}
