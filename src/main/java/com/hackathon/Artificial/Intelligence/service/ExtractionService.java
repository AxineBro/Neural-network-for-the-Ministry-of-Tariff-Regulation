package com.hackathon.Artificial.Intelligence.service;

import com.hackathon.Artificial.Intelligence.util.InnExtractor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExtractionService {
    public List<Long> extractInns(String input) {
        return InnExtractor.extractInns(input);
    }
}