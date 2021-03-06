(function init(){

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

  // clear cache
  Relations.cache = {};

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
  taistApi = _taistApi;
  return inject();
}
var templates; if (!templates) { templates = {}} templates["contact-edit-body"] = '<tr class="twoColumn">  <td colspan="2">    <div class="leftPanel">      <div class="ContactFieldWidget edit multi-line-text-box twoColumn">        <div>          <div class="ContactInputWidget initial">            <div class="fieldHolder">              <div class="nmbl-CustomFieldFormTextWidget">                <div class="valueHolder">                  <div rv-show="empty">                    No relations                  </div>                  <div class="taist-contact" rv-each-contact="relations">                    <a rv-href="contact.link">{ contact.full_name }</a>                    <img rv-on-click="contact.remove" class="gwt-Image"                         src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAATCAYAAABLN4eXAAAAlUlEQVR42mNgoBScO3dO//z58yeA9H8YhvL18WnaiKwBCW/Ep+kkEL9BE3sDEkdX+B2H6bjwd/I0gQDQs9EggTNnzthgczZIHBoo0XBBijRduHDB7NSpU0pA9h6of/eA+CDxEaWJrNAD4rmrVq1iRtawf/9+lrNnz87HpsmfmNQAUgfXdPHiRW6g4AoCmlaA1DHQFQAAk+K2Z8TV29MAAAAASUVORK5CYII=">                    <div style="clear:both;"></div>                  </div>                </div>              </div>            </div>          </div>        </div>        <div rv-hide="disabled">          <select class="taist-select" rv-value="addedRelation">            <option rv-each-contact="contacts" rv-value="contact.id">{ contact.full_name }</option>          </select>          <a rv-on-click="addRelation" class="addField" style="display: inline-block;">Add relation</a>        </div>      </div>    </div>  </td></tr>'; 
var templates; if (!templates) { templates = {}} templates["contact-edit-header"] = '<tr class="twoColumn">  <td colspan="2">    <div class="leftPanel">      <div class="ContactFieldWidget edit separator twoColumn noborder">        <div>          <div class="ContactInputWidget">            <div class="fieldHolder">              <div class="nmbl-CustomFieldSeparator">                <div class="valueHolder">                  <div style="clear:both;"></div>                  <div class="blockHeader resolutionMin">{ title }</div>                </div>              </div>            </div>          </div>        </div>        <div aria-hidden="true" style="display: none;"><a class="addField">{ title }</a></div>      </div>    </div>  </td></tr>'; 
var templates; if (!templates) { templates = {}} templates["contact-view"] = '<div rv-hide="disabled" class="relations info-field middle-column" style="white-space: nowrap;">  <span>{ title }</span>  <span rv-each-contact="relations" style="width: auto;">    <a rv-href="contact.link">{ contact.full_name }</a><em style="width: auto;" rv-hide="contact.last">,</span>  </em></div>'; 
var templates; if (!templates) { templates = {}} templates["deal-view"] = '<span rv-hide="disabled" style="white-space: nowrap;">  (  <span>{ title }</span>  <span rv-each-contact="relations" style="width: auto;">    <a rv-href="contact.link">{ contact.full_name }</a><span style="width: auto;" rv-hide="contact.last">,</span>&nbsp;  </span>  )</span>'; 
var Contacts = {

  list: [],

  update: function(cb) {
    jQuery.ajax(
      {
        url: '/api/v1/contacts/list?keyword=&query=&sort=recently%20viewed:asc&per_page=3000&page=1&fields=first%20name,last%20name,company%20name,parent%20company,email,phone,lead%20type,lead%20status,address,title&record_type=',
        method: 'GET',
        headers: {
          Authorization: 'Nimble token="' + options.token + '"'
        },
        success: function(data) {
          if (!data) return;
          Contacts.list = data.resources;
          this._prepare();
          cb && cb(null, Contacts.list);
          taistApi.log(Contacts.list);
        }.bind(this)
      });
  },

  _prepare: function() {
    this.list = this.list.filter(function(contact) {
      if (contact.record_type === 'person') {
        contact.full_name = contact.fields['first name'][0].value;
        if (contact.fields['last name']) {
          contact.full_name += ' ' + contact.fields['last name'][0].value;
        }
        contact.link = '#app/contacts/view?id=' + contact.id;
        return true;
      }
    });
  },

  getRelationContacts: function(relationIds) {
    var _this = this;

    return relationIds.map(function(id) {
      return _this.findById(id);
    }).filter(function(contact) {
      return !!contact;
    });
  },

  findById: function(id) {
    for (var i = 0, len = this.list.length; i < len; i++) {
      if (this.list[i].id === id) {
        return this.list[i];
      }
    }
  }

};
var Relations = {

  cache: {},

  getAll: function(contactId, cb) {
    taistApi.companyData.setCompanyKey(location.host);
    if (this.cache[contactId]) {
      cb(null, this.cache[contactId]);
      return;
    }
    taistApi.companyData.get('relations' + contactId, function(err, relationIds) {
      taistApi.log('get all relations of #' + contactId, relationIds);
      this.cache[contactId] = relationIds || []
      cb(err, this.cache[contactId]);
    }.bind(this));
  },

  add: function(id1, id2, cb) {
    this.getAll(id1, function(err, relations) {
      if (!~relations.indexOf(id2)) {
        relations.push(id2);
        this._save(id1, relations, function() {
          this.getAll(id2, function(err, relations) {
            if (!~relations.indexOf(id1)) {
              relations.push(id1);
              this._save(id2, relations, cb);
            }
          }.bind(this));
        }.bind(this));
      }
    }.bind(this));
  },

  remove: function(id1, id2, cb) {
    this.getAll(id1, function(err, relations) {
      if (err) {
        cb && cb(err);
        return;
      }
      relations.splice(relations.indexOf(id2), 1);
      this._save(id1, relations, function(err) {
        if (err) {
          cb && cb(err);
          return;
        }
        this.getAll(id2, function(err, relations) {
          if (err) {
            cb && cb(err);
            return;
          }
          relations.splice(relations.indexOf(id1), 1);
          this._save(id2, relations, cb);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  },

  _save: function(contactId, relations, cb) {
    delete this.cache[contactId];
    taistApi.companyData.set('relations' + contactId, relations, function(err) {
      err && taistApi.log('relation wasn\'t saved:');
      cb && cb(err);
    });
  }

};
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
ContactViewPage = {

  data: {
    title: 'Relations',
    relations: [],
    disabled: true
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
DealViewPage = {

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
var _responseHandlers = [],
  listening = false;

function listenToRequests() {
  var originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.send = function() {
    listenForRequestFinish(this);
    originalSend.apply(this, arguments);
  }
}

function listenForRequestFinish(request) {
  var originalOnReadyStateChange = request.onreadystatechange;

  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      _responseHandlers.forEach(function(handler) {
        handler(request);
      });
    }

    if (originalOnReadyStateChange) {
      originalOnReadyStateChange.apply(request, arguments);
    }
  };
}

var xhrWrapper = {

  onRequestFinish: function(handler) {
    _responseHandlers.push(handler);
    if (!listening) {
      listenToRequests();
    }
  },

  isListening: function() {
    return listening;
  }

};
// Rivets.js + Sightglass.js
// version: 0.7.1
// author: Michael Richards
// license: MIT
(function(){function t(t,i,s,n){return new e(t,i,s,n)}function e(t,e,s,n){this.options=n||{},this.options.adapters=this.options.adapters||{},this.obj=t,this.keypath=e,this.callback=s,this.objectPath=[],this.parse(),i(this.target=this.realize())&&this.set(!0,this.key,this.target,this.callback)}function i(t){return"object"==typeof t&&null!==t}function s(t){throw new Error("[sightglass] "+t)}t.adapters={},e.tokenize=function(t,e,i){for(tokens=[],current={i:i,path:""},index=0;index<t.length;index++)chr=t.charAt(index),~e.indexOf(chr)?(tokens.push(current),current={i:chr,path:""}):current.path+=chr;return tokens.push(current),tokens},e.prototype.parse=function(){interfaces=this.interfaces(),interfaces.length||s("Must define at least one adapter interface."),~interfaces.indexOf(this.keypath[0])?(root=this.keypath[0],path=this.keypath.substr(1)):("undefined"==typeof(root=this.options.root||t.root)&&s("Must define a default root adapter."),path=this.keypath),this.tokens=e.tokenize(path,interfaces,root),this.key=this.tokens.pop()},e.prototype.realize=function(){return current=this.obj,unreached=!1,this.tokens.forEach(function(t,e){i(current)?("undefined"!=typeof this.objectPath[e]?current!==(prev=this.objectPath[e])&&(this.set(!1,t,prev,this.update.bind(this)),this.set(!0,t,current,this.update.bind(this)),this.objectPath[e]=current):(this.set(!0,t,current,this.update.bind(this)),this.objectPath[e]=current),current=this.get(t,current)):(unreached===!1&&(unreached=e),(prev=this.objectPath[e])&&this.set(!1,t,prev,this.update.bind(this)))},this),unreached!==!1&&this.objectPath.splice(unreached),current},e.prototype.update=function(){(next=this.realize())!==this.target&&(i(this.target)&&this.set(!1,this.key,this.target,this.callback),i(next)&&this.set(!0,this.key,next,this.callback),oldValue=this.value(),this.target=next,this.value()!==oldValue&&this.callback())},e.prototype.value=function(){return i(this.target)?this.get(this.key,this.target):void 0},e.prototype.setValue=function(t){i(this.target)&&this.adapter(this.key).set(this.target,this.key.path,t)},e.prototype.get=function(t,e){return this.adapter(t).get(e,t.path)},e.prototype.set=function(t,e,i,s){action=t?"observe":"unobserve",this.adapter(e)[action](i,e.path,s)},e.prototype.interfaces=function(){return interfaces=Object.keys(this.options.adapters),Object.keys(t.adapters).forEach(function(t){~interfaces.indexOf(t)||interfaces.push(t)}),interfaces},e.prototype.adapter=function(e){return this.options.adapters[e.i]||t.adapters[e.i]},e.prototype.unobserve=function(){this.tokens.forEach(function(t,e){(obj=this.objectPath[e])&&this.set(!1,t,obj,this.update.bind(this))},this),i(this.target)&&this.set(!1,this.key,this.target,this.callback)},"undefined"!=typeof module&&module.exports?module.exports=t:"function"==typeof define&&define.amd?define([],function(){return this.sightglass=t}):this.sightglass=t}).call(this);
(function(){var t,e,i,n,r=function(t,e){return function(){return t.apply(e,arguments)}},s=[].slice,o={}.hasOwnProperty,u=function(t,e){function i(){this.constructor=t}for(var n in e)o.call(e,n)&&(t[n]=e[n]);return i.prototype=e.prototype,t.prototype=new i,t.__super__=e.prototype,t},h=[].indexOf||function(t){for(var e=0,i=this.length;i>e;e++)if(e in this&&this[e]===t)return e;return-1};t={options:["prefix","templateDelimiters","rootInterface","preloadData","handler"],extensions:["binders","formatters","components","adapters"],"public":{binders:{},components:{},formatters:{},adapters:{},prefix:"rv",templateDelimiters:["{","}"],rootInterface:".",preloadData:!0,handler:function(t,e,i){return this.call(t,e,i.view.models)},configure:function(e){var i,n,r,s;null==e&&(e={});for(r in e)if(s=e[r],"binders"===r||"components"===r||"formatters"===r||"adapters"===r)for(n in s)i=s[n],t[r][n]=i;else t["public"][r]=s},bind:function(e,i,n){var r;return null==i&&(i={}),null==n&&(n={}),r=new t.View(e,i,n),r.bind(),r}}},window.jQuery||window.$?(n="on"in jQuery.prototype?["on","off"]:["bind","unbind"],e=n[0],i=n[1],t.Util={bindEvent:function(t,i,n){return jQuery(t)[e](i,n)},unbindEvent:function(t,e,n){return jQuery(t)[i](e,n)},getInputValue:function(t){var e;return e=jQuery(t),"checkbox"===e.attr("type")?e.is(":checked"):e.val()}}):t.Util={bindEvent:function(){return"addEventListener"in window?function(t,e,i){return t.addEventListener(e,i,!1)}:function(t,e,i){return t.attachEvent("on"+e,i)}}(),unbindEvent:function(){return"removeEventListener"in window?function(t,e,i){return t.removeEventListener(e,i,!1)}:function(t,e,i){return t.detachEvent("on"+e,i)}}(),getInputValue:function(t){var e,i,n,r;if("checkbox"===t.type)return t.checked;if("select-multiple"===t.type){for(r=[],i=0,n=t.length;n>i;i++)e=t[i],e.selected&&r.push(e.value);return r}return t.value}},t.TypeParser=function(){function t(){}return t.types={primitive:0,keypath:1},t.parse=function(t){return/^'.*'$|^".*"$/.test(t)?{type:this.types.primitive,value:t.slice(1,-1)}:"true"===t?{type:this.types.primitive,value:!0}:"false"===t?{type:this.types.primitive,value:!1}:"null"===t?{type:this.types.primitive,value:null}:"undefined"===t?{type:this.types.primitive,value:void 0}:isNaN(Number(t))===!1?{type:this.types.primitive,value:Number(t)}:{type:this.types.keypath,value:t}},t}(),t.TextTemplateParser=function(){function t(){}return t.types={text:0,binding:1},t.parse=function(t,e){var i,n,r,s,o,u,h;for(u=[],s=t.length,i=0,n=0;s>n;){if(i=t.indexOf(e[0],n),0>i){u.push({type:this.types.text,value:t.slice(n)});break}if(i>0&&i>n&&u.push({type:this.types.text,value:t.slice(n,i)}),n=i+e[0].length,i=t.indexOf(e[1],n),0>i){o=t.slice(n-e[1].length),r=u[u.length-1],(null!=r?r.type:void 0)===this.types.text?r.value+=o:u.push({type:this.types.text,value:o});break}h=t.slice(n,i).trim(),u.push({type:this.types.binding,value:h}),n=i+e[1].length}return u},t}(),t.View=function(){function e(e,i,n){var s,o,u,h,l,a,p,d,c,f,b,v;for(this.els=e,this.models=i,null==n&&(n={}),this.update=r(this.update,this),this.publish=r(this.publish,this),this.sync=r(this.sync,this),this.unbind=r(this.unbind,this),this.bind=r(this.bind,this),this.select=r(this.select,this),this.build=r(this.build,this),this.componentRegExp=r(this.componentRegExp,this),this.bindingRegExp=r(this.bindingRegExp,this),this.options=r(this.options,this),this.els.jquery||this.els instanceof Array||(this.els=[this.els]),c=t.extensions,l=0,p=c.length;p>l;l++){if(o=c[l],this[o]={},n[o]){f=n[o];for(s in f)u=f[s],this[o][s]=u}b=t["public"][o];for(s in b)u=b[s],null==(h=this[o])[s]&&(h[s]=u)}for(v=t.options,a=0,d=v.length;d>a;a++)o=v[a],this[o]=n[o]||t["public"][o];this.build()}return e.prototype.options=function(){var e,i,n,r,s;for(i={},s=t.extensions.concat(t.options),n=0,r=s.length;r>n;n++)e=s[n],i[e]=this[e];return i},e.prototype.bindingRegExp=function(){return new RegExp("^"+this.prefix+"-")},e.prototype.componentRegExp=function(){return new RegExp("^"+this.prefix.toUpperCase()+"-")},e.prototype.build=function(){var e,i,n,r,s,o,u,h;for(this.bindings=[],e=this.bindingRegExp(),n=this.componentRegExp(),i=function(e){return function(i,n,r,s){var o,u,h,l,a,p,d;return a={},d=function(){var t,e,i,n;for(i=s.split("|"),n=[],t=0,e=i.length;e>t;t++)p=i[t],n.push(p.trim());return n}(),o=function(){var t,e,i,n;for(i=d.shift().split("<"),n=[],t=0,e=i.length;e>t;t++)u=i[t],n.push(u.trim());return n}(),l=o.shift(),a.formatters=d,(h=o.shift())&&(a.dependencies=h.split(/\s+/)),e.bindings.push(new t[i](e,n,r,l,a))}}(this),s=function(r){return function(o){var u,h,l,a,p,d,c,f,b,v,y,g,m,w,x,k,E,N,V,T,O,R,B,C,j,S,U,A;if(3===o.nodeType){if(b=t.TextTemplateParser,(d=r.templateDelimiters)&&(m=b.parse(o.data,d)).length&&(1!==m.length||m[0].type!==b.types.text)){for(k=0,T=m.length;T>k;k++)g=m[k],y=document.createTextNode(g.value),o.parentNode.insertBefore(y,o),1===g.type&&i("TextBinding",y,null,g.value);o.parentNode.removeChild(o)}}else if(1===o.nodeType)if(n.test(o.nodeName))w=o.nodeName.replace(n,"").toLowerCase(),r.bindings.push(new t.ComponentBinding(r,o,w));else{for(a="SCRIPT"===o.nodeName||"STYLE"===o.nodeName,C=o.attributes,E=0,O=C.length;O>E;E++)if(u=C[E],e.test(u.name)){if(w=u.name.replace(e,""),!(l=r.binders[w])){j=r.binders;for(c in j)x=j[c],"*"!==c&&-1!==c.indexOf("*")&&(v=new RegExp("^"+c.replace(/\*/g,".+")+"$"),v.test(w)&&(l=x))}l||(l=r.binders["*"]),l.block&&(a=!0,h=[u])}for(S=h||o.attributes,N=0,R=S.length;R>N;N++)u=S[N],e.test(u.name)&&(w=u.name.replace(e,""),i("Binding",o,w,u.value))}if(!a){for(U=function(){var t,e,i,n;for(i=o.childNodes,n=[],e=0,t=i.length;t>e;e++)f=i[e],n.push(f);return n}(),A=[],V=0,B=U.length;B>V;V++)p=U[V],A.push(s(p));return A}}}(this),h=this.els,o=0,u=h.length;u>o;o++)r=h[o],s(r);this.bindings.sort(function(t,e){var i,n;return((null!=(i=e.binder)?i.priority:void 0)||0)-((null!=(n=t.binder)?n.priority:void 0)||0)})},e.prototype.select=function(t){var e,i,n,r,s;for(r=this.bindings,s=[],i=0,n=r.length;n>i;i++)e=r[i],t(e)&&s.push(e);return s},e.prototype.bind=function(){var t,e,i,n,r;for(n=this.bindings,r=[],e=0,i=n.length;i>e;e++)t=n[e],r.push(t.bind());return r},e.prototype.unbind=function(){var t,e,i,n,r;for(n=this.bindings,r=[],e=0,i=n.length;i>e;e++)t=n[e],r.push(t.unbind());return r},e.prototype.sync=function(){var t,e,i,n,r;for(n=this.bindings,r=[],e=0,i=n.length;i>e;e++)t=n[e],r.push(t.sync());return r},e.prototype.publish=function(){var t,e,i,n,r;for(n=this.select(function(t){return t.binder.publishes}),r=[],e=0,i=n.length;i>e;e++)t=n[e],r.push(t.publish());return r},e.prototype.update=function(t){var e,i,n,r,s,o,u;null==t&&(t={});for(i in t)n=t[i],this.models[i]=n;for(o=this.bindings,u=[],r=0,s=o.length;s>r;r++)e=o[r],u.push(e.update(t));return u},e}(),t.Binding=function(){function e(t,e,i,n,s){this.view=t,this.el=e,this.type=i,this.keypath=n,this.options=null!=s?s:{},this.getValue=r(this.getValue,this),this.update=r(this.update,this),this.unbind=r(this.unbind,this),this.bind=r(this.bind,this),this.publish=r(this.publish,this),this.sync=r(this.sync,this),this.set=r(this.set,this),this.eventHandler=r(this.eventHandler,this),this.formattedValue=r(this.formattedValue,this),this.parseTarget=r(this.parseTarget,this),this.observe=r(this.observe,this),this.setBinder=r(this.setBinder,this),this.formatters=this.options.formatters||[],this.dependencies=[],this.formatterObservers={},this.model=void 0,this.setBinder()}return e.prototype.setBinder=function(){var t,e,i,n;if(!(this.binder=this.view.binders[this.type])){n=this.view.binders;for(t in n)i=n[t],"*"!==t&&-1!==t.indexOf("*")&&(e=new RegExp("^"+t.replace(/\*/g,".+")+"$"),e.test(this.type)&&(this.binder=i,this.args=new RegExp("^"+t.replace(/\*/g,"(.+)")+"$").exec(this.type),this.args.shift()))}return this.binder||(this.binder=this.view.binders["*"]),this.binder instanceof Function?this.binder={routine:this.binder}:void 0},e.prototype.observe=function(e,i,n){return t.sightglass(e,i,n,{root:this.view.rootInterface,adapters:this.view.adapters})},e.prototype.parseTarget=function(){var e;return e=t.TypeParser.parse(this.keypath),0===e.type?this.value=e.value:(this.observer=this.observe(this.view.models,this.keypath,this.sync),this.model=this.observer.target)},e.prototype.formattedValue=function(e){var i,n,r,o,u,h,l,a,p,d,c,f,b,v;for(v=this.formatters,o=d=0,f=v.length;f>d;o=++d){for(u=v[o],r=u.match(/[^\s']+|'([^']|'[^\s])*'|"([^"]|"[^\s])*"/g),h=r.shift(),u=this.view.formatters[h],r=function(){var e,i,s;for(s=[],e=0,i=r.length;i>e;e++)n=r[e],s.push(t.TypeParser.parse(n));return s}(),a=[],i=c=0,b=r.length;b>c;i=++c)n=r[i],a.push(0===n.type?n.value:((p=this.formatterObservers)[o]||(p[o]={}),(l=this.formatterObservers[o][i])?void 0:(l=this.observe(this.view.models,n.value,this.sync),this.formatterObservers[o][i]=l),l.value()));(null!=u?u.read:void 0)instanceof Function?e=u.read.apply(u,[e].concat(s.call(a))):u instanceof Function&&(e=u.apply(null,[e].concat(s.call(a))))}return e},e.prototype.eventHandler=function(t){var e,i;return i=(e=this).view.handler,function(n){return i.call(t,this,n,e)}},e.prototype.set=function(t){var e;return t=t instanceof Function&&!this.binder["function"]?this.formattedValue(t.call(this.model)):this.formattedValue(t),null!=(e=this.binder.routine)?e.call(this,this.el,t):void 0},e.prototype.sync=function(){var t,e;return this.set(function(){var i,n,r,s,o,u,h;if(this.observer){if(this.model!==this.observer.target){for(o=this.dependencies,i=0,r=o.length;r>i;i++)e=o[i],e.unobserve();if(this.dependencies=[],null!=(this.model=this.observer.target)&&(null!=(u=this.options.dependencies)?u.length:void 0))for(h=this.options.dependencies,n=0,s=h.length;s>n;n++)t=h[n],e=this.observe(this.model,t,this.sync),this.dependencies.push(e)}return this.observer.value()}return this.value}.call(this))},e.prototype.publish=function(){var t,e,i,n,r,o,u,h,l;if(this.observer){for(n=this.getValue(this.el),u=this.formatters.slice(0).reverse(),r=0,o=u.length;o>r;r++)e=u[r],t=e.split(/\s+/),i=t.shift(),(null!=(h=this.view.formatters[i])?h.publish:void 0)&&(n=(l=this.view.formatters[i]).publish.apply(l,[n].concat(s.call(t))));return this.observer.setValue(n)}},e.prototype.bind=function(){var t,e,i,n,r,s,o;if(this.parseTarget(),null!=(r=this.binder.bind)&&r.call(this,this.el),null!=this.model&&(null!=(s=this.options.dependencies)?s.length:void 0))for(o=this.options.dependencies,i=0,n=o.length;n>i;i++)t=o[i],e=this.observe(this.model,t,this.sync),this.dependencies.push(e);return this.view.preloadData?this.sync():void 0},e.prototype.unbind=function(){var t,e,i,n,r,s,o,u,h,l;for(null!=(o=this.binder.unbind)&&o.call(this,this.el),null!=(u=this.observer)&&u.unobserve(),h=this.dependencies,r=0,s=h.length;s>r;r++)n=h[r],n.unobserve();this.dependencies=[],l=this.formatterObservers;for(i in l){e=l[i];for(t in e)n=e[t],n.unobserve()}return this.formatterObservers={}},e.prototype.update=function(t){var e,i;return null==t&&(t={}),this.model=null!=(e=this.observer)?e.target:void 0,this.unbind(),null!=(i=this.binder.update)&&i.call(this,t),this.bind()},e.prototype.getValue=function(e){return this.binder&&null!=this.binder.getValue?this.binder.getValue.call(this,e):t.Util.getInputValue(e)},e}(),t.ComponentBinding=function(e){function i(t,e,i){var n,s,o,u,l;for(this.view=t,this.el=e,this.type=i,this.unbind=r(this.unbind,this),this.bind=r(this.bind,this),this.update=r(this.update,this),this.locals=r(this.locals,this),this.component=this.view.components[this.type],this.attributes={},this.inflections={},u=this.el.attributes||[],s=0,o=u.length;o>s;s++)n=u[s],l=n.name,h.call(this.component.attributes,l)>=0?this.attributes[n.name]=n.value:this.inflections[n.name]=n.value}return u(i,e),i.prototype.sync=function(){},i.prototype.locals=function(t){var e,i,n,r,s,o,u,h,l;null==t&&(t=this.view.models),s={},h=this.inflections;for(i in h)for(e=h[i],l=e.split("."),o=0,u=l.length;u>o;o++)r=l[o],s[i]=(s[i]||t)[r];for(i in t)n=t[i],null==s[i]&&(s[i]=n);return s},i.prototype.update=function(t){var e;return null!=(e=this.componentView)?e.update(this.locals(t)):void 0},i.prototype.bind=function(){var e,i;return null!=this.componentView?null!=(i=this.componentView)?i.bind():void 0:(e=this.component.build.call(this.attributes),(this.componentView=new t.View(e,this.locals(),this.view.options)).bind(),this.el.parentNode.replaceChild(e,this.el))},i.prototype.unbind=function(){var t;return null!=(t=this.componentView)?t.unbind():void 0},i}(t.Binding),t.TextBinding=function(t){function e(t,e,i,n,s){this.view=t,this.el=e,this.type=i,this.keypath=n,this.options=null!=s?s:{},this.sync=r(this.sync,this),this.formatters=this.options.formatters||[],this.dependencies=[],this.formatterObservers={}}return u(e,t),e.prototype.binder={routine:function(t,e){return t.data=null!=e?e:""}},e.prototype.sync=function(){return e.__super__.sync.apply(this,arguments)},e}(t.Binding),t["public"].binders.text=function(t,e){return null!=t.textContent?t.textContent=null!=e?e:"":t.innerText=null!=e?e:""},t["public"].binders.html=function(t,e){return t.innerHTML=null!=e?e:""},t["public"].binders.show=function(t,e){return t.style.display=e?"":"none"},t["public"].binders.hide=function(t,e){return t.style.display=e?"none":""},t["public"].binders.enabled=function(t,e){return t.disabled=!e},t["public"].binders.disabled=function(t,e){return t.disabled=!!e},t["public"].binders.checked={publishes:!0,priority:2e3,bind:function(e){return t.Util.bindEvent(e,"change",this.publish)},unbind:function(e){return t.Util.unbindEvent(e,"change",this.publish)},routine:function(t,e){var i;return t.checked="radio"===t.type?(null!=(i=t.value)?i.toString():void 0)===(null!=e?e.toString():void 0):!!e}},t["public"].binders.unchecked={publishes:!0,priority:2e3,bind:function(e){return t.Util.bindEvent(e,"change",this.publish)},unbind:function(e){return t.Util.unbindEvent(e,"change",this.publish)},routine:function(t,e){var i;return t.checked="radio"===t.type?(null!=(i=t.value)?i.toString():void 0)!==(null!=e?e.toString():void 0):!e}},t["public"].binders.value={publishes:!0,priority:2e3,bind:function(e){return this.event="SELECT"===e.tagName?"change":"input",t.Util.bindEvent(e,this.event,this.publish)},unbind:function(e){return t.Util.unbindEvent(e,this.event,this.publish)},routine:function(t,e){var i,n,r,s,o,u,l;if(null!=window.jQuery){if(t=jQuery(t),(null!=e?e.toString():void 0)!==(null!=(s=t.val())?s.toString():void 0))return t.val(null!=e?e:"")}else if("select-multiple"===t.type){if(null!=e){for(l=[],n=0,r=t.length;r>n;n++)i=t[n],l.push(i.selected=(o=i.value,h.call(e,o)>=0));return l}}else if((null!=e?e.toString():void 0)!==(null!=(u=t.value)?u.toString():void 0))return t.value=null!=e?e:""}},t["public"].binders["if"]={block:!0,priority:3e3,bind:function(t){var e,i;return null==this.marker?(e=[this.view.prefix,this.type].join("-").replace("--","-"),i=t.getAttribute(e),this.marker=document.createComment(" rivets: "+this.type+" "+i+" "),this.bound=!1,t.removeAttribute(e),t.parentNode.insertBefore(this.marker,t),t.parentNode.removeChild(t)):void 0},unbind:function(){var t;return null!=(t=this.nested)?t.unbind():void 0},routine:function(e,i){var n,r,s,o;if(!!i==!this.bound){if(i){s={},o=this.view.models;for(n in o)r=o[n],s[n]=r;return(this.nested||(this.nested=new t.View(e,s,this.view.options()))).bind(),this.marker.parentNode.insertBefore(e,this.marker.nextSibling),this.bound=!0}return e.parentNode.removeChild(e),this.nested.unbind(),this.bound=!1}},update:function(t){var e;return null!=(e=this.nested)?e.update(t):void 0}},t["public"].binders.unless={block:!0,priority:3e3,bind:function(e){return t["public"].binders["if"].bind.call(this,e)},unbind:function(){return t["public"].binders["if"].unbind.call(this)},routine:function(e,i){return t["public"].binders["if"].routine.call(this,e,!i)},update:function(e){return t["public"].binders["if"].update.call(this,e)}},t["public"].binders["on-*"]={"function":!0,priority:1e3,unbind:function(e){return this.handler?t.Util.unbindEvent(e,this.args[0],this.handler):void 0},routine:function(e,i){return this.handler&&t.Util.unbindEvent(e,this.args[0],this.handler),t.Util.bindEvent(e,this.args[0],this.handler=this.eventHandler(i))}},t["public"].binders["each-*"]={block:!0,priority:3e3,bind:function(t){var e,i,n,r,s;if(null==this.marker)e=[this.view.prefix,this.type].join("-").replace("--","-"),this.marker=document.createComment(" rivets: "+this.type+" "),this.iterated=[],t.removeAttribute(e),t.parentNode.insertBefore(this.marker,t),t.parentNode.removeChild(t);else for(s=this.iterated,n=0,r=s.length;r>n;n++)i=s[n],i.bind()},unbind:function(){var t,e,i,n,r;if(null!=this.iterated){for(n=this.iterated,r=[],e=0,i=n.length;i>e;e++)t=n[e],r.push(t.unbind());return r}},routine:function(e,i){var n,r,s,o,u,h,l,a,p,d,c,f,b,v,y,g,m,w,x,k,E;if(l=this.args[0],i=i||[],this.iterated.length>i.length)for(w=Array(this.iterated.length-i.length),f=0,y=w.length;y>f;f++)s=w[f],c=this.iterated.pop(),c.unbind(),this.marker.parentNode.removeChild(c.els[0]);for(o=b=0,g=i.length;g>b;o=++b)if(h=i[o],r={index:o},r[l]=h,null==this.iterated[o]){x=this.view.models;for(u in x)h=x[u],null==r[u]&&(r[u]=h);p=this.iterated.length?this.iterated[this.iterated.length-1].els[0]:this.marker,a=this.view.options(),a.preloadData=!0,d=e.cloneNode(!0),c=new t.View(d,r,a),c.bind(),this.iterated.push(c),this.marker.parentNode.insertBefore(d,p.nextSibling)}else this.iterated[o].models[l]!==h&&this.iterated[o].update(r);if("OPTION"===e.nodeName){for(k=this.view.bindings,E=[],v=0,m=k.length;m>v;v++)n=k[v],n.el===this.marker.parentNode&&"value"===n.type?E.push(n.sync()):E.push(void 0);return E}},update:function(t){var e,i,n,r,s,o,u,h;e={};for(i in t)n=t[i],i!==this.args[0]&&(e[i]=n);for(u=this.iterated,h=[],s=0,o=u.length;o>s;s++)r=u[s],h.push(r.update(e));return h}},t["public"].binders["class-*"]=function(t,e){var i;return i=" "+t.className+" ",!e==(-1!==i.indexOf(" "+this.args[0]+" "))?t.className=e?""+t.className+" "+this.args[0]:i.replace(" "+this.args[0]+" "," ").trim():void 0},t["public"].binders["*"]=function(t,e){return null!=e?t.setAttribute(this.type,e):t.removeAttribute(this.type)},t["public"].adapters["."]={id:"_rv",counter:0,weakmap:{},weakReference:function(t){var e;return t.hasOwnProperty(this.id)||(e=this.counter++,this.weakmap[e]={callbacks:{}},Object.defineProperty(t,this.id,{value:e})),this.weakmap[t[this.id]]},stubFunction:function(t,e){var i,n,r;return n=t[e],i=this.weakReference(t),r=this.weakmap,t[e]=function(){var e,s,o,u,h,l,a,p,d,c;u=n.apply(t,arguments),a=i.pointers;for(o in a)for(s=a[o],c=null!=(p=null!=(d=r[o])?d.callbacks[s]:void 0)?p:[],h=0,l=c.length;l>h;h++)e=c[h],e();return u}},observeMutations:function(t,e,i){var n,r,s,o,u,l;if(Array.isArray(t)){if(s=this.weakReference(t),null==s.pointers)for(s.pointers={},r=["push","pop","shift","unshift","sort","reverse","splice"],u=0,l=r.length;l>u;u++)n=r[u],this.stubFunction(t,n);if(null==(o=s.pointers)[e]&&(o[e]=[]),h.call(s.pointers[e],i)<0)return s.pointers[e].push(i)}},unobserveMutations:function(t,e,i){var n,r,s;return Array.isArray(t&&null!=t[this.id])&&(r=null!=(s=this.weakReference(t).pointers)?s[e]:void 0)&&(n=r.indexOf(i),n>=0)?r.splice(n,1):void 0},observe:function(t,e,i){var n,r;return n=this.weakReference(t).callbacks,null==n[e]&&(n[e]=[],r=t[e],Object.defineProperty(t,e,{enumerable:!0,get:function(){return r},set:function(s){return function(o){var u,l,a;if(o!==r){for(r=o,a=n[e].slice(),u=0,l=a.length;l>u;u++)i=a[u],h.call(n[e],i)>=0&&i();return s.observeMutations(o,t[s.id],e)}}}(this)})),h.call(n[e],i)<0&&n[e].push(i),this.observeMutations(t[e],t[this.id],e)},unobserve:function(t,e,i){var n,r;return n=this.weakmap[t[this.id]].callbacks[e],r=n.indexOf(i),r>=0&&n.splice(r,1),this.unobserveMutations(t[e],t[this.id],e)},get:function(t,e){return t[e]},set:function(t,e,i){return t[e]=i}},t.factory=function(e){return t.sightglass=e,t["public"]._=t,t["public"]},"object"==typeof("undefined"!=typeof module&&null!==module?module.exports:void 0)?module.exports=t.factory(require("sightglass")):"function"==typeof define&&define.amd?define(["sightglass"],function(e){return this.rivets=t.factory(e)}):this.rivets=t.factory(sightglass)}).call(this);

;return { start: start }}).bind(window)