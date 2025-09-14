package com.hackathon.Artificial.Intelligence.service;

import com.hackathon.Artificial.Intelligence.db.Database;
import com.hackathon.Artificial.Intelligence.model.Organization;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DatabaseService {
    private final Database db;

    public DatabaseService() {
        this.db = new Database();
    }

    public List<Organization> getOrganizationsByInns(List<Long> inns) {
        return db.getOrganizationsByInn(inns);
    }

    public Organization getOrganizationByInn(long inn) {
        return db.getOrganizationByInn(inn);
    }

    public List<String> getFormattedStrings() {
        return db.getFormattedStrings();
    }

    public String getFormattedStringByInn(long inn) {
        return db.getFormattedStringByInn(inn);
    }

    public List<String> getFormattedStringsByInn(List<Long> inns) {
        return db.getFormattedStringsByInn(inns);
    }

    public String getOriginalJson() {
        return db.getOriginalJson();
    }
}