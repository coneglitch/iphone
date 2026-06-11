(function () {
  // ============================================================
  // Locket Gold Unlock - DEBUG VERSION
  // Enable debug: set DEBUG = true để xem log trên Shadowrocket
  // ============================================================
  var DEBUG = true;

  function log(msg) {
    if (DEBUG) console.log("[LocketGold] " + msg);
  }

  // ── STEP 1: Kiểm tra script có được trigger ──────────────────
  log("STEP 1: Script triggered OK");
  log("URL: " + $request.url);

  // ── STEP 2: Đọc response body ────────────────────────────────
  var rawBody = $response.body;
  log("STEP 2: Body length = " + (rawBody ? rawBody.length : 0));

  if (!rawBody || rawBody.length === 0) {
    log("ERROR: Body is empty (likely 304 Not Modified - ETag not cleared)");
    log("Fix: Check [Header Rewrite] http-request rules for api.revenuecat.com");
    $done({});
    return;
  }

  // ── STEP 3: Parse JSON ───────────────────────────────────────
  var obj;
  try {
    obj = JSON.parse(rawBody);
    log("STEP 3: JSON parsed OK");
  } catch (e) {
    log("ERROR: JSON.parse failed: " + e.message);
    log("Body preview: " + rawBody.substring(0, 200));
    $done({ body: rawBody });
    return;
  }

  // ── STEP 4: Validate structure ───────────────────────────────
  if (!obj || !obj.subscriber) {
    log("ERROR: No 'subscriber' key in response");
    log("Keys found: " + Object.keys(obj || {}).join(", "));
    $done({ body: rawBody });
    return;
  }

  var sub = obj.subscriber;
  log("STEP 4: subscriber OK");
  log("  existing entitlements: " + JSON.stringify(Object.keys(sub.entitlements || {})));
  log("  existing subscriptions: " + JSON.stringify(Object.keys(sub.subscriptions || {})));

  // ── STEP 5: Inject Gold ──────────────────────────────────────
  var farFuture = "2099-12-31T23:59:59Z";
  var pastDate  = "2020-01-01T00:00:00Z";

  // Init nếu thiếu
  if (!sub.subscriptions)     sub.subscriptions     = {};
  if (!sub.entitlements)      sub.entitlements      = {};
  if (!sub.non_subscriptions) sub.non_subscriptions = {};
  if (!sub.other_purchases)   sub.other_purchases   = {};

  // Inject subscription - dùng nhiều product ID phổ biến nhất của Locket
  // (product ID thay đổi theo region và version app)
  var productIds = [
    "locket_1600_1y",          // VN version
    "locket.gold.yearly",      // international
    "locket_gold_yearly",      // variant
    "com.locket.gold.yearly",  // bundle format
    "gold_yearly",             // short format
    "locket_gold",             // short
    "gold"                     // minimal
  ];

  var fakeSub = {
    auto_resume_date:           null,
    billing_issues_detected_at: null,
    expires_date:               farFuture,
    grace_period_expires_date:  null,
    is_sandbox:                 false,
    management_url:             "https://apps.apple.com/account/subscriptions",
    original_purchase_date:     pastDate,
    ownership_type:             "PURCHASED",
    period_type:                "normal",
    purchase_date:              pastDate,
    refunded_at:                null,
    store:                      "app_store",
    store_transaction_id:       "2000000000000001",
    unsubscribe_detected_at:    null
  };

  // Inject tất cả product IDs có thể
  for (var i = 0; i < productIds.length; i++) {
    sub.subscriptions[productIds[i]] = fakeSub;
  }

  // Inject entitlements - Gold là key chính, thêm fallback
  var entitlementKeys = ["Gold", "gold", "pro", "premium", "locket_gold", "locket-gold"];

  for (var j = 0; j < entitlementKeys.length; j++) {
    sub.entitlements[entitlementKeys[j]] = {
      expires_date:              farFuture,
      grace_period_expires_date: null,
      product_identifier:        productIds[0],  // locket_1600_1y as primary
      purchase_date:             pastDate
    };
  }

  // Patch metadata
  if (!sub.first_seen)             sub.first_seen             = pastDate;
  if (!sub.original_purchase_date) sub.original_purchase_date = pastDate;
  if (!sub.last_seen)              sub.last_seen              = pastDate;

  log("STEP 5: Injected " + entitlementKeys.length + " entitlement keys: " + entitlementKeys.join(", "));
  log("STEP 5: Injected " + productIds.length + " subscription product IDs");

  // ── STEP 6: Serialize và trả về ─────────────────────────────
  var newBody = JSON.stringify(obj);
  log("STEP 6: Modified body length = " + newBody.length);
  log("STEP 6: entitlements after inject = " + JSON.stringify(sub.entitlements));

  $done({ body: newBody });
  log("STEP 7: $done() called successfully");

})();
