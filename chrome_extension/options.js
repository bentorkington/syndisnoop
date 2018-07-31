function save_options() {
    var warningStyle = document.getElementById('warningtype').value;
    var removeGiphy = document.getElementById('removeGiphy').checked;
    var removeArticleRelated = document.getElementById('removeArticleRelated').checked;
    var removeArticleAds = document.getElementById('removeArticleAds').checked;
    var mutes = document.getElementById('mutedAuthors').value.split(/\r?\n/);
    var frontPageSectionHide = Array.from(document.getElementById('frontPageSectionHide').getElementsByTagName('input')).filter(x => x.checked).map(x => x.getAttribute('data-section-name'));

    chrome.storage.sync.set({
        'warningStyle': warningStyle,
        'removeGiphy': removeGiphy,
        'removeArticleRelated': removeArticleRelated,
        'removeArticleAds': removeArticleAds,
        'neverAutoPlay': document.getElementById('neverAutoPlay').checked,
        'mutedAuthors': mutes,
        'removeOutbrain': document.getElementById('removeOutbrain').checked,
        'frontPageSectionHide': frontPageSectionHide,
    }, function() {
        // Update status to let user know options were saved
        var status = document.getElementById('status');
        status.textContent = 'Options saved';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    chrome.storage.sync.get({
        'warningStyle': 'greyfloat',
        'removeGiphy': 'false',     // most people are 12, leave the gifs alone
        'removeArticleAds': 'true',
        'removeArticleRelated': 'true',
        'neverAutoPlay': 'true',
        'mutedAuthors': [  ],
        'removeOutbrain': true,
        'frontPageSectionHide': [ ],
        'licenceValid': false,
        'licenceType': "",
    }, function(items) {
        document.getElementById('warningtype').value = items.warningStyle;
        document.getElementById('removeGiphy').checked = items.removeGiphy;
        document.getElementById('removeArticleAds').checked = items.removeArticleAds;
        document.getElementById('removeArticleRelated').checked = items.removeArticleRelated;
        document.getElementById('neverAutoPlay').checked = items.neverAutoPlay;
        document.getElementById('mutedAuthors').value = items.mutedAuthors.join('\n');
        document.getElementById('removeOutbrain').checked = items.removeOutbrain;
        Array.from(document.getElementById('frontPageSectionHide').getElementsByTagName('input')).forEach(x => x.checked = (items.frontPageSectionHide.indexOf(x.getAttribute('data-section-name')) > -1));

        var status = document.getElementById('status');
        status.textContent = items.licenceType;

    });
}

function allSections(state) {
    Array.from(document.getElementById('frontPageSectionHide').getElementsByTagName('input')).forEach(x => x.checked = state);
}
function setAllSections() { allSections(true); }
function clearAllSections() { allSections(false); }

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('sectionsSetAll').addEventListener('click', setAllSections);
document.getElementById('sectionsClearAll').addEventListener('click', clearAllSections);