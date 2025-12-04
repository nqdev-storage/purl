// import { TIME_OUT, DELAY_TIME, TIME_OUT_SKIP, BASE_URL } from './constants.js';

const DB_NAME = 'purlHistoryDB';
const DB_VERSION = 1;
const STORE_NAME = 'urlHistory';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

async function saveToHistory(originalUrl, shortUrl) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record = {
      originalUrl: originalUrl,
      shortUrl: shortUrl,
      timestamp: new Date().toISOString()
    };

    store.add(record);

    transaction.oncomplete = () => {
      db.close();
      loadHistory();
    };
  } catch (error) {
    console.log("🚀 QuyNH: saveToHistory -> error", error);
  }
}

async function loadHistory() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const records = request.result;
      renderHistoryTable(records);
      db.close();
    };
  } catch (error) {
    console.log("🚀 QuyNH: loadHistory -> error", error);
  }
}

function renderHistoryTable(records) {
  const tbody = document.getElementById('history-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Chưa có lịch sử</td></tr>';
    return;
  }

  // Sort by timestamp descending (newest first)
  records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  records.forEach((record, index) => {
    const row = document.createElement('tr');

    const keyIdCell = document.createElement('td');
    keyIdCell.className = 'text-truncate';
    keyIdCell.style.maxWidth = '90px';
    keyIdCell.title = record.id;
    keyIdCell.textContent = record.id;
    
    const originalUrlCell = document.createElement('td');
    originalUrlCell.className = 'text-truncate';
    originalUrlCell.style.maxWidth = '200px';
    originalUrlCell.title = record.originalUrl;
    originalUrlCell.textContent = record.originalUrl;

    const shortUrlCell = document.createElement('td');
    shortUrlCell.className = 'text-truncate';
    shortUrlCell.style.maxWidth = '200px';
    shortUrlCell.title = record.shortUrl;
    shortUrlCell.textContent = record.shortUrl;

    const timestampCell = document.createElement('td');
    const date = new Date(record.timestamp);
    timestampCell.textContent = date.toLocaleString('vi-VN');

    const actionCell = document.createElement('td');
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-sm btn-outline-primary me-1';
    copyBtn.textContent = 'Copy';
    copyBtn.onclick = () => copyHistoryUrl(record.shortUrl);
    actionCell.appendChild(copyBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-outline-danger';
    deleteBtn.textContent = 'Xóa';
    deleteBtn.onclick = () => deleteHistoryItem(record.id);
    actionCell.appendChild(deleteBtn);

    row.appendChild(keyIdCell);
    row.appendChild(originalUrlCell);
    row.appendChild(shortUrlCell);
    row.appendChild(timestampCell);
    row.appendChild(actionCell);

    tbody.appendChild(row);
  });
}

function copyHistoryUrl(url) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Đã copy URL",
          text: url,
          timer: 1500,
          showConfirmButton: false
        });
      }
    }).catch(err => {
      console.log("🚀 QuyNH: copyHistoryUrl -> error", err);
      fallbackCopyToClipboard(url);
    });
  } else {
    fallbackCopyToClipboard(url);
  }
}

async function deleteHistoryItem(id) {
  try {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: 'Bạn có chắc chắn muốn xóa mục này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      const db = await openDatabase();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.delete(id);

      transaction.oncomplete = () => {
        db.close();
        loadHistory();
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Đã xóa",
          timer: 1500,
          showConfirmButton: false
        });
      };

      transaction.onerror = () => {
        db.close();
        console.log("🚀 QuyNH: deleteHistoryItem -> transaction error", transaction.error);
      };
    }
  } catch (error) {
    console.log("🚀 QuyNH: deleteHistoryItem -> error", error);
  }
}

async function clearAllHistory() {
  try {
    const result = await Swal.fire({
      title: 'Xác nhận xóa toàn bộ?',
      text: 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa tất cả',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      const db = await openDatabase();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.clear();

      transaction.oncomplete = () => {
        db.close();
        loadHistory();
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Đã xóa toàn bộ lịch sử",
          timer: 1500,
          showConfirmButton: false
        });
      };

      transaction.onerror = () => {
        db.close();
        console.log("🚀 QuyNH: clearAllHistory -> transaction error", transaction.error);
      };
    }
  } catch (error) {
    console.log("🚀 QuyNH: clearAllHistory -> error", error);
  }
}

function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Đã copy URL",
        text: text,
        timer: 1500,
        showConfirmButton: false
      });
    }
  } catch (err) {
    console.log("🚀 QuyNH: fallbackCopyToClipboard -> error", err);
  }
  document.body.removeChild(textArea);
}

function hasQueryParameters(url) {
  const urlObject = new URL(url);
  return urlObject.search.length > 0;
}

function convert() {
  try {
    var destinationUrl = document.getElementById("destination-url");
    var utm_source = document.getElementById("utm-source");
    var utm_medium = document.getElementById("utm-medium");
    var utm_campaign = document.getElementById("utm-campaign");
    var utm_content = document.getElementById("utm-content");
    var utm_term = document.getElementById("utm-term");

    var buildUrl = destinationUrl.value;
    console.log("🚀 QuyNH: convert -> buildUrl", buildUrl)
    if (!buildUrl) {
      Swal.fire({
        title: 'Error!',
        text: '`Website URL` không được bỏ trống',
        icon: 'error',
        confirmButtonText: 'close'
      });
      return;
    }

    var originalUrl = buildUrl;

    if (!hasQueryParameters(buildUrl)) buildUrl = `${buildUrl}?v=1`;

    if (utm_source.value) buildUrl = `${buildUrl}&utm_source=${utm_source.value}`;
    if (utm_medium.value) buildUrl = `${buildUrl}&utm_medium=${utm_medium.value}`;
    if (utm_campaign.value) buildUrl = `${buildUrl}&utm_campaign=${utm_campaign.value}`;
    if (utm_content.value) buildUrl = `${buildUrl}&utm_content=${utm_content.value}`;
    if (utm_term.value) buildUrl = `${buildUrl}&utm_term=${utm_term.value}`;

    urlEncode = btoa(buildUrl);
    console.log("🚀 QuyNH: convert -> urlEncode", urlEncode)

    var targetUrl = BASE_URL + "?redirect=" + urlEncode;
    console.log("🚀 QuyNH: convert -> targetUrl", targetUrl)
    document.getElementById("output_text").value = targetUrl;

    // Save to history
    saveToHistory(originalUrl, targetUrl);
  } catch (error) {
    console.log("🚀 QuyNH: convert -> error", error)

  }
}

function copyURL() {
  var copyText = document.getElementById("output_text");
  copyText.select();
  copyText.setSelectionRange(0, 99999)
  document.execCommand("copy");
  // alert("Copied the text: " + copyText.value);

  Swal.fire({
    position: "center",
    icon: "success",
    title: "URL sau khi chuyển đổi",
    html: `<textarea type="text" class="form-control builder-field" readonly="readonly" rows="4" cols="50">${copyText.value}</textarea>`
  });
}

window.onload = (event) => {
  window.convert = convert;
  window.copyURL = copyURL;
  window.copyHistoryUrl = copyHistoryUrl;
  window.deleteHistoryItem = deleteHistoryItem;
  window.clearAllHistory = clearAllHistory;

  // Load history on page load
  loadHistory();
}

