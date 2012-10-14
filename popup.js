// Copyright 2012 Braille Printer Team. All rights reserved.
// Use of this source code is governed by the Apache 2.0 license.

var APISERVER = "http://braille-printer.appspot.com";
var gSelectedText;

document.addEventListener('DOMContentLoaded', function() {
    brailleSelectedText();
});


function brailleSelectedText() {
    chrome.tabs.getSelected(null, function(tab) {
        var port = chrome.tabs.connect(tab.id);
        port.postMessage({cmd: "REQ_SELECTED_TEXT"});
    
        port.onMessage.addListener(function getResp(response) {
            resultArea = document.getElementById("result");
            if (response.selectedText == "") {
                resultArea.innerHTML = "변환할 텍스트가 없습니다.";
                return;
            }
            resultArea.innerHTML = "점자 변환 중...";
            gSelectedText = response.selectedText;

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
//                    resultArea.innerHTML = xhr.responseText + "<br>" + xhr.responseText + "<br>" + xhr.responseText + "<br>"  + xhr.responseText + "<br>" + xhr.responseText + "<br>" + xhr.responseText + "<br>" + xhr.responseText + "<br>" + xhr.responseText + "<br>" + xhr.responseText + "<br>" + xhr.responseText + "<br>" + xhr.responseText + "<br>" + xhr.responseText + "<br>";
                    resultArea.innerHTML = xhr.responseText;
                    activeButtons();
                }
            }

            var params = "input=" + response.selectedText;
            xhr.open("POST", APISERVER + "/braille", true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(params);
        });
    });
}

function activeButtons() {
    var btnSpeak = document.getElementById("btn-speak");
    var btnPrint = document.getElementById("btn-print");
    var btnCloudPrint = document.getElementById("btn-cloud-print"); 

    btnSpeak.disabled = "";
    btnPrint.disabled = "";
    btnCloudPrint.disabled = "";

    // Spek it
    btnSpeak.addEventListener("click", function() {
        chrome.tts.speak(gSelectedText);
    }, true);

    // Local print
    $("#btn-print").click(function() {
//        $("#result").print();
        window.print();
    });

    // /printq/add API 호출
    btnCloudPrint.addEventListener("click", function() {
        var postdata = "input=" + gSelectedText;
        $.post(APISERVER + "/printq/add", postdata, function() {
            $("#toast").html("Print reserved.").fadeIn("slow", function() {
                setTimeout(function() {         
                    $("#toast").fadeOut("slow");    
                }, 3000);
            });
        });
    }, true);
}

