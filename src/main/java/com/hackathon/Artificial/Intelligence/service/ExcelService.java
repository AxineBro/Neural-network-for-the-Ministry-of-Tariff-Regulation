package com.hackathon.Artificial.Intelligence.service;

import com.hackathon.Artificial.Intelligence.model.Organization;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class ExcelService {
    public byte[] generateExcel(List<Organization> orgs, Map<String, String> statuses) {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Organizations");

        // Заголовки
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Организация");
        header.createCell(1).setCellValue("ИНН");
        header.createCell(2).setCellValue("КПП");
        header.createCell(3).setCellValue("Сфера услуг");
        header.createCell(4).setCellValue("Опубликование");
        header.createCell(5).setCellValue("Дата опубликования");
        header.createCell(6).setCellValue("Нарушение сроков раскрытия (да/нет)");

        // Данные
        int rowNum = 1;
        for (Organization org : orgs) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(org.getName());
            row.createCell(1).setCellValue(org.getInn());
            row.createCell(2).setCellValue(org.getKpp());
            row.createCell(3).setCellValue(org.getField());
            String status = statuses.getOrDefault(org.getName(), "не раскрыто");
            row.createCell(4).setCellValue(status);
            row.createCell(5).setCellValue(org.getPublicationDate() != null ? org.getPublicationDate() : "—");
            row.createCell(6).setCellValue(status.contains("нарушением") || status.contains("не раскрыто") ? "да" : "нет");
        }

        try (ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            workbook.write(bos);
            workbook.close();
            return bos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel", e);
        }
    }
}