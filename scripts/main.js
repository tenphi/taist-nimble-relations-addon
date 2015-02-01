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

function init() {
  Contacts.update();

  ContactEditPage.init();

  //taistApi.hash.onChange(function(newHash, oldHash) {
  //  ['app/contacts/list', 'app/contacts/view', 'app/contacts/edit_contact']
  //  console.log(newHash, oldHash);
  //});
  taistApi.log('token is received: ', options.token);
}

function start(_taistApi, entryPoint) {
  taistApi = _taistApi;
  return inject();
}