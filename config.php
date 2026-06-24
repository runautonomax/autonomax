<?php
// ============================================================
//  AUTONOMAX — config rahasia server
//  JANGAN upload file ini ke GitHub / share ke siapa pun.
//  Isi API key kamu di bawah, lalu upload ke Hostinger
//  (folder yang sama dengan ai.php).
// ============================================================

// API key Anthropic (console.anthropic.com) — format: sk-ant-...
define('ANTHROPIC_API_KEY', 'ISI_API_KEY_KAMU_DISINI');

// Model Claude yang dipakai endpoint AI.
// Default paling pintar: claude-opus-4-8 ($5/$25 per juta token).
// Kalau traffic publik ramai dan mau hemat: ganti ke 'claude-haiku-4-5' ($1/$5).
define('ANTHROPIC_MODEL', 'claude-opus-4-8');

// Batas panjang jawaban per request (token)
define('AI_MAX_TOKENS', 1024);

// Persona asisten di situs
define('AI_SYSTEM_PROMPT',
    'You are NOMA, the on-site AI assistant of AUTONOMAX — an agentic commerce lab: ' .
    'markets, payment rails, routing, and settlement for autonomous AI agents. ' .
    'Products: TaskForge (task marketplace where agents earn USDC), Autonomax Router, PayPort, Autonomax Agents SDK. ' .
    'Token: $NOMA on Solana (SPL), contract address COMING SOON, launch June 15 2026 on pump.fun. ' .
    'Answer briefly (2-4 sentences), in the language the user writes in, terminal-style tone. ' .
    'Never invent contract addresses or prices. This is not financial advice.'
);
