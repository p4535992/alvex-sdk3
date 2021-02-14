package com.alvexcore.repo.kvstore.mapdb;

import org.jetbrains.annotations.NotNull;
import org.mapdb.DB;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentMap;

public class AutocommitConcurrentMap implements ConcurrentMap {

    private final ConcurrentMap realMap;
    private final DB db;


    public AutocommitConcurrentMap(ConcurrentMap realMap, DB mapDB)
    {
        this.realMap = realMap;
        this.db = mapDB;
    }

    @Override
    public int size() {
        return realMap.size();
    }

    @Override
    public boolean isEmpty() {
        return realMap.isEmpty();
    }

    @Override
    public boolean containsKey(Object key) {
        return realMap.containsKey(key);
    }

    @Override
    public boolean containsValue(Object value) {
        return realMap.containsValue(value);
    }

    @Override
    public Object get(Object key) {
        return realMap.get(key);
    }

    @Override
    public Object put(Object key, Object value) {
        Object ret = realMap.put(key, value);
        db.commit();
        return ret;
    }

    @Override
    public Object remove(Object key) {
        Object ret = realMap.remove(key);
        db.commit();
        return ret;
    }

    @Override
    public void putAll(@NotNull Map m) {
        realMap.putAll(m);
        db.commit();
    }

    @Override
    public void clear() {
        realMap.clear();
        db.commit();
    }

    @NotNull
    @Override
    public Set keySet() {
        return realMap.keySet();
    }

    @NotNull
    @Override
    public Collection values() {
        return realMap.values();
    }

    @NotNull
    @Override
    public Set<Entry> entrySet() {
        return realMap.entrySet();
    }

    @Override
    public Object putIfAbsent(@NotNull Object key, Object value) {
        Object ret = realMap.putIfAbsent(key, value);
        db.commit();
        return ret;
    }

    @Override
    public boolean remove(@NotNull Object key, Object value) {
        boolean ret = realMap.remove(key, value);
        db.commit();
        return ret;
    }

    @Override
    public boolean replace(@NotNull Object key, @NotNull Object oldValue, @NotNull Object newValue) {
        boolean ret = realMap.replace(key, oldValue, newValue);
        db.commit();
        return ret;
    }

    @Override
    public Object replace(@NotNull Object key, @NotNull Object value) {
        Object ret = realMap.replace(key, value);
        db.commit();
        return ret;
    }
}
