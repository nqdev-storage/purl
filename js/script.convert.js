// import { TIME_OUT, DELAY_TIME, TIME_OUT_SKIP, BASE_URL } from './constants.js';

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
    if (!buildUrl)
      Swal.fire({
        title: 'Error!',
        text: '`Website URL` không được bỏ trống',
        icon: 'error',
        confirmButtonText: 'close'
      })

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
}
