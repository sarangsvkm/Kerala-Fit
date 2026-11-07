package com.keralafit.backend.controller;

import com.keralafit.backend.model.*;
import com.keralafit.backend.repository.*;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired private UserRepository userRepository;
    @Autowired private FoodLogRepository foodLogRepository;
    @Autowired private WeightLogRepository weightLogRepository;
    @Autowired private WaterLogRepository waterLogRepository;
    @Autowired private SleepLogRepository sleepLogRepository;
    @Autowired private StepLogRepository stepLogRepository;

    /**
     * GET /api/reports/weekly/pdf
     * Compiles a weekly fitness summary PDF using JasperReports and streams it back.
     */
    @GetMapping("/weekly/pdf")
    public ResponseEntity<byte[]> generateWeeklyReport(
            @AuthenticationPrincipal UserDetails userDetails) throws JRException {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow();

        LocalDateTime weekStart = LocalDate.now().minusDays(6).atStartOfDay();
        LocalDateTime weekEnd = LocalDateTime.now();

        // Gather weekly data
        List<FoodLog> foodLogs = foodLogRepository
                .findByUserIdAndLoggedAtBetweenOrderByLoggedAtDesc(user.getId(), weekStart, weekEnd);
        List<WaterLog> waterLogs = waterLogRepository
                .findByUserIdAndLoggedAtBetween(user.getId(), weekStart, weekEnd);
        List<StepLog> stepLogs = stepLogRepository
                .findByUserIdAndLoggedAtBetween(user.getId(), weekStart, weekEnd);
        List<WeightLog> weightLogs = weightLogRepository
                .findByUserIdOrderByLoggedAtDesc(user.getId());
        List<SleepLog> sleepLogs = sleepLogRepository
                .findByUserIdOrderByLoggedAtDesc(user.getId());

        // Calculate summary metrics
        int totalCalories = foodLogs.stream().mapToInt(FoodLog::getCalories).sum();
        int totalWater = waterLogs.stream().mapToInt(WaterLog::getAmount).sum();
        int totalSteps = stepLogs.stream().mapToInt(StepLog::getSteps).sum();
        double avgSleepScore = sleepLogs.stream()
                .mapToInt(SleepLog::getScore).average().orElse(0);
        double latestWeight = weightLogs.isEmpty() ? 0 : weightLogs.get(0).getWeight();

        // Build report parameters
        Map<String, Object> params = new HashMap<>();
        params.put("reportTitle", "Kerala Fit — Weekly Fitness Report");
        params.put("userName", user.getUsername());
        params.put("reportDate", LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy")));
        params.put("weekRange", weekStart.format(DateTimeFormatter.ofPattern("dd MMM")) +
                " – " + weekEnd.format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        params.put("totalCalories", totalCalories);
        params.put("totalWaterLitres", String.format("%.1f", totalWater / 1000.0));
        params.put("totalSteps", totalSteps);
        params.put("avgSleepScore", String.format("%.0f", avgSleepScore));
        params.put("latestWeight", String.format("%.1f kg", latestWeight));
        params.put("calorieGoal", user.getCalorieGoal() * 7);
        params.put("stepGoal", user.getStepGoal() * 7);

        // Build the JasperReport programmatically using a JRXML resource
        JasperReport jasperReport = JasperCompileManager.compileReport(
                getClass().getResourceAsStream("/reports/weekly_report.jrxml"));

        // Use empty datasource since all data is passed as parameters
        JasperPrint jasperPrint = JasperFillManager.fillReport(
                jasperReport, params, new JREmptyDataSource());

        // Export to PDF bytes
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        JasperExportManager.exportReportToPdfStream(jasperPrint, baos);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment",
                "Kerala_Fit_Weekly_Report_" + LocalDate.now() + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(baos.toByteArray());
    }

    /**
     * GET /api/reports/weekly/summary
     * Returns weekly summary as JSON (for in-app display without PDF).
     */
    @GetMapping("/weekly/summary")
    public ResponseEntity<Map<String, Object>> getWeeklySummary(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow();

        LocalDateTime weekStart = LocalDate.now().minusDays(6).atStartOfDay();
        LocalDateTime weekEnd = LocalDateTime.now();

        List<FoodLog> foodLogs = foodLogRepository
                .findByUserIdAndLoggedAtBetweenOrderByLoggedAtDesc(user.getId(), weekStart, weekEnd);
        List<WaterLog> waterLogs = waterLogRepository
                .findByUserIdAndLoggedAtBetween(user.getId(), weekStart, weekEnd);
        List<StepLog> stepLogs = stepLogRepository
                .findByUserIdAndLoggedAtBetween(user.getId(), weekStart, weekEnd);
        List<SleepLog> sleepLogs = sleepLogRepository
                .findByUserIdOrderByLoggedAtDesc(user.getId());
        List<WeightLog> weightLogs = weightLogRepository
                .findByUserIdOrderByLoggedAtDesc(user.getId());

        int totalCalories = foodLogs.stream().mapToInt(FoodLog::getCalories).sum();
        int totalWater = waterLogs.stream().mapToInt(WaterLog::getAmount).sum();
        int totalSteps = stepLogs.stream().mapToInt(StepLog::getSteps).sum();
        double avgSleepScore = sleepLogs.stream().mapToInt(SleepLog::getScore).average().orElse(0);
        double latestWeight = weightLogs.isEmpty() ? 0 : weightLogs.get(0).getWeight();

        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "weekTotalCalories", totalCalories,
                "weekTotalWaterMl", totalWater,
                "weekTotalSteps", totalSteps,
                "avgSleepScore", Math.round(avgSleepScore),
                "latestWeightKg", latestWeight,
                "calorieGoal", user.getCalorieGoal() * 7,
                "stepGoal", user.getStepGoal() * 7
        ));
    }
}
