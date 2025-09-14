package com.hackathon.Artificial.Intelligence.util;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class InnExtractor {
    public static List<Long> extractInns(String input) {
        List<Long> inns = new ArrayList<>();
        Pattern pattern = Pattern.compile("\\b\\d{10,12}\\b");
        Matcher matcher = pattern.matcher(input);

        while (matcher.find()) {
            try {
                inns.add(Long.parseLong(matcher.group()));
            } catch (NumberFormatException e) {}
        }
        return inns;
    }
}