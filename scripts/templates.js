var templates; if (!templates) { templates = {}} templates["contact-edit-body"] = '<tr class="twoColumn">  <td colspan="2">    <div class="leftPanel">      <div class="ContactFieldWidget edit multi-line-text-box twoColumn">        <div>          <div class="ContactInputWidget initial">            <div class="fieldHolder">              <div class="nmbl-CustomFieldFormTextWidget">                <div class="valueHolder">                  <div class="taist-contact" rv-each-contact="relations">                    <a rv-href="contact.link">{ contact.full_name }</a>                    <img rv-on-click="contact.remove" class="gwt-Image"                         src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAATCAYAAABLN4eXAAAAlUlEQVR42mNgoBScO3dO//z58yeA9H8YhvL18WnaiKwBCW/Ep+kkEL9BE3sDEkdX+B2H6bjwd/I0gQDQs9EggTNnzthgczZIHBoo0XBBijRduHDB7NSpU0pA9h6of/eA+CDxEaWJrNAD4rmrVq1iRtawf/9+lrNnz87HpsmfmNQAUgfXdPHiRW6g4AoCmlaA1DHQFQAAk+K2Z8TV29MAAAAASUVORK5CYII=">                    <div style="clear:both;"></div>                  </div>                </div>              </div>            </div>          </div>        </div>        <div rv-hide="disabled">          <select rv-value="addedRelation">            <option rv-each-contact="contacts" rv-value="contact.id">{ contact.full_name }</option>          </select>          <a rv-on-click="addRelation" class="addField" style="display: inline-block;">Add relation</a>        </div>      </div>    </div>  </td></tr>'; 
var templates; if (!templates) { templates = {}} templates["contact-edit-header"] = '<tr class="twoColumn">  <td colspan="2">    <div class="leftPanel">      <div class="ContactFieldWidget edit separator twoColumn noborder">        <div>          <div class="ContactInputWidget">            <div class="fieldHolder">              <div class="nmbl-CustomFieldSeparator">                <div class="valueHolder">                  <div style="clear:both;"></div>                  <div class="blockHeader resolutionMin">{ title }</div>                </div>              </div>            </div>          </div>        </div>        <div aria-hidden="true" style="display: none;"><a class="addField">{ title }</a></div>      </div>    </div>  </td></tr>'; 
var templates; if (!templates) { templates = {}} templates["contact-view"] = '<div rv-hide="disabled" class="relations info-field middle-column" style="white-space: nowrap;">  <span>{ title }</span>  <span rv-each-contact="relations" style="width: auto;">    <a rv-href="contact.link">{ contact.full_name }</a><span style="width: auto;" rv-hide="contact.last">,</span>&nbsp;  </span></div>'; 