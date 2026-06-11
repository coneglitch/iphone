// ========= Locket Gold Unlock ========= //
// Fix: Khong phu thuoc User-Agent, inject Gold truc tiep vao tat ca entitlements
// @author: duyvinh09 | Fix by Antigravity

var obj;
try {
  obj = JSON.parse($response.body);
} catch (e) {
  $done({});
}

// Subscription object gia lap - Gold vinh vien
var fakeSubscription = {
  auto_resume_date: null,
  display_name: "locket_1600_1y",
  is_sandbox: false,
  ownership_type: "PURCHASED",
  billing_issues_detected_at: null,
  management_url: "https://apps.apple.com/account/subscriptions",
  period_type: "normal",
  price: {
    amount: 399000.0,
    currency: "VND"
  },
  expires_date: "2099-01-09T10:10:14Z",
  grace_period_expires_date: null,
  refunded_at: null,
  unsubscribe_detected_at: null,
  original_purchase_date: "2020-01-09T10:10:15Z",
  purchase_date: "2020-01-09T10:10:14Z",
  store: "app_store",
  store_transaction_id: "2000001108724193"
};

// Entitlement object cho Gold
var fakeEntitlement = {
  grace_period_expires_date: null,
  purchase_date: "2020-01-09T10:10:14Z",
  product_identifier: "locket_1600_1y",
  expires_date: "2099-01-09T10:10:14Z"
};

// Kiem tra subscriber ton tai
if (obj && obj.subscriber) {
  var sub = obj.subscriber;

  // Khoi tao neu thieu
  if (!sub.subscriptions) sub.subscriptions = {};
  if (!sub.entitlements) sub.entitlements = {};
  if (!sub.non_subscriptions) sub.non_subscriptions = {};

  // Inject subscription chinh
  sub.subscriptions["locket_1600_1y"] = fakeSubscription;

  // Inject tat ca entitlement co the Locket dung: pro, Gold, vip, watch_vip
  var entitlementKeys = ["pro", "Gold", "gold", "vip", "watch_vip", "locket_gold"];
  entitlementKeys.forEach(function(key) {
    sub.entitlements[key] = fakeEntitlement;
  });

  // Patch first_seen de tranh bi detect la moi
  if (!sub.first_seen) {
    sub.first_seen = "2020-01-09T10:10:14Z";
  }
}

$done({
  body: JSON.stringify(obj)
});
