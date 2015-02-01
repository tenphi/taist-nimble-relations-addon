DealViewPage = window.DealViewPage = {

  data: {
    title: 'Relations:',
    relations: [],
    disabled: true
  },
  selector: '.DealView .dealMainField.relatedTo',
  initialized: false,

  init: function () {
    this.initialized = true;

    taistApi.wait.once(function() {
      return $(this.selector).find('a').attr('href');
    }.bind(this), this._prepare.bind(this));
  },

  update: function() {
    if (!this.initialized) return;

    var href = $(this.selector).find('a').attr('href');
    this.contactId = href && href.split('=')[1];

    if (!this.contactId) {
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
    taistApi.log('deal-view page opened');

    var $container = $(this.selector);
    var $field = $(templates['deal-view']);

    rivets.bind($field, this.data);

    $container.append($field);

    this.update();
  }

};