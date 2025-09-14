package com.hackathon.Artificial.Intelligence.service;

import com.hackathon.Artificial.Intelligence.client.GigaChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GigaChatService {
    private final GigaChatClient client;

    public GigaChatService(@Value("${gigachat.auth-key}") String authKey) throws Exception {
        this.client = new GigaChatClient(authKey);
    }

    public String sendPrompt(String prompt) throws Exception {
        return client.sendMessage(prompt);
    }
}