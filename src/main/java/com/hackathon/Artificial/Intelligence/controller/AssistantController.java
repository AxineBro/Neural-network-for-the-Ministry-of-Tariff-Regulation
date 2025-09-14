package com.hackathon.Artificial.Intelligence.controller;

import com.hackathon.Artificial.Intelligence.model.Organization;
import com.hackathon.Artificial.Intelligence.service.DatabaseService;
import com.hackathon.Artificial.Intelligence.service.ExcelService;
import com.hackathon.Artificial.Intelligence.service.ExtractionService;
import com.hackathon.Artificial.Intelligence.service.GigaChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {
    private static final Logger logger = LoggerFactory.getLogger(AssistantController.class);

    @Autowired private ExtractionService extractionService;
    @Autowired private DatabaseService dbService;
    @Autowired private GigaChatService gigaChatService;
    @Autowired private ExcelService excelService;

    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processRequest(@RequestBody Map<String, String> request) {
        try {
            String fragment = request.getOrDefault("fragment", "Без стандарта");
            String organizationsText = request.getOrDefault("organizations", "");
            logger.info("Received request: fragment={}, organizations={}", fragment, organizationsText);

            // Извлечь ИНН
            List<Long> inns = extractionService.extractInns(organizationsText);
            logger.debug("Extracted INNs: {}", inns);

            // Получить данные из БД
            List<Organization> orgs = dbService.getOrganizationsByInns(inns);
            logger.debug("Found organizations: {}", orgs);
            if (orgs.isEmpty()) {
                logger.warn("No organizations found for INNs: {}", inns);
                return ResponseEntity.ok(Map.of("displayText", "Не найдено организаций по указанным ИНН", "excelBase64", ""));
            }
            // Сформировать промпт
            StringBuilder inputData = new StringBuilder();
            inputData.append("Стандарт раскрытия:\n").append(fragment).append("\n\nОрганизации за 2024 год:\n");
            for (int i = 0; i < orgs.size(); i++) {
                Organization org = orgs.get(i);
                inputData.append(i + 1).append(". ").append(org.getName()).append(" (ИНН ").append(org.getInn())
                        .append("). Дата публикации: ").append(org.getPublicationDate() != null ? org.getPublicationDate() : "—")
                        .append(".\n");
            }
            String prompt = getPromptTemplate() + inputData.toString();
            logger.debug("Generated prompt: {}", prompt);

            // Отправить в GigaChat
            String aiResponse = gigaChatService.sendPrompt(prompt);
            logger.info("GigaChat response: {}", aiResponse);

            // Парсить ответ GigaChat
            Map<String, String> statuses = parseAiResponse(aiResponse);
            logger.debug("Parsed statuses: {}", statuses);

            // Сформировать отображаемый результат
            List<String> displayResults = new ArrayList<>();
            for (int i = 0; i < orgs.size(); i++) {
                Organization org = orgs.get(i);
                String status = statuses.getOrDefault(org.getName(), "не раскрыто");
                displayResults.add((i + 1) + ". " + org.getName() + " – " + status);
            }
            String displayText = "Результат проверки по стандарту:\n" + String.join("\n", displayResults);
            logger.debug("Display text: {}", displayText);

            // Генерация Excel
            byte[] excelBytes = excelService.generateExcel(orgs, statuses);
            String excelBase64 = Base64.getEncoder().encodeToString(excelBytes);
            logger.debug("Generated Excel, base64 length: {}", excelBase64.length());

            // Ответ
            Map<String, Object> response = new HashMap<>();
            response.put("displayText", displayText);
            response.put("excelBase64", excelBase64);
            logger.info("Returning response: {}", response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing request", e);
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/download-excel")
    public ResponseEntity<byte[]> downloadExcel(@RequestParam String base64) {
        try {
            byte[] excelBytes = Base64.getDecoder().decode(base64);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "organizations.xlsx");
            return ResponseEntity.ok().headers(headers).body(excelBytes);
        } catch (Exception e) {
            logger.error("Error downloading Excel", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    private String getPromptTemplate() {
        return """
                Ты – эксперт по анализу нормативных документов и мониторингу раскрытия информации регулируемыми организациями. 
                Твоя задача – определить статус раскрытия информации для каждой организации на основе текста стандарта раскрытия и предоставленных данных.

                Правила классификации:
                - Сравнивай даты строго в формате ДД.ММ.ГГГГ.
                - Если информация опубликована до или в день установленного срока (30.04.2025 включительно) → "своевременно".
                - Если опубликована после установленного срока (после 30.04.2025) → "с нарушением срока".
                - Если дата публикации указана как "—" или отсутствует → "не раскрыто".
                - Убедись, что сравнение дат выполнено корректно, учитывая порядок: день, месяц, год.

                Формат ответа:
                Для каждой организации верни строку в формате:
                <Название организации> – <статус>

                Пример:
                ООО "Пример" – своевременно

                ---
                Входные данные:
                """;
    }

    private Map<String, String> parseAiResponse(String response) {
        logger.info("Raw AI response for parsing: {}", response);
        Map<String, String> statuses = new HashMap<>();
        if (response.contains("предоставьте данные")) {
            logger.warn("GigaChat did not process data: {}", response);
            throw new RuntimeException("GigaChat requires more data: " + response);
        }
        for (String line : response.split("\n")) {
            if (line.contains("–")) {
                String[] parts = line.split("–");
                if (parts.length == 2) {
                    statuses.put(parts[0].trim(), parts[1].trim());
                }
            }
        }
        if (statuses.isEmpty()) {
            logger.warn("No statuses parsed: {}", response);
        }
        return statuses;
    }
}