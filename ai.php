<?php
// AUTONOMAX — endpoint AI (proxy ke Anthropic Messages API)
// Frontend memanggil: POST ai.php  body: {"message":"...", "history":[{role,content},...]}
// Balasan: {"reply":"..."} atau {"error":"..."}

header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST only']);
    exit;
}
if (!defined('ANTHROPIC_API_KEY') || strpos(ANTHROPIC_API_KEY, 'sk-ant-') !== 0) {
    http_response_code(500);
    echo json_encode(['error' => 'API key belum diisi di config.php']);
    exit;
}

// rate limit sederhana per sesi: max 1 request / 3 detik
session_start();
$now = microtime(true);
if (isset($_SESSION['ai_last']) && ($now - $_SESSION['ai_last']) < 3) {
    http_response_code(429);
    echo json_encode(['error' => 'Pelan-pelan, coba lagi sebentar.']);
    exit;
}
$_SESSION['ai_last'] = $now;

$raw = file_get_contents('php://input', false, null, 0, 16384);
$in  = json_decode($raw, true);
$msg = isset($in['message']) ? trim((string) $in['message']) : '';
if ($msg === '' || mb_strlen($msg) > 2000) {
    http_response_code(400);
    echo json_encode(['error' => 'Pesan kosong atau terlalu panjang (max 2000 karakter).']);
    exit;
}

// riwayat percakapan opsional dari frontend (dibatasi 10 turn terakhir)
$messages = [];
if (!empty($in['history']) && is_array($in['history'])) {
    foreach (array_slice($in['history'], -10) as $turn) {
        if (!is_array($turn)) continue;
        $role = ($turn['role'] ?? '') === 'assistant' ? 'assistant' : 'user';
        $text = mb_substr(trim((string) ($turn['content'] ?? '')), 0, 2000);
        if ($text !== '') $messages[] = ['role' => $role, 'content' => $text];
    }
}
$messages[] = ['role' => 'user', 'content' => $msg];

$payload = json_encode([
    'model'      => ANTHROPIC_MODEL,
    'max_tokens' => AI_MAX_TOKENS,
    'system'     => AI_SYSTEM_PROMPT,
    'messages'   => $messages,
]);

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 60,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'x-api-key: ' . ANTHROPIC_API_KEY,
        'anthropic-version: 2023-06-01',
    ],
]);
$res  = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
$err  = curl_error($ch);
curl_close($ch);

if ($res === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Gagal menghubungi AI: ' . $err]);
    exit;
}

$data = json_decode($res, true);
if ($code >= 400 || !isset($data['content'])) {
    $apiMsg = $data['error']['message'] ?? 'unknown error';
    http_response_code(502);
    echo json_encode(['error' => 'AI error (' . $code . '): ' . $apiMsg]);
    exit;
}

// stop_reason "refusal" = model menolak; content bisa kosong
if (($data['stop_reason'] ?? '') === 'refusal') {
    echo json_encode(['reply' => 'Maaf, saya tidak bisa membantu untuk permintaan itu.']);
    exit;
}

$reply = '';
foreach ($data['content'] as $block) {
    if (($block['type'] ?? '') === 'text') $reply .= $block['text'];
}
echo json_encode(['reply' => trim($reply)]);
