"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Play, Square, Bot, User, CheckCircle, MessageSquare, Code, Trash2, Clock, Star, History, X, Menu, ChevronRight, Sparkles, Target } from "lucide-react";
import dynamic from "next/dynamic";
import { getInterviewHistory, deleteInterview } from "@/services/api";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });


// ─── roles.ts ───────────────────────────────────────────────────────────────

const TARGET_ROLES = [
    // Software Engineering
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile App Developer (Android)",
    "Mobile App Developer (iOS)",

    // Data & AI
    "Data Scientist",
    "Data Analyst",
    "Machine Learning Engineer",
    "Deep Learning Engineer",
    "Generative AI / LLM Engineer",
    "Computer Vision Engineer",
    "NLP Engineer",
    "MLOps Engineer",
    "Data Engineer",

    // Infrastructure & Cloud
    "DevOps Engineer",
    "Site Reliability Engineer (SRE)",
    "Cloud Engineer",
    "Cloud Architect",

    // Security
    "Cybersecurity Analyst",
    "Security Engineer",
    "Penetration Tester",

    // Product & Design
    "Product Manager",
    "Technical Product Manager",
    "UI/UX Designer",

    // Specialized Engineering
    "Blockchain Developer",
    "Game Developer",
    "AR/VR Developer",
    "Embedded Systems / IoT Engineer",
    "Robotics & Automation Engineer",
    "QA / Test Engineer",
    "Solutions Architect",
    "Research Engineer",
] as const;

type TargetRole = (typeof TARGET_ROLES)[number];


// ─── companies.ts ────────────────────────────────────────────────────────────

type CompanyTier = "FAANG" | "top-indian-product" | "indian-service" | "fintech" | "mid-product" | "hardware" | "gaming" | "security" | "hft" | "other";

interface CompanyProfile {
    name: string;
    tier: CompanyTier;
    interviewStyle: string;   // injected into agent system_message
    active: boolean;          // set false for bankrupt/layoff-heavy companies
}

const COMPANY_PROFILES: CompanyProfile[] = [
    // ── FAANG / Big Tech ──────────────────────────────────────────────────────
    {
        name: "Google", tier: "FAANG", active: true,
        interviewStyle: "LC-hard DSA (graph/trie/dp optimizations), 4-system design rounds with Google-scale distributed systems, Googleyness + leadership, 'how would you design YouTube search?'"
    },
    {
        name: "Microsoft", tier: "FAANG", active: true,
        interviewStyle: "LC-medium/hard (tree/array manipulations), 2 design interviews (low-level + high-level), growth mindset: 'tell me about a time you failed and learned', possible 'how does Windows scheduler work?'"
    },
    {
        name: "Amazon", tier: "FAANG", active: true,
        interviewStyle: "5 Leadership Principles rounds (STAR grilled hard), LC-medium DSA but tricky edge cases, Bar Raiser will ask 'design Amazon's inventory system at 1M orders/sec'"
    },
    {
        name: "Apple", tier: "FAANG", active: true,
        interviewStyle: "Deep domain expertise (ARM/Metal/Swift depending on team), practical coding on Xcode, 'how would you improve iPhone battery life by 10%?', quality obsession"
    },
    {
        name: "Adobe", tier: "FAANG", active: true,
        interviewStyle: "LC-medium with creative twist (image processing algos), system design for creative cloud, deep-dive into past projects: 'how did you optimize that O(n²) solution?'"
    },
    {
        name: "Oracle", tier: "FAANG", active: true,
        interviewStyle: "Database internals deep-dive (B+ trees, MVCC, query optimization), LC-medium (SQL-heavy sometimes), 'design a distributed transaction coordinator'"
    },
    {
        name: "Salesforce", tier: "FAANG", active: true,
        interviewStyle: "LC-medium (multithreading often), multi-tenant SaaS design, Ohana values: 'how do you mentor juniors?', Apex/triggers knowledge plus"
    },
    {
        name: "SAP", tier: "FAANG", active: true,
        interviewStyle: "Enterprise integration puzzles, LC-easy/medium (ABAP or Java), solution architecture: 'design a supply chain demand forecasting module'"
    },
    {
        name: "Meta", tier: "FAANG", active: true,
        interviewStyle: "LC-hard (graph BFS/DFS with optimizations 45min), system design for social graph: 'design Facebook friend recommendation', behavioral: move fast culture"
    },
    {
        name: "Netflix", tier: "FAANG", active: true,
        interviewStyle: "Culture-fit heavy (freedom & responsibility), system design for chaos engineering, fault tolerance, LC-hard DP, 'how would you design Netflix's CDN?'"
    },
    {
        name: "Uber", tier: "FAANG", active: true,
        interviewStyle: "LC-hard (geospatial + priority queues), real-time dispatch: 'design Uber eats matching at 50k orders/min', strong distributed systems with circuit breakers"
    },
    {
        name: "Airbnb", tier: "FAANG", active: true,
        interviewStyle: "Front-end React/Backend distributed, LC-medium/hard with product sense: 'design a pricing recommendation engine', pixel-perfect expectation"
    },
    {
        name: "Atlassian", tier: "FAANG", active: true,
        interviewStyle: "Pair programming live (they code with you), LC-medium (Jira-like ticket system design), 'how would you add real-time collaboration to Confluence?'"
    },

    // ── AI Research & Infrastructure ──────────────────────────────────────────
    {
        name: "OpenAI", tier: "FAANG", active: true,
        interviewStyle: "Large-scale distributed training, 'optimize a transformer kernel for 100k tokens/sec', RLHF theory, LC-hard (concurrency heavy), safety alignment"
    },
    {
        name: "Anthropic", tier: "FAANG", active: true,
        interviewStyle: "Constitutional AI principles, 'design a robust evaluation framework for model bias', LC-hard, deep dive into LLM scaling laws"
    },
    {
        name: "Hugging Face", tier: "mid-product", active: true,
        interviewStyle: "Open-source ecosystem, 'design a versioned model registry for 1M models', LC-medium/hard, PyTorch/JAX internals, community-first engineering"
    },
    {
        name: "Mistral AI", tier: "mid-product", active: true,
        interviewStyle: "Efficient inference, 'design a MoE (Mixture of Experts) routing layer', low-latency C++/CUDA, sparse attention mechanisms"
    },
    {
        name: "Databricks", tier: "FAANG", active: true,
        interviewStyle: "Spark internals, 'optimize a distributed join for 10PB of data', Lakehouse architecture, LC-hard DSA, query optimizer design"
    },
    {
        name: "Snowflake", tier: "FAANG", active: true,
        interviewStyle: "Multi-tenant data warehouse, 'design a cloud-agnostic storage layer with 99.999% durability', LC-hard, SQL engine performance"
    },
    {
        name: "Cohere", tier: "mid-product", active: true,
        interviewStyle: "Enterprise RAG (Retrieval Augmented Generation), 'design a vector database connector with sub-10ms latency', LC-medium/hard, NLP depth"
    },
    {
        name: "Perplexity", tier: "mid-product", active: true,
        interviewStyle: "Real-time search & synthesis, 'design a streaming response aggregator for multi-source RAG', LC-medium/hard, product-focused AI"
    },

    // ── Top Indian Product ────────────────────────────────────────────────────
    {
        name: "Zerodha", tier: "top-indian-product", active: true,
        interviewStyle: "No-fluff: live trading system design, idempotency of orders, fintech depth: 'how to prevent double debit?', LC-medium (but practical only)"
    },
    {
        name: "Razorpay", tier: "top-indian-product", active: true,
        interviewStyle: "Payments webhook reliability, idempotency keys, 'design a fraud detection rule engine', LC-medium with concurrency questions"
    },
    {
        name: "CRED", tier: "top-indian-product", active: true,
        interviewStyle: "Premium app design, 'reverse engineer our referral leaderboard', LC-medium, product intuition: 'why does CRED use gamification?'"
    },
    {
        name: "PhonePe", tier: "top-indian-product", active: true,
        interviewStyle: "UPI switch design, transaction reconciliation at scale, LC-medium DSA (sliding window problems), 'design a bill payment reminder system'"
    },
    {
        name: "Groww", tier: "top-indian-product", active: true,
        interviewStyle: "Mutual fund order routing, 'design a stock price ticker at 100ms latency', LC-medium, startup ownership: 'describe your fastest feature launch'"
    },
    {
        name: "Postman", tier: "top-indian-product", active: true,
        interviewStyle: "API lifecycle depth, 'design a request mock server with matching rules', LC-medium, developer tooling: 'how to improve API collection runner?'"
    },
    {
        name: "BrowserStack", tier: "top-indian-product", active: true,
        interviewStyle: "Browser VM orchestration, 'design a parallel test execution framework', LC-medium, cross-browser quirks knowledge expected"
    },
    {
        name: "Freshworks", tier: "top-indian-product", active: true,
        interviewStyle: "SaaS multi-tenant data isolation, LC-medium, 'design a ticket SLA escalation engine', customer-centric metrics"
    },
    {
        name: "Zoho", tier: "top-indian-product", active: true,
        interviewStyle: "Strong CS fundamentals (OS + DBMS grilled), practical low-level design, 'build a mini Excel formula parser', LC-easy but thorough"
    },
    {
        name: "Ola Electric", tier: "top-indian-product", active: true,
        interviewStyle: "IoT + EV telemetry processing, 'design a battery health prediction system', LC-medium, hardware-software integration"
    },
    {
        name: "Unacademy", tier: "top-indian-product", active: true,
        interviewStyle: "Ed-tech content delivery, 'design a live class recording system', LC-medium, CDN caching strategies"
    },
    {
        name: "ShareChat", tier: "top-indian-product", active: true,
        interviewStyle: "Social media at India-scale, 'design a viral feed for regional languages', LC-medium/hard with recommendation basics"
    },

    // ── E-commerce & Consumer ─────────────────────────────────────────────────
    {
        name: "Flipkart", tier: "mid-product", active: true,
        interviewStyle: "LC-medium/hard (graph + heap), e-commerce scale: 'design Flipkart's Big Billion Days inventory service', warehouse allocation puzzles"
    },
    {
        name: "Swiggy", tier: "mid-product", active: true,
        interviewStyle: "Real-time logistics matching, 'design a delivery agent assignment algorithm with surge', LC-medium DSA, SLA breach handling"
    },
    {
        name: "Zomato", tier: "mid-product", active: true,
        interviewStyle: "Restaurant search ranking, 'design a restaurant discovery with dynamic filters', LC-medium, hyperlocal caching strategies"
    },
    {
        name: "Meesho", tier: "mid-product", active: true,
        interviewStyle: "Social commerce graph, 'design a reseller commission tracking system', LC-medium, frugal engineering with WhatsApp API integration"
    },
    {
        name: "Ola", tier: "mid-product", active: true,
        interviewStyle: "MAPS API integration, 'design a real-time ETA prediction', LC-medium DSA (Dijkstra variations), mobility platform"
    },
    {
        name: "Nykaa", tier: "mid-product", active: true,
        interviewStyle: "Inventory management for beauty, 'design a flash sale checkout system', LC-easy/medium, D2C thinking"
    },
    {
        name: "InMobi", tier: "mid-product", active: true,
        interviewStyle: "Ad-tech real-time bidding (RTB), 'design an ad auction with 100ms SLA', LC-medium, DSP/SSP knowledge plus"
    },
    {
        name: "Paytm", tier: "mid-product", active: true,
        interviewStyle: "Super-app scale: 'design a QR code payment retry logic with idempotency', LC-medium, high-throughput system design"
    },
    {
        name: "Dream11", tier: "mid-product", active: true,
        interviewStyle: "Fantasy sports team validation, 'design a live score updater under 1 sec latency', LC-medium, concurrency + leaderboard"
    },
    {
        name: "Myntra", tier: "mid-product", active: true,
        interviewStyle: "Fashion recommendation engine, 'design a size recommendation system', LC-medium, returns logistics puzzles"
    },
    {
        name: "Maersk", tier: "mid-product", active: true,
        interviewStyle: "Global logistics visibility, 'design a container tracking system with IoT telemetry', LC-medium, supply chain resilience"
    },
    {
        name: "HighRadius", tier: "mid-product", active: true,
        interviewStyle: "AI-driven treasury management, 'design an automated invoice matching engine', LC-medium, B2B SaaS architecture"
    },
    {
        name: "Delhivery", tier: "mid-product", active: true,
        interviewStyle: "Last-mile delivery optimization, 'design a courier routing algorithm for 1M parcels/day', LC-medium/hard, high-throughput ingestion"
    },
    {
        name: "FedEx", tier: "mid-product", active: true,
        interviewStyle: "Global shipment orchestration, 'design a cross-border logistics clearing house simulation', LC-medium, legacy modernization"
    },
    {
        name: "DHL", tier: "mid-product", active: true,
        interviewStyle: "Supply chain digitization, 'design a warehouse automation sensor dashboard', LC-medium, inventory forecasting"
    },
    {
        name: "Blue Dart", tier: "mid-product", active: true,
        interviewStyle: "Express delivery networks, 'design a flight-based shipment scheduling system', LC-easy/medium, reliability and SLA tracking"
    },
    {
        name: "Rivigo", tier: "mid-product", active: true,
        interviewStyle: "Relay trucking logistics, 'design a driver-relay matching algorithm with real-time ETA', LC-medium, geospatial indexing"
    },
    {
        name: "Shadowfax", tier: "mid-product", active: true,
        interviewStyle: "Hyperlocal delivery fleet, 'design a multi-tenant gig-economy task allocator', LC-medium, real-time surge pricing"
    },

    // ── Fintech ───────────────────────────────────────────────────────────────
    {
        name: "NPCI", tier: "fintech", active: true,
        interviewStyle: "UPI switch infrastructure, transaction reconciliation at India-scale, 'design a real-time fraud detection for UPI', idempotency in payments"
    },
    {
        name: "Pine Labs", tier: "fintech", active: true,
        interviewStyle: "POS terminal reconciliation, 'design an offline payment capture system', LC-medium, embedded fintech + EMI logic"
    },
    {
        name: "PolicyBazaar", tier: "fintech", active: true,
        interviewStyle: "Insurance comparison engine, 'design a premium calculation rule engine with 500+ rules', LC-medium, web scraper design"
    },
    {
        name: "JPMorgan", tier: "fintech", active: true,
        interviewStyle: "Object-oriented design for trading platform, LC-medium (core Java/C++), 'design a limit order book', financial derivatives basics"
    },
    {
        name: "Goldman Sachs", tier: "fintech", active: true,
        interviewStyle: "Quant-heavy: DP + math, LC-hard, 'design a risk calculation system for derivatives', low-latency C++ expectations"
    },
    {
        name: "Stripe", tier: "fintech", active: true,
        interviewStyle: "Bug squash round (live debugging), pair programming API design, 'design a webhook delivery system with exponential backoff', high bar"
    },
    {
        name: "PayPal", tier: "fintech", active: true,
        interviewStyle: "Distributed transaction monitoring, LC-medium, 'design a fraud detection rule engine', REST API security deep-dive"
    },
    {
        name: "Coinbase", tier: "fintech", active: true,
        interviewStyle: "Blockchain transaction handling, 'design a crypto wallet with double-spend prevention', LC-medium/hard, Web3 knowledge plus"
    },
    {
        name: "Niyo", tier: "fintech", active: true,
        interviewStyle: "Neobanking international travel card, 'design forex rate alert system', LC-medium, zero-balance account logic"
    },
    {
        name: "BharatPe", tier: "fintech", active: true,
        interviewStyle: "QR code lending, 'design a merchant cash advance repayment tracker', LC-medium, UPI switching insights"
    },
    {
        name: "ICICI Bank", tier: "fintech", active: true,
        interviewStyle: "Banking API security, 'design a secure mobile banking login with MFA', LC-easy/medium, transaction atomicity"
    },
    {
        name: "Axis Bank", tier: "fintech", active: true,
        interviewStyle: "Retail banking digital transformation, 'design a credit card reward point ledger', LC-easy/medium, RDBMS deep-dive"
    },

    // ── IT Services ───────────────────────────────────────────────────────────
    {
        name: "TCS", tier: "indian-service", active: true,
        interviewStyle: "NQT style: aptitude + coding, LC-easy (array rotation, string palindrome), 'identify output of this C pointer code', communication"
    },
    {
        name: "Infosys", tier: "indian-service", active: true,
        interviewStyle: "Specialist role: Java concurrency or Spring boot, LC-easy, 'design an employee leave management system', articulation matters"
    },
    {
        name: "Wipro", tier: "indian-service", active: true,
        interviewStyle: "Turbo coding: 2 LC-easy in 30 mins, OOPS concepts grilled, 'explain polymorphism with real example', project walkthrough"
    },
    {
        name: "HCLTech", tier: "indian-service", active: true,
        interviewStyle: "Domain-specific (networking/cloud), LC-easy, 'write SQL query for second highest salary', client handling scenarios"
    },
    {
        name: "Tech Mahindra", tier: "indian-service", active: true,
        interviewStyle: "5G knowledge plus, LC-easy (recursion basics), 'debug this Java code snippet', telecom domain"
    },
    {
        name: "LTIMindtree", tier: "indian-service", active: true,
        interviewStyle: "Full stack basics, LC-easy/medium (two-sum variation), 'design a mini shopping cart REST API', delivery mindset"
    },
    {
        name: "Cognizant", tier: "indian-service", active: true,
        interviewStyle: "Genc next: LC-easy (array + string), 'what happens when you type URL?', client communication simulation"
    },
    {
        name: "Mphasis", tier: "indian-service", active: true,
        interviewStyle: "Fintech adjacent: basic transaction processing, LC-easy, 'design a simple bank account class', cloud basics (AWS EC2)"
    },
    {
        name: "Accenture", tier: "indian-service", active: true,
        interviewStyle: "Agile + cloud basics, LC-easy/medium, 'describe a sprint where you delivered under pressure', consulting scenario"
    },
    {
        name: "IBM", tier: "indian-service", active: true,
        interviewStyle: "Enterprise integration puzzles, LC-easy/medium, 'design a message queue with pub-sub', legacy modernization"
    },
    {
        name: "Capgemini", tier: "indian-service", active: true,
        interviewStyle: "Basic OOPS + database normalization, LC-easy, 'explain 3NF with example', Excel for client communication"
    },
    {
        name: "Deloitte USI", tier: "indian-service", active: true,
        interviewStyle: "Consulting + tech: 'design an expense approval workflow', LC-easy, case interview with ROI calculation"
    },
    {
        name: "PwC India", tier: "indian-service", active: true,
        interviewStyle: "Consulting + tech: 'design an expense approval workflow', LC-easy, client pitch simulation"
    },
    {
        name: "EY India", tier: "indian-service", active: true,
        interviewStyle: "Risk advisory and digital transformation, 'design a regulatory compliance tracker', LC-easy/medium, SQL heavy"
    },
    {
        name: "KPMG India", tier: "indian-service", active: true,
        interviewStyle: "Business consulting + data, 'solve this supply chain optimization case', LC-easy, data storytelling"
    },
    {
        name: "Hexaware", tier: "indian-service", active: true,
        interviewStyle: "Automation-first mindset, 'how to automate this manual testing scenario?', LC-easy, cloud basics"
    },
    {
        name: "DXC Technology", tier: "indian-service", active: true,
        interviewStyle: "Modern IT operations, 'design a system health monitoring dashboard', LC-easy, ITSM knowledge"
    },
    {
        name: "Coforge", tier: "indian-service", active: true,
        interviewStyle: "Travel and insurance domain focus, 'design a flight booking retry logic', LC-easy/medium, API design"
    },
    {
        name: "Infogain", tier: "indian-service", active: true,
        interviewStyle: "Digital product engineering, 'design a real-time event logging system', LC-easy/medium, Spring/React depth"
    },
    {
        name: "ITC Infotech", tier: "indian-service", active: true,
        interviewStyle: "Manufacturing and CPG solutions, 'design a warehouse inventory tracker', LC-easy, PL/SQL depth"
    },
    {
        name: "Optum", tier: "indian-service", active: true,
        interviewStyle: "Healthcare data scale, 'design a HIPAA-compliant patient record system', LC-medium, distributed systems"
    },

    // ── Hardware / Semiconductor / Core ────────────────────────────────────────
    {
        name: "NVIDIA", tier: "hardware", active: true,
        interviewStyle: "CUDA kernel optimization, 'parallelize matrix multiplication on GPU', LC-hard DSA + memory bandwidth questions"
    },
    {
        name: "Intel", tier: "hardware", active: true,
        interviewStyle: "Cache coherency protocols, 'design a branch predictor', LC-medium/hard with x86 assembly sometimes"
    },
    {
        name: "Qualcomm", tier: "hardware", active: true,
        interviewStyle: "IoT power management, 'design an interrupt handler for sensor', LC-medium, DSP + signal processing"
    },
    {
        name: "Texas Instruments", tier: "hardware", active: true,
        interviewStyle: "Embedded C + RTOS task scheduling, 'design a watchdog timer', circuit-level debugging scenarios"
    },
    {
        name: "Tata Elxsi", tier: "hardware", active: true,
        interviewStyle: "AUTOSAR + CAN bus simulation, 'design a brake-by-wire message handler', LC-easy/medium, ISO 26262 awareness"
    },
    {
        name: "KPIT", tier: "hardware", active: true,
        interviewStyle: "MISRA C compliance, 'design a adaptive cruise control state machine', CAN/LIN protocol deep-dive"
    },
    {
        name: "ARM", tier: "hardware", active: true,
        interviewStyle: "Pipeline hazards and forwarding, 'design a simple 5-stage CPU', LC-hard (bit manipulation heavy)"
    },
    {
        name: "AMD", tier: "hardware", active: true,
        interviewStyle: "RDNA architecture, 'optimize a ray tracing shader', LC-hard + GPU compute model"
    },
    {
        name: "Micron", tier: "hardware", active: true,
        interviewStyle: "Memory controller design, 'solve DDR4 timing constraints', LC-medium, transistor-level basics"
    },
    {
        name: "Samsung", tier: "hardware", active: true,
        interviewStyle: "Consumer electronics scale, 'design a smart TV app store backend', LC-medium, memory management in C/C++"
    },
    {
        name: "Robert Bosch", tier: "hardware", active: true,
        interviewStyle: "Automotive software engineering, 'design a lane-keep assist control logic', C/C++ depth, RTOS fundamentals"
    },
    {
        name: "HP Inc", tier: "hardware", active: true,
        interviewStyle: "Print/PC firmware engineering, 'design a print queue priority manager', LC-easy/medium, embedded systems"
    },
    {
        name: "Dell", tier: "hardware", active: true,
        interviewStyle: "Enterprise infrastructure, 'design a RAID controller simulation', LC-easy/medium, server-side fundamentals"
    },
    {
        name: "Hyundai", tier: "hardware", active: true,
        interviewStyle: "Connected car tech (BlueLink), 'design a remote vehicle unlock API with security', LC-easy/medium, IoT protocols"
    },
    {
        name: "Tata Technologies", tier: "hardware", active: true,
        interviewStyle: "Product lifecycle management (PLM), 'design a bill of materials (BOM) hierarchy', LC-easy, CAD/CAM integration"
    },
    {
        name: "Reliance Industries", tier: "other", active: true,
        interviewStyle: "Large scale industrial automation, 'design a refinery sensor monitoring system', LC-easy/medium, high availability"
    },
    {
        name: "Adani Group", tier: "other", active: true,
        interviewStyle: "Infrastructure management, 'design a power grid load balancer simulation', LC-easy, scalability basics"
    },
    {
        name: "Voltas", tier: "hardware", active: true,
        interviewStyle: "Mechanical-electrical systems, 'design a smart AC thermostat logic', LC-easy, control systems basics"
    },
    {
        name: "TVS", tier: "hardware", active: true,
        interviewStyle: "EV battery management systems (BMS), 'design a charging station finder with real-time slots', LC-easy/medium"
    },

    // ── Security ──────────────────────────────────────────────────────────────
    {
        name: "Palo Alto Networks", tier: "security", active: true,
        interviewStyle: "Network threat modeling with STRIDE, 'design a next-gen firewall rule matcher', LC-medium, SIEM log correlation"
    },
    {
        name: "CrowdStrike", tier: "security", active: true,
        interviewStyle: "Endpoint detection: 'design a behavioral detection engine', EDR event deduplication, LC-medium, incident response playbook"
    },
    {
        name: "Quick Heal / Seqrite", tier: "security", active: true,
        interviewStyle: "Malware signature generation, 'design a heuristic virus detector', LC-easy/medium, PE file parsing"
    },
    {
        name: "Zscaler", tier: "security", active: true,
        interviewStyle: "Zero trust architecture, 'design a SSL inspection proxy', LC-medium, TLS handshake deep-dive"
    },
    {
        name: "Fortinet", tier: "security", active: true,
        interviewStyle: "IPS signature performance, 'design a fast pattern matcher (Aho-Corasick)', LC-hard, network protocols"
    },

    // ── Analytics / AI / Specialized ───────────────────────────────────────────
    {
        name: "Fractal Analytics", tier: "other", active: true,
        interviewStyle: "ML case study: 'predict customer churn with XGBoost', LC-medium, statistics quiz (p-value, bias-variance)"
    },
    {
        name: "Mu Sigma", tier: "other", active: true,
        interviewStyle: "Analytics consulting: 'solve this business case with data storytelling', LC-easy, guesstimates + logic puzzles"
    },
    {
        name: "Tiger Analytics", tier: "other", active: true,
        interviewStyle: "Python pandas deep-dive, 'optimize a slow data pipeline', LC-medium, A/B testing design"
    },
    {
        name: "LatentView", tier: "other", active: true,
        interviewStyle: "Data visualization insights, 'find anomalies in this sales data', LC-easy, stakeholder presentation mock"
    },
    {
        name: "Informatica", tier: "other", active: true,
        interviewStyle: "Data integration and ETL, 'design a metadata-driven data pipeline', LC-medium, SQL and data modeling"
    },
    {
        name: "Finastra", tier: "fintech", active: true,
        interviewStyle: "Open banking APIs, 'design a multi-currency payment gateway', LC-medium, transaction reliability"
    },
    {
        name: "Temenos", tier: "fintech", active: true,
        interviewStyle: "Core banking transformations, 'design a real-time interest calculation engine', LC-medium, financial software architecture"
    },
    {
        name: "Rapyuta Robotics", tier: "other", active: true,
        interviewStyle: "Multi-robot orchestration, 'design a collision avoidance algorithm for warehouse robots', LC-hard, ROS knowledge"
    },
    {
        name: "MAQ Software", tier: "indian-service", active: true,
        interviewStyle: "Power BI and Azure focus, 'design a dashboard for 10M rows', LC-easy, SQL and data warehousing"
    },
    {
        name: "Tudip Technologies", tier: "indian-service", active: true,
        interviewStyle: "Agile product engineering, 'how to handle changing requirements in a sprint?', LC-easy, full-stack basics"
    },
    {
        name: "FactSet", tier: "fintech", active: true,
        interviewStyle: "Financial data analytics, 'design a real-time stock price feed aggregator', LC-medium, data structure efficiency"
    },
    {
        name: "Odessa Tech", tier: "other", active: true,
        interviewStyle: "Asset finance software, 'design a lease schedule calculator', LC-easy/medium, OOPS and database design"
    },
    {
        name: "Kloudgin", tier: "other", active: true,
        interviewStyle: "Field service and asset management, 'design a real-time field technician tracking system', LC-easy/medium, mobile-first SaaS"
    },
    {
        name: "Bitwise", tier: "indian-service", active: true,
        interviewStyle: "Data warehousing and ETL, 'how to optimize a slow SQL query with 1B rows?', LC-easy/medium, ETL tools"
    },
    {
        name: "CGI", tier: "indian-service", active: true,
        interviewStyle: "End-to-end IT consulting, 'design a citizen portal for government services', LC-easy, client handling"
    },
    {
        name: "Directi", tier: "mid-product", active: true,
        interviewStyle: "Engineering-first culture, 'design a high-performance HTTP proxy', LC-hard DSA, deep networking fundamentals"
    },
    {
        name: "Ericsson", tier: "other", active: true,
        interviewStyle: "5G and networking infra, 'design a network congestion control algorithm', LC-medium, networking protocols (TCP/IP)"
    },
    {
        name: "MediaMint", tier: "other", active: true,
        interviewStyle: "Ad-operations and digital marketing tech, 'design a real-time ad performance tracking system', LC-easy, data management"
    },

    // ── Telecom / Infra ───────────────────────────────────────────────────────
    {
        name: "Jio Platforms", tier: "other", active: true,
        interviewStyle: "5G core network slicing, 'design a subscriber location registrar', LC-medium, telecom signaling (Diameter/HTTP2)"
    },
    {
        name: "Cisco", tier: "other", active: true,
        interviewStyle: "Routing protocol simulation, 'design a BGP route reflector', LC-medium, TCP state machine questions"
    },
    {
        name: "Nokia", tier: "other", active: true,
        interviewStyle: "OSS/BSS integration, 'design a network alarm correlation engine', LC-medium, SNMP knowledge"
    },
    {
        name: "Ericsson", tier: "other", active: true,
        interviewStyle: "RAN optimization, 'design a handover decision algorithm at 500 km/h', LC-medium, 3GPP spec awareness"
    },
    {
        name: "Airtel", tier: "other", active: true,
        interviewStyle: "Digital transformation: 'design a prepaid recharge stack with 50M users', LC-medium, partner API integration"
    },

    // ── SaaS & Cloud ─────────────────────────────────────────────────────────
    {
        name: "CleverTap", tier: "other", active: true,
        interviewStyle: "User engagement: 'design a push notification throttler at 1M/sec', LC-medium, segmentation engine"
    },
    {
        name: "Chargebee", tier: "other", active: true,
        interviewStyle: "Subscription billing: 'design a proration calculation engine with 200+ plans', LC-medium, idempotent invoicing"
    },
    {
        name: "Wingify", tier: "other", active: true,
        interviewStyle: "A/B testing platform, 'design a feature flag service with 0.1% latency', LC-medium, statistical significance"
    },
    {
        name: "Whatfix", tier: "other", active: true,
        interviewStyle: "Digital adoption platform, 'design an in-app widget position resolver', LC-medium, DOM traversal puzzles"
    },

    // ── Automotive Tech ───────────────────────────────────────────────────────
    {
        name: "Bosch Global Software", tier: "hardware", active: true,
        interviewStyle: "ESP algorithm, 'design a brake pressure estimator', LC-medium, ISO 26262 functional safety"
    },
    {
        name: "Mercedes-Benz R&D India", tier: "hardware", active: true,
        interviewStyle: "MBUX infotainment, 'design a voice command parser with slot filling', LC-medium, HMI design"
    },

    // ── HealthTech ────────────────────────────────────────────────────────────
    {
        name: "Practo", tier: "other", active: true,
        interviewStyle: "Video consultation reliability, 'design a doctor slot booking race condition resolver', LC-medium, HIPAA basics"
    },
    {
        name: "PharmEasy", tier: "other", active: true,
        interviewStyle: "Medicine delivery SLA, 'design a prescription expiry checker', LC-medium, regulatory compliance"
    },

    // ── EdTech ────────────────────────────────────────────────────────────────
    {
        name: "upGrad", tier: "other", active: true,
        interviewStyle: "Assessment platform, 'design a proctoring event collector', LC-medium, anti-cheating heuristics"
    },
    {
        name: "Vedantu", tier: "other", active: true,
        interviewStyle: "Live class whiteboard sync (WebRTC), 'design a hand raise queue manager', LC-medium, realtime signaling"
    },

    // ── Gaming ────────────────────────────────────────────────────────────────
    {
        name: "MPL (Mobile Premier League)", tier: "gaming", active: true,
        interviewStyle: "Game server tick rate, 'design a matchmaking ELO balancer', LC-medium, websocket game sync"
    },
    {
        name: "Nazara Technologies", tier: "gaming", active: true,
        interviewStyle: "Esports tournament bracket generator, 'design a fairness verifier for random draws', LC-medium"
    },

    // ── Proptech ─────────────────────────────────────────────────────────────
    {
        name: "NoBroker", tier: "other", active: true,
        interviewStyle: "Rental property search with polygon filters, 'design a mutual match notification system', LC-medium, geo-spatial index"
    },
    {
        name: "Magicbricks", tier: "other", active: true,
        interviewStyle: "Property valuation model backend, 'design a search with price range slider at 100ms', LC-medium, faceted search"
    },

    // ── Blockchain ────────────────────────────────────────────────────────────
    {
        name: "Polygon", tier: "other", active: true,
        interviewStyle: "zk-rollup transaction batching, 'design a mempool with gas auction', LC-hard, EIP-1559 understanding"
    },
    {
        name: "CoinDCX", tier: "other", active: true,
        interviewStyle: "DEX aggregation, 'design an order book for crypto options', LC-medium/hard, WebSocket API design"
    },
];

// HFT / Trading Firms
COMPANY_PROFILES.push(
    { name: "Jane Street", tier: "hft", active: true, interviewStyle: "OCaml functional + low latency, LC-hard (probabilistic), 'design a betting exchange', market microstructure depth" },
    { name: "Tower Research", tier: "hft", active: true, interviewStyle: "C++ memory pool design, lock-free queues, LC-hard, 'optimize this market data parser for 10 microseconds'" },
    { name: "Quadeye", tier: "hft", active: true, interviewStyle: "Latency arbitrage, LC-hard, 'detect quote stuffing from tick data', C++ template metaprogramming" },
    { name: "Jump Trading", tier: "hft", active: true, interviewStyle: "Verilog + C++ hybrid, 'design a packet sniffer timestamping circuit', LC-hard" },
    { name: "AlphaGrep", tier: "hft", active: true, interviewStyle: "FPGA + software co-design, LC-hard (bit tricks), 'design a risk limiter at nanosecond precision'" }
);

// Only active companies shown in dropdown
const TARGET_COMPANIES = COMPANY_PROFILES
    .filter(c => c.active)
    .map(c => c.name);

function renderMessageContent(content: string): React.ReactNode {
    if (!content) return null;
    const codeBlockRegex = /```(?:([a-zA-Z0-9+#-]+)\n)?([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        const textBefore = content.slice(lastIndex, match.index);
        if (textBefore) {
            parts.push(
                <span key={`text-${lastIndex}`} style={{ whiteSpace: "pre-wrap" }}>
                    {textBefore}
                </span>
            );
        }

        parts.push(
            <pre
                key={`code-${match.index}`}
                style={{
                    background: "rgba(0,0,0,0.3)",
                    padding: "10px",
                    borderRadius: "6px",
                    overflowX: "auto",
                    margin: "8px 0",
                    whiteSpace: "pre",
                }}
            >
                <code>{match[2]}</code>
            </pre>
        );

        lastIndex = match.index + match[0].length;
    }

    const textAfter = content.slice(lastIndex);
    if (textAfter) {
        parts.push(
            <span key={`text-${lastIndex}`} style={{ whiteSpace: "pre-wrap" }}>
                {textAfter}
            </span>
        );
    }

    return <>{parts}</>;
}

const ChatMessage = React.memo(({ msg, codingMode, isSpeaking }: { msg: any; codingMode: boolean; isSpeaking?: boolean }) => {
    return (
        <div
            className="animate-fade-in"
            style={{
                display: "flex",
                gap: "16px",
                marginBottom: "24px",
                maxWidth: msg.role === "candidate" ? "85%" : (codingMode ? "100%" : "85%"),
                alignSelf: msg.role === "candidate" ? "flex-end" : "flex-start",
                flexDirection: msg.role === "candidate" ? "row-reverse" : "row",
                animation: "fadeSlideUp 0.3s ease"
            }}
        >
            <div style={{ position: "relative", flexShrink: 0 }}>
                {msg.role === "interviewer" || msg.role === "interviewer_stream" ? (
                    <div
                        className={isSpeaking ? "speaking-pulse" : ""}
                        style={{
                            width: "36px",
                            height: "36px",
                            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            boxShadow: isSpeaking ? "0 0 15px rgba(99, 102, 241, 0.4)" : "none"
                        }}
                    >
                        <Bot size={20} />
                    </div>
                ) : (
                    <div
                        style={{
                            width: "36px",
                            height: "36px",
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#94A3B8"
                        }}
                    >
                        <User size={20} />
                    </div>
                )}
            </div>
            <div
                style={{
                    flex: 1,
                    padding: "14px 18px",
                    background: msg.role === "candidate" ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" : "rgba(30, 41, 59, 0.4)",
                    borderRadius: msg.role === "candidate" ? "20px 20px 0 20px" : "0 20px 20px 20px",
                    border: msg.role === "candidate" ? "none" : "1px solid rgba(255,255,255,0.05)",
                    boxShadow: msg.role === "candidate" ? "0 4px 12px rgba(99, 102, 241, 0.2)" : "none"
                }}
            >
                <div style={{ color: msg.role === "candidate" ? "#F8FAFC" : "#E2E8F0", fontSize: "15px", lineHeight: "1.6" }}>
                    {renderMessageContent(msg.content)}
                </div>
            </div>
        </div>
    );
});

ChatMessage.displayName = "ChatMessage";
export default function InterviewPage() {
    const [messages, setMessages] = useState<{ id?: string; role: string; content: string; type?: string }[]>([]);
    const [streamingMessage, setStreamingMessage] = useState("");
    const [inputVal, setInputVal] = useState("");
    // Live Coding State
    const [codingMode, setCodingMode] = useState<boolean>(false);
    const [codingLanguage, setCodingLanguage] = useState<string>("python");
    const [codeVal, setCodeVal] = useState<string | undefined>("// Write your code here...\n");
    const [isEditorEnabled, setIsEditorEnabled] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    // UI & Status States
    const [isThinking, setIsThinking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [questionCount, setQuestionCount] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [connectionState, setConnectionState] = useState("Disconnected");

    // New State for Targeted Input
    const [targetRole, setTargetRole] = useState<TargetRole>(TARGET_ROLES[0]);
    const [targetCompany, setTargetCompany] = useState<string>(TARGET_COMPANIES[0]);

    // History State
    const [history, setHistory] = useState<any[]>([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);



    useEffect(() => {
        getInterviewHistory().then(data => {
            if (data.history) {
                setHistory(data.history);
            }
        }).catch(console.error);
    }, []);

    const handleDeleteHistory = async (id: string) => {
        try {
            await deleteInterview(id);
            setHistory(prev => prev.filter(h => h.id !== id));
        } catch (err) {
            console.error("Failed to delete interview:", err);
        }
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const audioQueueRef = useRef<string[]>([]);
    const isPlayingRef = useRef(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout>();
    const sessionTimerRef = useRef<NodeJS.Timeout>();
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectRef = useRef(true);
    const messagesRef = useRef(messages);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const INTERVIEW_PHASES = [
        "Introduction",
        "Technical Screening",
        "DSA / Problem Solving",
        "System Design",
        "Real-world Scenario",
        "Deep Dive",
        "Behavioral"
    ];

    const currentPhase = INTERVIEW_PHASES[Math.min(questionCount, 6)];

    // Timer Effect
    useEffect(() => {
        if (!isStarted || isEnded) {
            if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
            return;
        }
        sessionTimerRef.current = setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);
        return () => {
            if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
        };
    }, [isStarted, isEnded]);

    // Debounced Auto-scroll
    useEffect(() => {
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 80);
        return () => {
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        };
    }, [messages, streamingMessage]);

    const stopCurrentAudio = useCallback(() => {
        const activeAudio = currentAudioRef.current;
        if (activeAudio) {
            activeAudio.pause();
            activeAudio.currentTime = 0;
            activeAudio.src = "";
            if (activeAudio.src.startsWith("blob:")) {
                URL.revokeObjectURL(activeAudio.src);
            }
        }
        currentAudioRef.current = null;
        isPlayingRef.current = false;
        setIsSpeaking(false);
        audioQueueRef.current = [];
    }, []);

    const processAudioQueue = useCallback(async () => {
        if (isPlayingRef.current || audioQueueRef.current.length === 0) return;

        isPlayingRef.current = true;
        setIsSpeaking(true);
        const audioBase64 = audioQueueRef.current.shift();

        if (!audioBase64) {
            isPlayingRef.current = false;
            setIsSpeaking(false);
            return;
        }

        const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
        currentAudioRef.current = audio;

        audio.onended = () => {
            isPlayingRef.current = false;
            setIsSpeaking(false);
            processAudioQueue();
        };

        try {
            await audio.play();
        } catch (error) {
            isPlayingRef.current = false;
            setIsSpeaking(false);
            processAudioQueue();
        }
    }, []);

    useEffect(() => {
        return () => {
            stopCurrentAudio();
        };
    }, []);

    const canSendMessage = Boolean(
        inputVal.trim() || (codingMode && codeVal && codeVal.trim() !== "// Write your code here...\n" && codeVal.trim() !== "// Write your code here...")
    );

    const startInterview = useCallback(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        const id = Date.now().toString();
        setIsStarted(true);
        setIsEnded(false);
        setMessages([]);
        setStreamingMessage("");
        setScore(null);
        setQuestionCount(0);
        setElapsedSeconds(0);
        setIsThinking(false);
        reconnectRef.current = true;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const wsUrl = apiUrl.replace("http://", "ws://").replace("https://", "wss://");

        const selectedCompanyProfile = COMPANY_PROFILES.find(c => c.name === targetCompany);
        const companyStyle = selectedCompanyProfile?.interviewStyle || "";

        const params = new URLSearchParams({
            role: targetRole,
            company: targetCompany,
            company_style: companyStyle,
            token,
        });

        const connect = () => {
            if (!reconnectRef.current) return;

            const socket = new WebSocket(`${wsUrl}/interview/ws/${id}?${params.toString()}`);

            socket.onopen = () => {
                setConnectionState("Connected");
            };

            socket.onmessage = (event) => {
                if (event.data === "__pong__") return;

                try {
                    const data = JSON.parse(event.data);

                    if (data.role === "system" && data.content === "Interview Completed.") {
                        if (data.score !== undefined) setScore(data.score);
                        setIsEnded(true);
                        setIsThinking(false);
                        reconnectRef.current = false;
                        return;
                    }

                    if (data.role === "system") return;

                    if (data.role === "interviewer_stream") {
                        setIsThinking(false);
                        setStreamingMessage(prev => prev + data.content);
                        return;
                    }

                    if (data.audio) {
                        audioQueueRef.current.push(data.audio);
                        processAudioQueue();
                    }

                    if (data.role === "interviewer" && data.content) {
                        setIsThinking(false);
                        setQuestionCount(prev => {
                            if (data.type === "question") {
                                // If this is the very first interviewer message, it's the Intro (1/7)
                                // Subsequent 'question' types increment normally.
                                return Math.min(prev + 1, 7);
                            }
                            return prev;
                        });
                        setMessages(prev => {
                            if (!data.content || (data.id && prev.some(m => m.id === data.id))) return prev;
                            return [
                                ...prev,
                                {
                                    id: data.id,
                                    role: "interviewer",
                                    content: data.content,
                                    type: data.type || "question"
                                }
                            ];
                        });
                        setStreamingMessage("");
                    }
                } catch (e) {
                    console.error("Failed to parse message:", e);
                }
            };

            socket.onclose = () => {
                setConnectionState("Disconnected");
                if (reconnectRef.current) {
                    setTimeout(connect, 3000);
                }
            };

            socket.onerror = () => {
                setConnectionState("Error");
            };

            wsRef.current = socket;
        };

        connect();
    }, [targetRole, targetCompany, processAudioQueue]);

    // Keep-alive ping mechanism
    useEffect(() => {
        const pingInterval = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send("__ping__");
            }
        }, 20000);

        return () => clearInterval(pingInterval);
    }, []);

    const endInterview = useCallback(() => {
        reconnectRef.current = false;
        if (wsRef.current) {
            wsRef.current.close();
        }
        stopCurrentAudio();
        setIsEnded(true);
    }, [stopCurrentAudio]);

    const sendMessage = useCallback((e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!wsRef.current || isThinking || streamingMessage.length > 0) return;

        let contentToSend = inputVal.trim();

        if (codingMode && codeVal && codeVal.trim() !== "// Write your code here...") {
            if (contentToSend) {
                contentToSend += "\n\n```" + codingLanguage + "\n" + codeVal + "\n```";
            } else {
                contentToSend = "```" + codingLanguage + "\n" + codeVal + "\n```";
            }
        }

        if (!contentToSend) return;

        setIsThinking(true);
        wsRef.current.send(contentToSend);
        setMessages((prev) => [...prev, { role: "candidate", content: contentToSend }]);
        setInputVal("");
    }, [inputVal, codingMode, codingLanguage, codeVal, isThinking, streamingMessage]);

    return (
        <main
            style={{
                flex: 1,
                padding: "12px 20px",
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                width: "100%",
                overflow: "hidden",
                background: "#020617",
                color: "#F8FAFC",
                position: "relative"
            }}
        >
            {/* 1. Top Status Header */}
            <div
                className="animate-fade-up"
                style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    padding: "16px 24px",
                    borderRadius: "16px",
                    marginBottom: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid rgba(255,255,255,0.05)",
                    backdropFilter: "blur(20px)",
                    flexShrink: 0
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingLeft: "50px" }}>
                    <div style={{
                        width: "40px", height: "40px",
                        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                        borderRadius: "10px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)"
                    }}>
                        <Bot size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: "18px", fontWeight: "700", color: "#F8FAFC", margin: 0 }}>AI Interviewer</h1>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", marginTop: "2px" }}>
                            <span style={{ color: connectionState === "Connected" ? "#6366f1" : "#EF4444", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", animation: connectionState === "Connected" ? "pulse 2s infinite" : "none" }} />
                                {connectionState === "Connected" ? "Connected" : "Disconnected"}
                            </span>
                            <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
                            <span style={{ color: "#94A3B8" }}>{targetRole} @ {targetCompany}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                    <button 
                        onClick={() => setShowHistoryModal(true)} 
                        style={{ 
                            padding: "10px 18px", 
                            background: "rgba(255,255,255,0.03)", 
                            border: "1px solid rgba(255,255,255,0.1)", 
                            borderRadius: "12px", 
                            color: "#94A3B8", 
                            fontWeight: "600", 
                            cursor: "pointer", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px",
                            transition: "all 0.2s"
                        }}
                        className="hover-bg-white-05"
                    >
                        <History size={18} /> History
                    </button>
                    {!isStarted || isEnded ? (
                        <button onClick={startInterview} className="btn-glow" style={{ padding: "10px 24px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px", fontWeight: "700" }}>
                            <Play size={18} fill="currentColor" /> {isEnded ? "Restart Interview" : "Start Interview"}
                        </button>
                    ) : (
                        <button onClick={endInterview} style={{ padding: "10px 24px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "12px", color: "#EF4444", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Square size={16} fill="currentColor" /> End Session
                        </button>
                    )}
                </div>
            </div>

            {/* 2. Main Split Content */}
            <div style={{ display: "flex", gap: "24px", flex: 1, overflow: "hidden", minHeight: 0 }}>

                {/* Left Column: Interview History / Transcript */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "rgba(15, 23, 42, 0.4)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden", backdropFilter: "blur(10px)", width: "50%", minHeight: 0 }}>
                    <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.1)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#6366f1" }}>
                            <History size={18} />
                            <span style={{ fontSize: "14px", fontWeight: "700" }}>Interview Record</span>
                        </div>
                        <div style={{ fontSize: "12px", color: "#94A3B8", fontWeight: "600" }}>
                            {questionCount} Questions Logged
                        </div>
                    </div>

                    <div
                        style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column" }}
                        className="chat-scroll"
                    >
                        {!isStarted && (
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px", textAlign: "center" }}>
                                <Bot size={48} color="#6366f1" style={{ opacity: 0.2, marginBottom: "20px" }} />
                                <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#F8FAFC", marginBottom: "12px" }}>Ready to Start?</h3>
                                <p style={{ color: "#94A3B8", fontSize: "14px", maxWidth: "300px", lineHeight: "1.6" }}>
                                    Select your career path and target company to begin your AI-powered interview.
                                </p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <ChatMessage
                                key={msg.id || i}
                                msg={msg}
                                codingMode={false}
                                isSpeaking={isSpeaking && i === messages.length - 1 && msg.role === "interviewer"}
                            />
                        ))}
                        {streamingMessage && (
                            <div style={{ display: "flex", gap: "12px", alignSelf: "flex-start", maxWidth: "90%", marginBottom: "24px" }}>
                                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Bot size={20} color="#6366f1" />
                                </div>
                                <div style={{ background: "rgba(30,41,59,0.4)", padding: "14px 18px", borderRadius: "0 18px 18px 18px", color: "#f1f5f9", fontSize: "15px", lineHeight: "1.6", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    {renderMessageContent(streamingMessage)}
                                    <span className="typing-cursor">|</span>
                                </div>
                            </div>
                        )}
                        {isThinking && (
                            <div style={{ display: "flex", gap: "12px", alignItems: "center", padding: "12px 16px", background: "rgba(99, 102, 241, 0.05)", borderRadius: "12px", width: "fit-content", marginBottom: "24px" }}>
                                <div className="thinking-dots"><span></span><span></span><span></span></div>
                                <span style={{ fontSize: "13px", color: "#6366f1", fontWeight: "600" }}>AI is thinking...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Right Column: Active Input Area / Response / Coding */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px", width: "50%", minHeight: 0 }}>

                    {/* Internal Stats Bar */}
                    <div style={{
                        background: "rgba(15, 23, 42, 0.4)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)",
                        padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
                        fontSize: "14px", color: "#94A3B8", backdropFilter: "blur(10px)"
                    }}>
                        <div style={{ display: "flex", gap: "32px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <Clock size={16} />
                                <span style={{ fontFamily: "monospace", fontWeight: "600", color: "#F8FAFC" }}>
                                    {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, "0")}
                                </span>
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <Target size={16} />
                                <span style={{ fontWeight: "600", color: "#F8FAFC" }}>Question {questionCount}/7</span>
                            </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#6366f1", fontWeight: "700" }}>
                            <Sparkles size={16} /> {currentPhase}
                        </div>
                    </div>

                    {!isStarted ? (
                        <div style={{ flex: 1, background: "rgba(15, 23, 42, 0.4)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", padding: "40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#F8FAFC", marginBottom: "32px" }}>Interview Setup</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "40px" }}>
                                <div>
                                    <label style={{ display: "block", color: "#94A3B8", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", marginBottom: "12px" }}>Career Path</label>
                                    <select
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value as TargetRole)}
                                        style={{ width: "100%", background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "14px 18px", color: "#F8FAFC", outline: "none" }}
                                    >
                                        {TARGET_ROLES.map((r, idx) => <option key={idx} value={r} style={{ background: "#0F172A" }}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", color: "#94A3B8", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", marginBottom: "12px" }}>Target Company</label>
                                    <select
                                        value={targetCompany}
                                        onChange={(e) => setTargetCompany(e.target.value)}
                                        style={{ width: "100%", background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "14px 18px", color: "#F8FAFC", outline: "none" }}
                                    >
                                        {TARGET_COMPANIES.map((c, idx) => <option key={idx} value={c} style={{ background: "#0F172A" }}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button onClick={startInterview} className="btn-glow" style={{ padding: "16px 32px", fontSize: "16px", fontWeight: "800", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                                <Play size={20} fill="currentColor" /> Begin Session
                            </button>
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", overflow: "hidden" }}>
                            {/* Large Answer Box */}
                            <div style={{ flex: codingMode ? 0.4 : 1, background: "rgba(15, 23, 42, 0.4)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
                                <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ color: "#F8FAFC", fontWeight: "700", fontSize: "14px" }}>Your Response</span>
                                    <span style={{ fontSize: "11px", color: "#94A3B8" }}>Press Enter to send</span>
                                </div>
                                <textarea
                                    value={inputVal}
                                    onChange={(e) => setInputVal(e.target.value)}
                                    placeholder="Type your detailed answer here..."
                                    style={{
                                        flex: 1, background: "transparent", border: "none", padding: "24px",
                                        color: "#F8FAFC", fontSize: "16px", lineHeight: "1.6", resize: "none", outline: "none",
                                        fontFamily: "inherit", overflowY: "auto"
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                />
                            </div>

                            {/* Optional Bottom Code Editor */}
                            {codingMode && (
                                <div style={{ flex: 0.6, background: "rgba(15, 23, 42, 0.4)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
                                    <div style={{ padding: "12px 20px", background: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6366f1" }}>
                                            <Code size={16} />
                                            <span style={{ fontSize: "13px", fontWeight: "700" }}>Code Solution</span>
                                        </div>
                                        <select
                                            value={codingLanguage}
                                            onChange={(e) => setCodingLanguage(e.target.value)}
                                            style={{ background: "rgba(30,41,59,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "4px 10px", color: "#fff", fontSize: "11px", outline: "none" }}
                                        >
                                            <option value="python">Python</option>
                                            <option value="javascript">JavaScript</option>
                                            <option value="java">Java</option>
                                            <option value="cpp">C++</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Editor
                                            height="100%"
                                            theme="vs-dark"
                                            language={codingLanguage}
                                            value={codeVal}
                                            onChange={(val) => setCodeVal(val)}
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 14,
                                                lineNumbers: "on",
                                                roundedSelection: false,
                                                scrollBeyondLastLine: false,
                                                readOnly: isEnded,
                                                automaticLayout: true,
                                                fontFamily: "'Fira Code', 'JetBrains Mono', monospace"
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Control Bar */}
                            <div style={{ display: "flex", gap: "12px", alignItems: "center", paddingBottom: "10px", flexShrink: 0 }}>
                                <button
                                    type="button"
                                    onClick={() => { setCodingMode(!codingMode); setIsEditorEnabled(!codingMode); }}
                                    style={{
                                        width: "56px", height: "56px", borderRadius: "16px",
                                        background: codingMode ? "rgba(99, 102, 241, 0.15)" : "rgba(255,255,255,0.03)",
                                        border: "1px solid",
                                        borderColor: codingMode ? "#6366f1" : "rgba(255,255,255,0.1)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: codingMode ? "#6366f1" : "#94A3B8",
                                        cursor: "pointer", transition: "all 0.2s"
                                    }}
                                    title="Toggle Code Editor"
                                >
                                    <Code size={24} />
                                </button>
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={isThinking || !inputVal.trim()}
                                    style={{
                                        flex: 1, height: "56px", background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                                        border: "none", borderRadius: "16px", color: "white", fontWeight: "800",
                                        fontSize: "16px", cursor: (isThinking || !inputVal.trim()) ? "not-allowed" : "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
                                        boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)", opacity: (isThinking || !inputVal.trim()) ? 0.6 : 1
                                    }}
                                >
                                    Submit Answer <Send size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* History Modal */}
            {showHistoryModal && (
                <div
                    className="animate-fade-in"
                    style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(7, 8, 13, 0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}
                >
                    <div
                        className="animate-scale-up"
                        style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <div>
                                <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#F8FAFC", margin: 0 }}>Interview History</h2>
                                <p style={{ color: "#94A3B8", fontSize: "14px", marginTop: "4px" }}>Track your performance over time</p>
                            </div>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                style={{ background: "rgba(255,255,255,0.03)", border: "none", color: "#94A3B8", cursor: "pointer", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {history.length > 0 ? (
                                history.map((h: any) => (
                                    <div
                                        key={h.id}
                                        style={{
                                            background: "rgba(255,255,255,0.02)",
                                            border: "1px solid rgba(255,255,255,0.05)",
                                            borderRadius: "16px",
                                            padding: "20px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            transition: "all 0.2s"
                                        }}
                                        className="history-card"
                                    >
                                        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
                                                <Star size={20} />
                                            </div>
                                            <div>
                                                <h4 style={{ color: "#F8FAFC", fontSize: "16px", fontWeight: "600", margin: 0 }}>{h.role || h.target_role}</h4>
                                                <p style={{ color: "#64748B", fontSize: "13px", marginTop: "2px" }}>
                                                    {h.company || "General"} • {new Date(h.timestamp || h.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ color: "#6366f1", fontWeight: "800", fontSize: "20px" }}>{h.score ? Math.round(h.score) : 0}%</div>
                                                <div style={{ color: "#64748B", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Score</div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteHistory(h.id); }}
                                                style={{ background: "rgba(239, 68, 68, 0.05)", border: "none", borderRadius: "8px", color: "#EF4444", cursor: "pointer", padding: "8px" }}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: "center", padding: "48px 0", opacity: 0.5 }}>
                                    <History size={48} style={{ marginBottom: "16px", color: "#64748B" }} />
                                    <p style={{ color: "#94A3B8" }}>No previous interviews found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Speaking Orb removed per user request */}
            <style jsx global>{`
                    .typing-cursor {
                        display: inline-block;
                        width: 2px;
                        height: 1em;
                        background: #6366f1;
                        margin-left: 4px;
                        animation: blink 0.8s infinite;
                        vertical-align: middle;
                    }
                    @keyframes blink {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0; }
                    }
                    .chat-scroll::-webkit-scrollbar {
                        width: 6px;
                    }
                    .chat-scroll::-webkit-scrollbar-track {
                        background: rgba(255,255,255,0.02);
                    }
                    .chat-scroll::-webkit-scrollbar-thumb {
                        background: rgba(99, 102, 241, 0.2);
                        border-radius: 10px;
                    }
                    .chat-scroll::-webkit-scrollbar-thumb:hover {
                        background: rgba(99, 102, 241, 0.4);
                    }
                `}</style>
        </main>
    );
}
