package com.keralafit.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/coach")
public class CoachController {

    /**
     * POST /api/coach/ask
     * Receives a user query and returns a heuristic AI health coaching response.
     * In production this integrates with OpenAI ChatGPT API using the user's context.
     */
    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> askCoach(@RequestBody Map<String, String> request) {
        String query = request.getOrDefault("query", "").toLowerCase();
        String response = generateCoachResponse(query);
        return ResponseEntity.ok(Map.of("response", response));
    }

    private String generateCoachResponse(String query) {
        if (query.contains("porotta") || query.contains("parotta") || query.contains("beef")) {
            return "Porotta is made from refined Maida flour with high saturated fat content (~250-300 kcal per piece). " +
                   "Beef fry adds another 300-340 kcal. Consider switching to Wheat Chapati with Fish Curry " +
                   "or Grilled Chicken for better nutrition without sacrificing taste.";
        }
        if (query.contains("biryani") || query.contains("mandi") || query.contains("al faham")) {
            return "Al Faham is charcoal-grilled and protein-rich — a great choice! Eat it with Kubboos and salad. " +
                   "For Biryani or Mandi, consume only half the rice portion and focus on the chicken piece. " +
                   "Avoid extra ghee sauces and creamy dips which add hidden calories.";
        }
        if (query.contains("weight loss") || query.contains("diet") || query.contains("fat")) {
            return "For weight loss with a Kerala diet: (1) Create a 300-500 kcal daily deficit. " +
                   "(2) Choose Idli, Appam, or Puttu over Porotta/Dosa. " +
                   "(3) Add Kadala Curry and Sambar for plant protein. " +
                   "(4) Walk 8,000+ steps daily and drink 3L of water.";
        }
        if (query.contains("breakfast") || query.contains("morning")) {
            return "Best Kerala breakfasts: Idli + Sambar (very low fat, high protein), " +
                   "Puttu + Kadala Curry (high fiber, filling), " +
                   "Appam + Vegetable Stew (light and nutritious). " +
                   "Avoid Ghee Dosa or Poori Masala for daily breakfast.";
        }
        if (query.contains("water") || query.contains("hydration")) {
            return "Aim for 3 litres of water daily. Drinking warm Jeeraka Vellom (cumin water) in the morning " +
                   "aids digestion. Avoid sugared juices and soft drinks — replace with coconut water " +
                   "or plain water between meals.";
        }
        return "For a healthy Kerala lifestyle: prioritize steamed foods (Idli, Appam, Puttu), " +
               "choose fish over red meat, include Sambar and Avial for micronutrients, " +
               "and walk at least 30 minutes daily. Log your meals consistently for best insights!";
    }
}
