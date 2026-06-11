// deleteHeader by duyvinh09 | Fix: xoa ca 2 dang header ETag de RevenueCat luon gui full response

var modifiedHeaders = $request.headers;

// Xoa het cac bien the cua ETag header (case-insensitive safe)
var keysToDelete = ["X-RevenueCat-ETag", "x-revenuecat-etag", "If-None-Match", "if-none-match"];
keysToDelete.forEach(function(key) {
  // Xoa ca dang chinh xac va lowercase
  delete modifiedHeaders[key];
  delete modifiedHeaders[key.toLowerCase()];
  delete modifiedHeaders[key.toUpperCase()];
});

$done({ headers: modifiedHeaders });
