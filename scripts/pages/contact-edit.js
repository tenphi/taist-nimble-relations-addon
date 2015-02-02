ContactEditPage = {

  data: {
    title: 'Relations',
    relations: [],
    contacts: [],
    disabled: true
  },
  initialized: false,

  init: function () {
    this.initialized = true;
    this.data.addRelation = this._addRelation.bind(this);

    taistApi.wait.elementRender('.ContactEditView .CustomFieldsContainer tbody', this._prepare.bind(this));

    $(document).on('click', '.ContactEditView .nmbl-ButtonContent:contains(Update)', function() {
      this._save();
    }.bind(this));
  },

  update: function() {
    if (!this.initialized) return;

    var match = location.hash.match(/(\?|&)id=(.+)($|&)/);

    if (match) {
      this.contactId = match[2];
    } else {
      return;
    }

  },

  _save: function() {
    taistApi.log('update operation');

    var stack = [];
    var all = [];
    var prevRels = this.prevRelations.map(function(rel) { return rel.id; });
    var newRels = this.data.relations.map(function(rel) { return rel.id; });

    prevRels.forEach(function(id) {
      if (!~all.indexOf(id)) {
        all.push(id);
      }
    });
    newRels.forEach(function(id) {
      if (!~all.indexOf(id)) {
        all.push(id);
      }
    });

    all.forEach(function(id) {
      if (~prevRels.indexOf(id) && !~newRels.indexOf(id)) {
        stack.push(function(cb) {
          taistApi.log('remove relation', Contacts.findById(this.contactId).full_name, Contacts.findById(id).full_name);
          Relations.remove(this.contactId, id, cb);
        }.bind(this));
      } else if (!~prevRels.indexOf(id) && ~newRels.indexOf(id)) {
        stack.push(function(cb) {
          taistApi.log('add relation', Contacts.findById(this.contactId).full_name, Contacts.findById(id).full_name);
          Relations.add(this.contactId, id, cb);
        }.bind(this));
      }
    }.bind(this));

    if (!stack.length) {
      return;
    }

    var cb = updateAll;

    for (var i = 0; i < stack.length; i++) {
      cb = (function(i, callback){
        return function(err) {
          if (err) {
            taistApi.log(err);
            callback(err);
            return;
          }
          stack[i](callback);
        };
      })(i, cb);
    }

    cb();
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

    Relations.getAll(this.contactId, function(err, relationIds) {
      this._updateContacts(relationIds);
      this.prevRelations = this.data.relations.slice(0);
      this._updateData();
      this._addEvents();
    }.bind(this));
  },

  _updateContacts: function(relationIds) {
    relationIds = relationIds || this.data.relations.map(function(relation) {
      return relation.id;
    });
    this.data.relations = Contacts.getRelationContacts(relationIds);
    this.data.contacts = Contacts.list.filter(function(contact) {
      return !~relationIds.indexOf(contact.id) && contact.id !== this.contactId;
    }.bind(this));
  },

  _updateData: function() {
    this.data.disabled = !this.data.contacts.length;
    this.data.empty = !this.data.relations.length;

    if (!this.data.disabled) {
      this.data.addedRelation = this.data.contacts[0].id;
    }
  },

  _addEvents: function() {
    var relations = this.data.relations;

    relations.forEach(function(relation) {
      relation.remove = function() {
        var rel = relations.splice(relations.indexOf(relation), 1);
        if (rel && rel[0]) {
          this._updateContacts();
          this._updateData();
          this._addEvents();
        }
      }.bind(this);
    }.bind(this));
  },

  _addRelation: function() {
    var id = $('.taist-select').val();
    var relations = this.data.relations;
    var contact = Contacts.findById(id);
    taistApi.log('adding relation:', id);

    if (contact) {
      relations.push(contact);
      this._updateContacts();
      this._updateData();
      this._addEvents();
    }
  }

};