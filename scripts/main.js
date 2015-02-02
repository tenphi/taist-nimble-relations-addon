var taistApi, options = {}, initialized = false;

function compileTemplate(name, data) {
  return rivets.bind($(templates[name]), data);
}

function inject() {
  xhrWrapper.onRequestFinish(function (request) {
    var url = request.responseURL;
    var tokenMatches = url.match(/\/api\/sessions\/([0-9abcdef-]{36})\?/);
    if (tokenMatches) {
      options.token = tokenMatches[1];
      if (!initialized) {
        init();
        initialized = true;
      }
    }
  });
}

function updateAll() {
  taistApi.log('update all');

  Contacts.update(function() {
    ContactEditPage.update();
    ContactViewPage.update();

    // it retrieves info from rendered page
    setTimeout(function() {
      DealViewPage.update();
    }, 100);
  });
}

function init() {
  Contacts.update();

  ContactEditPage.init();
  ContactViewPage.init();
  DealViewPage.init();

  taistApi.hash.onChange(function(newHash, oldHash) {
    ['contacts/view', 'contacts/edit', 'deals/view'].forEach(function(url) {
      if (~newHash.indexOf(url)) {
        updateAll();
      }
    });
  });

  taistApi.log('token is received: ', options.token);
}

function start(_taistApi, entryPoint) {
  taistApi = window.taistApi = _taistApi;
  return inject();
}