package com.hackathon.Artificial.Intelligence.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import javax.net.ssl.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.UUID;
import java.nio.charset.StandardCharsets;

public class GigaChatClient {
    private static final String AUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
    private static final String CHAT_URL = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions";

    private final String authKey;
    private final HttpClient httpClient;
    private final ObjectMapper mapper;

    public GigaChatClient(String authKey) throws Exception {
        this.authKey = authKey;
        this.httpClient = createInsecureHttpClient();
        this.mapper = new ObjectMapper();
    }

    private HttpClient createInsecureHttpClient() throws Exception {
        TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                    public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                    public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                }
        };
        SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(null, trustAllCerts, new SecureRandom());
        return HttpClient.newBuilder()
                .sslContext(sslContext)
                .build();
    }

    private String getAccessToken() throws Exception {
        String rqUid = UUID.randomUUID().toString();
        HttpRequest tokenRequest = HttpRequest.newBuilder()
                .uri(URI.create(AUTH_URL))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Accept", "application/json")
                .header("RqUID", rqUid)
                .header("Authorization", "Basic " + authKey)
                .POST(HttpRequest.BodyPublishers.ofString("scope=GIGACHAT_API_PERS"))
                .build();
        String response = httpClient.send(tokenRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8)).body();
        JsonNode json = mapper.readTree(response);
        return json.get("access_token").asText();
    }

    public String sendMessage(String message) throws Exception {
        String token = getAccessToken();
        ObjectNode requestBody = mapper.createObjectNode();
        requestBody.put("model", "GigaChat-2-Pro");
        ArrayNode messages = mapper.createArrayNode();
        ObjectNode userMessage = mapper.createObjectNode();
        userMessage.put("role", "user");
        userMessage.put("content", message);
        messages.add(userMessage);
        requestBody.set("messages", messages);
        requestBody.put("stream", false);
        String body = mapper.writeValueAsString(requestBody);
        HttpRequest chatRequest = HttpRequest.newBuilder()
                .uri(URI.create(CHAT_URL))
                .header("Content-Type", "application/json; charset=utf-8")
                .header("Accept", "application/json")
                .header("Authorization", "Bearer " + token)
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .build();
        String response = httpClient.send(chatRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8)).body();
        System.out.println("RAW RESPONSE: " + response);
        JsonNode json = mapper.readTree(response);
        if (json.has("choices")) {
            return json.get("choices").get(0).get("message").get("content").asText();
        }
        if (json.has("error")) {
            return "Ошибка от сервера: " + json.toPrettyString();
        }
        return "Неизвестный ответ: " + response;
    }
}