package com.keralafit.backend.controller;

import com.keralafit.backend.model.*;
import com.keralafit.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tracker")
public class TrackerController {

    @Autowired private UserRepository userRepository;
    @Autowired private FoodLogRepository foodLogRepository;
    @Autowired private WeightLogRepository weightLogRepository;
    @Autowired private WaterLogRepository waterLogRepository;
    @Autowired private SleepLogRepository sleepLogRepository;
    @Autowired private StepLogRepository stepLogRepository;
    @Autowired private WorkoutLogRepository workoutLogRepository;

    private User resolveUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ─── FOOD LOGS ───────────────────────────────────────────────────────────────

    @GetMapping("/food")
    public ResponseEntity<List<FoodLog>> getFoodLogs(@AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        return ResponseEntity.ok(foodLogRepository.findByUserIdOrderByLoggedAtDesc(user.getId()));
    }

    @PostMapping("/food")
    public ResponseEntity<FoodLog> addFoodLog(@AuthenticationPrincipal UserDetails userDetails,
                                              @RequestBody FoodLog request) {
        User user = resolveUser(userDetails);
        request.setUser(user);
        request.setLoggedAt(LocalDateTime.now());
        return ResponseEntity.ok(foodLogRepository.save(request));
    }

    @DeleteMapping("/food/{id}")
    public ResponseEntity<?> deleteFoodLog(@PathVariable java.util.UUID id) {
        foodLogRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Food log deleted"));
    }

    // ─── WEIGHT LOGS ─────────────────────────────────────────────────────────────

    @GetMapping("/weight")
    public ResponseEntity<List<WeightLog>> getWeightLogs(@AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        return ResponseEntity.ok(weightLogRepository.findByUserIdOrderByLoggedAtDesc(user.getId()));
    }

    @PostMapping("/weight")
    public ResponseEntity<WeightLog> addWeightLog(@AuthenticationPrincipal UserDetails userDetails,
                                                   @RequestBody WeightLog request) {
        User user = resolveUser(userDetails);
        request.setUser(user);
        request.setLoggedAt(LocalDateTime.now());
        return ResponseEntity.ok(weightLogRepository.save(request));
    }

    @DeleteMapping("/weight/{id}")
    public ResponseEntity<?> deleteWeightLog(@PathVariable java.util.UUID id) {
        weightLogRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Weight log deleted"));
    }

    // ─── WATER LOGS ──────────────────────────────────────────────────────────────

    @GetMapping("/water")
    public ResponseEntity<List<WaterLog>> getWaterLogs(@AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        return ResponseEntity.ok(waterLogRepository.findByUserIdOrderByLoggedAtDesc(user.getId()));
    }

    @PostMapping("/water")
    public ResponseEntity<WaterLog> addWaterLog(@AuthenticationPrincipal UserDetails userDetails,
                                                 @RequestBody WaterLog request) {
        User user = resolveUser(userDetails);
        request.setUser(user);
        request.setLoggedAt(LocalDateTime.now());
        return ResponseEntity.ok(waterLogRepository.save(request));
    }

    @DeleteMapping("/water/{id}")
    public ResponseEntity<?> deleteWaterLog(@PathVariable java.util.UUID id) {
        waterLogRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Water log deleted"));
    }

    // ─── SLEEP LOGS ──────────────────────────────────────────────────────────────

    @GetMapping("/sleep")
    public ResponseEntity<List<SleepLog>> getSleepLogs(@AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        return ResponseEntity.ok(sleepLogRepository.findByUserIdOrderByLoggedAtDesc(user.getId()));
    }

    @PostMapping("/sleep")
    public ResponseEntity<SleepLog> addSleepLog(@AuthenticationPrincipal UserDetails userDetails,
                                                  @RequestBody SleepLog request) {
        User user = resolveUser(userDetails);
        request.setUser(user);
        request.setLoggedAt(LocalDateTime.now());
        return ResponseEntity.ok(sleepLogRepository.save(request));
    }

    @DeleteMapping("/sleep/{id}")
    public ResponseEntity<?> deleteSleepLog(@PathVariable java.util.UUID id) {
        sleepLogRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Sleep log deleted"));
    }

    // ─── STEP LOGS ───────────────────────────────────────────────────────────────

    @GetMapping("/steps")
    public ResponseEntity<List<StepLog>> getStepLogs(@AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        return ResponseEntity.ok(stepLogRepository.findByUserIdOrderByLoggedAtDesc(user.getId()));
    }

    @PostMapping("/steps")
    public ResponseEntity<StepLog> addStepLog(@AuthenticationPrincipal UserDetails userDetails,
                                               @RequestBody StepLog request) {
        User user = resolveUser(userDetails);
        request.setUser(user);
        request.setLoggedAt(LocalDateTime.now());
        return ResponseEntity.ok(stepLogRepository.save(request));
    }

    // ─── WORKOUT LOGS ────────────────────────────────────────────────────────────

    @GetMapping("/workouts")
    public ResponseEntity<List<WorkoutLog>> getWorkoutLogs(@AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        return ResponseEntity.ok(workoutLogRepository.findByUserIdOrderByLoggedAtDesc(user.getId()));
    }

    @PostMapping("/workouts")
    public ResponseEntity<WorkoutLog> addWorkoutLog(@AuthenticationPrincipal UserDetails userDetails,
                                                     @RequestBody WorkoutLog request) {
        User user = resolveUser(userDetails);
        request.setUser(user);
        request.setLoggedAt(LocalDateTime.now());
        return ResponseEntity.ok(workoutLogRepository.save(request));
    }

    // ─── TODAY'S SUMMARY ─────────────────────────────────────────────────────────

    @GetMapping("/summary/today")
    public ResponseEntity<Map<String, Object>> getTodaySummary(@AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = start.plusDays(1);

        List<FoodLog> todayFood = foodLogRepository
                .findByUserIdAndLoggedAtBetweenOrderByLoggedAtDesc(user.getId(), start, end);
        List<WaterLog> todayWater = waterLogRepository
                .findByUserIdAndLoggedAtBetween(user.getId(), start, end);
        List<StepLog> todaySteps = stepLogRepository
                .findByUserIdAndLoggedAtBetween(user.getId(), start, end);

        int totalCalories = todayFood.stream().mapToInt(FoodLog::getCalories).sum();
        int totalWater = todayWater.stream().mapToInt(WaterLog::getAmount).sum();
        int totalSteps = todaySteps.stream().mapToInt(StepLog::getSteps).sum();

        return ResponseEntity.ok(Map.of(
                "totalCalories", totalCalories,
                "totalWaterMl", totalWater,
                "totalSteps", totalSteps,
                "calorieGoal", user.getCalorieGoal(),
                "waterGoal", user.getWaterGoal(),
                "stepGoal", user.getStepGoal()
        ));
    }
}
