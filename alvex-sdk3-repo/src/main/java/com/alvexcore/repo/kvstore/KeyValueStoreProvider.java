package com.alvexcore.repo.kvstore;

import java.util.concurrent.ConcurrentMap;

public interface KeyValueStoreProvider {
    String getId();

    ConcurrentMap getStore(String storeName);
}
