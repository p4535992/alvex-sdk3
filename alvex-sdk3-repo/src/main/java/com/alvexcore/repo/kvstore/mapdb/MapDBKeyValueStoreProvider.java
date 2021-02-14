package com.alvexcore.repo.kvstore.mapdb;

import com.alvexcore.repo.kvstore.AbstractKeyValueStoreProvider;
import org.mapdb.DB;
import org.mapdb.DBMaker;
import org.springframework.beans.factory.annotation.Required;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentMap;

public class MapDBKeyValueStoreProvider extends AbstractKeyValueStoreProvider {
    public static final String ID = "mapdb";
    private String path;
    private DB mapDB;
    private Map<String, AutocommitConcurrentMap> cache = new HashMap<>();

    @Override
    public String getId() {
        return ID;
    }

    @Override
    synchronized public ConcurrentMap getStore(String storeName) {
        AutocommitConcurrentMap store = cache.get(storeName);

        if (store == null)
        {
            store = new AutocommitConcurrentMap(mapDB.hashMap(storeName).createOrOpen(), mapDB);
            cache.put(storeName, store);
        }

        return store;
    }

    @Required
    public void setPath(String path) {
        this.path = path;
    }

    @Override
    public void initialize() throws Exception {
        mapDB = DBMaker.fileDB(path)
            .transactionEnable()
            .fileMmapEnableIfSupported()
            .fileMmapPreclearDisable()
            .cleanerHackEnable()
        .make();
    }
}
