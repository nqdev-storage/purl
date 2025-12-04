// import { TIME_OUT, DELAY_TIME, TIME_OUT_SKIP, BASE_URL } from './constants.js';

var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var redirectUrlEncode = urlParams.get('redirect');

if (redirectUrlEncode === undefined || redirectUrlEncode === '' || redirectUrlEncode === null) {
  window.location.href = BASE_URL + '/convert.html';
}

function isSafeRedirect(url) {
  try {
    // Only allow same-origin relative URLs (no protocol, no slashes at start)
    // Prevent dangerous schemes such as "javascript:", "data:", etc.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/URL
    const parsed = new URL(url, window.location.origin);
    // Only allow redirects within the same origin
    if (parsed.origin !== window.location.origin) return false;
    // Disallow javascript: and other non-HTTP/HTTPS protocols
    const unsafeProtocols = ['javascript:', 'data:', 'vbscript:'];
    if (unsafeProtocols.includes(parsed.protocol)) return false;
    // Optionally, enforce only certain paths (e.g., starts with "/")
    return true;
  } catch (e) {
    return false;
  }
}

var decodedRedirect = atob(redirectUrlEncode || '');
var redirectUrl = isSafeRedirect(decodedRedirect) ? decodedRedirect : BASE_URL + '/';

// main
const txtMinuteOut = document.querySelector('.minute-text');
const txtSecondOut = document.querySelector('.second-text');
const txtStaticElms = document.querySelectorAll('.static-text');
const btnRedirect = document.querySelector('#redirect-button');
const loadingSpinner = document.querySelector('.loading-spinner');

let timeOut = TIME_OUT;

btnRedirect.addEventListener('click', () => {
  window.location.href = redirectUrl;
});

window.onload = (event) => {
  const countDownRedirect = setInterval(() => {
    txtStaticElms.forEach((elm) => {
      elm.classList.remove('invisible');
    });

    if (timeOut >= 0) {
      if (timeOut === TIME_OUT - TIME_OUT_SKIP) {
        loadingSpinner.classList.remove('d-none');
        setTimeout(() => {
          loadingSpinner.classList.add('d-none');
          btnRedirect.classList.remove('d-none');
        }, DELAY_TIME * 1000);
      }
      const minutes = Math.floor(timeOut / 60);
      const seconds = timeOut - minutes * 60;

      txtMinuteOut.innerHTML = `${minutes.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}`;

      txtSecondOut.innerHTML = `${seconds.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}`;

      timeOut -= 1;
    } else {
      clearInterval(countDownRedirect);
      window.location.href = redirectUrl;
    }
  }, 1000);
};
