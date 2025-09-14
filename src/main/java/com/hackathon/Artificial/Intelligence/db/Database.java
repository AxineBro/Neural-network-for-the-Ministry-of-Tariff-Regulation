package com.hackathon.Artificial.Intelligence.db;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.hackathon.Artificial.Intelligence.model.Organization;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.nio.charset.StandardCharsets;

public class Database {
    private Map<Long, Organization> organizations;
    private String originalJson;

    public Database() {
        try {
            String filePath = new ClassPathResource("data.txt").getFile().getPath();
            this.originalJson = new String(Files.readAllBytes(java.nio.file.Paths.get(filePath)), StandardCharsets.UTF_8);
            Gson gson = new Gson();
            Type type = new TypeToken<Map<String, Organization>>(){}.getType();
            Map<String, Organization> initialMap = gson.fromJson(originalJson, type);
            this.organizations = initialMap.values().stream()
                    .collect(Collectors.toMap(org -> Long.parseLong(org.getInn()), org -> org));
        } catch (IOException e) {
            throw new RuntimeException("Failed to load data.txt", e);
        }
    }

    public List<Organization> getOrganizationsByInn(List<Long> inns) {
        List<Organization> result = new ArrayList<>();
        for (Long inn : inns) {
            if (organizations.containsKey(inn)) {
                result.add(organizations.get(inn));
            } else {
                System.out.print("INN not found: " + inn + "\n");
            }
        }
        return result;
    }

    public Organization getOrganizationByInn(long inn) {
        return organizations.get(inn);
    }

    public List<String> getFormattedStrings() {
        List<String> formattedStrings = new ArrayList<>();
        for (Organization org : organizations.values()) {
            formattedStrings.add(String.format("%s | %s | %s | %s | %s",
                    org.getField(), org.getName(), org.getInn(), org.getReportingPeriod(), org.getPublicationDate()));
        }
        return formattedStrings;
    }

    public String getFormattedStringByInn(long inn) {
        Organization org = organizations.get(inn);
        if (org != null) {
            return String.format("%s | %s | %s | %s | %s",
                    org.getField(), org.getName(), org.getInn(), org.getReportingPeriod(), org.getPublicationDate());
        }
        return "Организация с ИНН " + inn + " не найдена.";
    }

    public List<String> getFormattedStringsByInn(List<Long> inns) {
        List<String> formattedStrings = new ArrayList<>();
        for (Long inn : inns) {
            formattedStrings.add(getFormattedStringByInn(inn));
        }
        return formattedStrings;
    }

    public String getOriginalJson() {
        return originalJson;
    }
}