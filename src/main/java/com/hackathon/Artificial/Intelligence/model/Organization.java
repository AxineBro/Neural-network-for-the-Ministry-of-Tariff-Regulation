package com.hackathon.Artificial.Intelligence.model;

public class Organization {
    private String id;
    private String url;
    private String field;
    private String reportingPeriod;
    private String publicationDate;
    private String name;
    private String inn;
    private String kpp;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getField() { return field; }
    public void setField(String field) { this.field = field; }
    public String getReportingPeriod() { return reportingPeriod; }
    public void setReportingPeriod(String reportingPeriod) { this.reportingPeriod = reportingPeriod; }
    public String getPublicationDate() { return publicationDate; }
    public void setPublicationDate(String publicationDate) { this.publicationDate = publicationDate; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getInn() { return inn; }
    public void setInn(String inn) { this.inn = inn; }
    public String getKpp() { return kpp; }
    public void setKpp(String kpp) { this.kpp = kpp; }

    @Override
    public String toString() {
        return "Organization{" +
                "id='" + id + '\'' +
                ", field='" + field + '\'' +
                ", reportingPeriod='" + reportingPeriod + '\'' +
                ", publicationDate='" + publicationDate + '\'' +
                ", name='" + name + '\'' +
                ", inn='" + inn + '\'' +
                ", kpp='" + kpp + '\'' +
                '}';
    }
}