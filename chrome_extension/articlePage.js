
function insertArticleHeaderWarning(page, warningElement)
{
    var mainContainer = firstOrNull( document.getElementsByClassName("mainContainer"));
    if (mainContainer) {
        mainContainer.insertBefore(warningElement, mainContainer.children[0]);
    }
}

var style;

// read settings - this doesn't work right now
chrome.storage.sync.get({
    warningStyle: "greyfloat",
    removeGiphy: 'false',
    removeArticleRelated: 'true',
    removeArticleAds: 'true',
    neverAutoPlay: 'false',
    removeOutbrain: 'true', 
}, function(items) {
    style = items.warningStyle;

    var articleSection = document.getElementById("article-content");

    if(items.removeArticleRelated) 
        articleSection.children.filter(x => x.classList.contains('pb-f-article-related-articles')).forEach(x => articleSection.removeChild(x));

    if(items.removeArticleAds) 
    {
        articleSection.children.filter(x => x.classList.contains('ad-container')).forEach(x => articleSection.removeChild(x));
    }

    if(items.removeOutbrain) {
        var outbrain = firstOrNull(document.getElementsByClassName("OUTBRAIN"));
        if (outbrain) {
            outbrain.parentElement.removeChild(outbrain);
        }
    }

    scanPage(items);
})

function eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

function scanPage(snoopSettings) {
    setTimeout(function () {
        if (snoopSettings.removeGiphy == true) {
            Array.from(document.getElementsByClassName('giphy-embed')).forEach(gif => gif.parentNode.removeChild(gif));
        }

        if (snoopSettings.neverAutoPlay == true) {
            var apStop = firstOrNull(document.getElementsByClassName('vcNever'));

            if (apStop) {
                eventFire(apStop, 'click');
            }
        }

    }, 500);
}


