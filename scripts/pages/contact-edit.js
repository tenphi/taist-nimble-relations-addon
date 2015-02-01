ContactEditPage = window.ContactEditPage = {

  data: {
    title: 'Relations',
    relations: [],
    contacts: []
  },
  initialized: false,

  init: function () {
    this.initialized = true;
    this.data.addRelation = this._addRelation.bind(this);

    taistApi.wait.elementRender('.ContactEditView .CustomFieldsContainer tbody', this._prepare.bind(this));
  },

  update: function() {
    if (!this.initialized) return;

    Relations.getAll(this.contactId, function(err, relationIds) {
      this.data.relations = Contacts.getRelationContacts(relationIds);
      this._updateContacts();
      this._addEvents();
    }.bind(this));
  },

  _prepare: function() {
    taistApi.log('contact-edit page opened');

    var match = location.hash.match(/(\?|&)id=(.+)($|&)/);

    if (match) {
      this.contactId = match[2];
    } else {
      return;
    }

    var $container = $('.CustomFieldsContainer tbody');
    var $header = $(templates['contact-edit-header']);
    var $body = $(templates['contact-edit-body']);

    rivets.bind($header, this.data);
    rivets.bind($body, this.data);

    $container.append($header);
    $container.append($body);

    this.update();
  },

  _updateContacts: function() {
    Relations.getAll(this.contactId, function(err, relationIds) {
      this.data.contacts = Contacts.list.filter(function(contact) {
        return !~relationIds.indexOf(contact.id) && contact.id !== this.contactId;
      }.bind(this));

      this.data.disabled = !this.data.contacts.length;

      if (!this.data.disabled) {
        this.data.addedRelation = this.data.contacts[0].id;
      }
    }.bind(this));
  },

  _addEvents: function() {
    var relations = this.data.relations;
    var contactId = this.contactId;

    relations.forEach(function(relation) {
      relation.remove = function() {
        relations.splice(relations.indexOf(relation), 1);
        Relations.remove(contactId, relation.id, function() {
          this._updateContacts();
        }.bind(this));
      }.bind(this);
    }.bind(this));
  },

  _addRelation: function() {
    var id = this.data.addedRelation;

    taistApi.log('adding relation:', id);
    Relations.add(this.contactId, id, function() {
      this.data.relations.push(Contacts.findById(id));
      this._updateContacts();
      this._addEvents();
    }.bind(this));
  }

};