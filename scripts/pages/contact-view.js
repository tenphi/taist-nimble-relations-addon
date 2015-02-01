ContactViewPage = window.ContactViewPage = {

  data: {
    title: 'Relations',
    relations: []
  },
  initialized: false,

  init: function () {
    this.initialized = true;
    taistApi.wait.elementRender('.ContactView .mainInfoWrapper', this._prepare.bind(this));
  },

  update: function() {
    if (!this.initialized) return;

    var match = location.hash.match(/(\?|&)id=(.+)($|&)/);

    if (match) {
      this.contactId = match[2];
    } else {
      return;
    }

    Relations.getAll(this.contactId, function(err, relationIds) {
      this.data.relations = Contacts.getRelationContacts(relationIds);
      var len = this.data.relations.length;
      this.data.relations.forEach(function(contact, i) {
        contact.last = (i === len - 1);
      });
      this.data.disabled = !len;
    }.bind(this));
  },

  _prepare: function() {
    taistApi.log('contact-view page opened');

    var $container = $('.ContactView .mainInfoWrapper');
    var $field = $(templates['contact-view']);

    rivets.bind($field, this.data);

    $container.find('.address.middle-column').after($field);

    this.update();
  }

};