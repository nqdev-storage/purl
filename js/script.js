// import { TIME_OUT, DELAY_TIME, TIME_OUT_SKIP, BASE_URL } from './constants.js';

var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var redirectUrlEncode = urlParams.get('redirect');

if (redirectUrlEncode === undefined || redirectUrlEncode === '' || redirectUrlEncode === null) {
  window.location.href = BASE_URL + '/convert.html';
}

var redirectUrl = atob(redirectUrlEncode);

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
