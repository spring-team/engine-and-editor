(function(exports) {

function ModuleBrowser(options){
	var _this = this

	this.sidebarEl = $(options.sidebarEl)
	this.moduleTreeEl = $(options.moduleTreeEl)
	this.searchBoxEl = $(options.searchBoxEl)

	this.level = 0
	_this.offset = 80

	this.categoryName = ""
	
	$.getJSON(Streamr.createLink("module", "jsonGetModuleTree")+"?modulesFirst=true", {}, function(moduleTree){
		var sidebar = new Sidebar(_this.sidebarEl, moduleTree)
		_this.renderModules(_this.moduleTreeEl, moduleTree)
		
		new Search(_this.searchBoxEl, _this.offset, sidebar.modules)

		$('body').scrollspy({
			offset: _this.offset
		})
		$('#sidebar li a').click(function(event) {
			event.preventDefault()
		    $($(this).attr('href'))[0].scrollIntoView()
		    scrollBy(0, -(_this.offset-30))
	        this.blur()
		});
	})
}

ModuleBrowser.prototype.renderModules = function(element,list){
	var _this = this
	
	$.each(list, function(i, module){
		if(!module.children){
    		new Module(_this.url, element, module, _this.level)
		} else {
			_this.level++
			if(_this.level == 1){
				var h = "h2"
				_this.categoryName = module.data
			}
			else {
				var h = "h4"
				_this.categoryName += " > "+ module.data
			}
			// var title = $("<h"+(level+1)+" id='"+module.metadata.id+"' style='padding-left:"+((level-1)*20)+"px;'>"+module.data+"</h"+(level+1)+">")
			var title = $("<"+h+" id='category"+module.metadata.id+"' style='padding-left:"+((_this.level-1)*20)+"px;'>"+_this.categoryName+"</"+h+">")
			element.append(title)
			_this.renderModules(element, module.children)
		}
		if(i == list.length-1) {
			_this.level--
			var l = _this.categoryName.split(" > ")
			_this.categoryName = ""
			for(var j = 0; j < l.length - 1; j++){
				if(j === 0)
					_this.categoryName += l[j]
				else
					_this.categoryName += " > "+ l[j]
			}
		}
	})
}

function Module(url, element, module, level){
	this.level = level
	this.element = element
	this.module = module
	this.url = url
	this.render()
}

Module.prototype.render = function(){
	var _this = this
	this.panel = $("<div/>", {
		class: "panel",
		style: "margin-left:"+(20*(_this.level-1))+"px;",
		id: "module"+this.module.metadata.id
	})
	this.panelHeading = $("<div/>", {
		class: "panel-heading"
	})
	this.a = $("<a/>", {
		class: "accordion-toggle collapsed panel-heading",
		'data-toggle': "collapse",
		href: "#collapse"+this.module.metadata.id
	})
	this.panelTitle = $("<span/>", {
		class: "",
		text: this.module.data
	})
	this.collapse = $("<div/>", {
		id: "collapse"+this.module.metadata.id,
		class: "panel-collapse collapse"
	})
	this.panelBody = $("<div/>", {
		class: "panel-body"
	})
	this.spinner = $("<img/>", {
		src: spinnerImg,
		style: "margin-left:50%;"
	})
	// a.append(panelHeading)
	this.a.append(this.panelTitle)
	this.panel.append(this.a)
	this.collapse.append(this.panelBody)
	this.panelBody.append(this.spinner)
	this.panel.append(this.collapse)
	
	_this.collapse.one("show.bs.collapse", function(){
		_this.renderHelp()
	})
	

	this.element.append(this.panel)
}

Module.prototype.renderHelp = function(msg){
	var _this = this
	this.moduleData
	this.moduleHelp

	this.hasModuleData = false
	this.hasModuleHelp = false

	this.drawHelp = function(){
		var moduleHelp = _this.moduleHelp
		var moduleData = _this.moduleData

		var inputNames = []
		var outputNames = []
		var paramNames = []
		if(moduleData.inputs){
			$.each(moduleData.inputs, function(i, input){
				inputNames.push(input.name)
			})
		}
		if(moduleHelp.inputNames){
			$.each(moduleHelp.inputNames, function(i, input){
				if(inputNames.indexOf(input) < 0){
					inputNames.push(input)
				}
			})
		}
		if(moduleData.outputs){
			$.each(moduleData.outputs, function(i, output){
				outputNames.push(output.name)
			})
		}
		if(moduleHelp.outputNames){
			$.each(moduleHelp.outputNames, function(i, output){
				if(outputNames.indexOf(output) < 0){
					outputNames.push(output)
				}
			})
		}
		if(moduleData.params){
			$.each(moduleData.params, function(i, param){
				paramNames.push(param.name)
			})
		}
		if(moduleHelp.paramNames){
			$.each(moduleHelp.paramNames, function(i, param){
				if(paramNames.indexOf(param) < 0){
					paramNames.push(param)
				}
			})
		}
		

		_this.spinner.remove()
		if(msg === undefined){
			var msg = ""
		}
		if(_this.topContainer){
			_this.topContainer.append($("<span/>", {
				class: 'flash-message',
				html: msg
			}))
		}
		
		_this.helpTextTable = $("<table class='table help-text-table'></table>")
		if(moduleHelp.helpText){
			// helpText.append($("<thead><tr><th>Help Text</th></tr></thead>"))
			_this.helpTextTable.append($("<tr><td><div class='help-text'></div></td></tr>"))
			_this.helpTextTable.find(".help-text").html(moduleHelp.helpText)
		} else {
			_this.helpTextTable.append($("<thead><tr><th><div class='no-help-text'>No Help Text</div></th></tr></thead>"))
		}
		_this.panelBody.append(_this.helpTextTable)

		_this.params = $("<table class='table param-table'></table>")
		if(paramNames.length){
			_this.params.append($("<thead><tr><th>Parameters</th><th>Name</th><th>Description</th></tr></thead>"))
			var tbody = $("<tbody></tbody>")
			$.each(paramNames, function(i, paramName){
				var paramHelp = moduleHelp.params[paramName] ? moduleHelp.params[paramName] : ""
				_this.params.append($("<tr><td></td><td class='name'>"+paramName+"</td><td class='value param-description'><span>"+paramHelp+"</span></td></tr>"))
			})
		} else {
			_this.params.append($("<thead><tr><th>No Parameter Helps</th></tr></thead>"))
		}
		_this.panelBody.append(_this.params)

		_this.inputs = $("<table class='table input-table'></table>")
		if(inputNames.length){
			_this.inputs.append($("<thead><tr><th>Inputs</th><th>Name</th><th>Description</th></tr></thead>"))
			var tbody = $("<tbody></tbody>")
			$.each(inputNames, function(i, inputName){
				var inputHelp = moduleHelp.inputs[inputName] ? moduleHelp.inputs[inputName] : ""
				_this.inputs.append($("<tr><td></td><td class='name'>"+inputName+"</td><td class='value input-description'><span>"+inputHelp+"</span></td></tr>"))
			})
		} else {
			_this.inputs.append($("<thead><tr><th>No Input Helps</th></tr></thead>"))
		}
		_this.panelBody.append(_this.inputs)

		_this.outputs = $("<table class='table output-table'></table>")
		if(outputNames.length){
			_this.outputs.append($("<thead><tr><th>Outputs</th><th>Name</th><th>Description</th></tr></thead>"))
			$.each(outputNames, function(i, outputName){
				var outputHelp = moduleHelp.outputs[outputName] ? moduleHelp.outputs[outputName] : ""
				_this.outputs.append($("<tr><td></td><td class='name'>"+outputName+"</td><td class='value output-description'><span>"+outputHelp+"</span></td></tr>"))
			})
		} else {
			_this.outputs.append($("<thead><tr><th>No Output Helps</th></tr></thead>"))
		}
		_this.panelBody.append(_this.outputs)

		MathJax.Hub.Queue(["Typeset",MathJax.Hub,_this.helpTextTable.find(".help-text")[0]]);
		MathJax.Hub.Queue(function(){
			_this.helpTextTable.find(".help-text .math-tex").addClass("math-jax-ready")
		})
	}


	this.drawEdit = function(){
		_this.topContainer = $("<div/>", {
			class: 'col-xs-12 top-container'
		})
		_this.panelBody.prepend(_this.topContainer)
		_this.editBtn = $("<button/>", {
			class: "btn btn-default btn-sm edit-btn",
			text: "Edit help"
		})
		_this.editBtn.click(function(){
			$(this).hide()
			_this.saveBtn.show()
			_this.edit()
		})
		_this.panelBody.find(".top-container").append(_this.editBtn)
		_this.saveBtn = $("<button/>", {
			class: "btn btn-primary btn-sm save-btn",
			text: "Save edits"
		})
		_this.saveBtn.click(function(){
			$(this).hide()
			_this.editBtn.show()
			_this.save()
		})
		_this.panelBody.find(".top-container").append(_this.saveBtn)
		_this.saveBtn.hide()
	}

	$.getJSON(Streamr.createLink("module", "jsonGetModule", this.module.metadata.id), {}, function(module){
		_this.moduleData = module
		_this.hasModuleData = true
		if(_this.hasModuleHelp == true)
			_this.drawHelp()
	})

	$.getJSON(Streamr.createLink("module", "canEdit", this.module.metadata.id), {}, function(canEdit){
		if(canEdit.success == true){
			_this.drawEdit()
		}
	})

	$.getJSON(Streamr.createLink("module", "jsonGetModuleHelp", this.module.metadata.id), {}, function(moduleHelp){
		_this.moduleHelp = moduleHelp
		_this.helpText = moduleHelp.helpText
		_this.hasModuleHelp = true
		if(_this.hasModuleData == true)
			_this.drawHelp()
	})
}

Module.prototype.edit = function() {
	var _this = this
	$.each(this.panelBody.find(".value"), function(i, el){
		$(el).append($("<input/>", {
			type: "text",
			value: $(el).text(),
			width: "100%",
			class: "form-control"
		}))
		$(el).find("span").hide()
	})
	if(this.helpTextTable.find(".no-help-text").length){
		this.helpTextTable.find(".no-help-text").remove()
		this.helpTextTable.append($("<tbody><tr><td><div class='help-text'>No help text</div></td></tr></tbody>"))
	}
	this.helpTextTable.find(".help-text").parent().append($("<textarea rows='10' cols='80' id='textarea"+this.module.metadata.id+"' class='module-help form-control' style='width:100%; height:300px; resize:vertical;'>"+this.helpText+"</textarea>"))
	this.helpTextTable.find(".help-text").hide()
	
	var createEditor = function(result){
		CKEDITOR.replace("textarea"+_this.module.metadata.id, {
			customConfig: CKEDITORConfigUrl+'/custom-config.js',
			// skin : 'BootstrapCK4-Skin,'+CKEDITORConfigUrl+'/skins/bootstrapck/'
		})
	}
	if(window.CKEDITOR === undefined){
		jQuery.ajax({
	        type: "GET",
	        url: "//cdn.ckeditor.com/4.5.1/standard-all/ckeditor.js",
	        success: createEditor,
	        dataType: "script",
	        cache: true
		})
	} else {
		createEditor()
	}
}

Module.prototype.save = function(){
	var _this = this
	var moduleHelp = this.makeHelp()
	var data = {success: ""}
	$.ajax({
	    type: 'POST',
	    url: Streamr.createLink('module', 'jsonSetModuleHelp'),
	    dataType: 'json',
	    success: function(data) {
	    	_this.panelBody.empty()
	    	var msg = (data.success ? "Module help successfully saved." : "An error has occurred.")
			try {
			     CKEDITOR.instances["textarea"+this.module.metadata.id].destroy(false)
			 } catch (e) { }
			_this.renderHelp(msg)
	    },
	    error: function(jqXHR, textStatus, errorThrown) {
	    	_this.panelBody.find(".flash-message").append("An error has occurred.")
	    },
	    data: {id:_this.module.metadata.id, jsonHelp:JSON.stringify(moduleHelp)}
	})
}

Module.prototype.makeHelp = function() {
	var paramTable = this.panelBody.find(".param-table"),
		inputTable = this.panelBody.find(".input-table"),
		outputTable = this.panelBody.find(".output-table"),
		result = {params:{}, paramNames:[], inputs:{}, inputNames:[], outputs:{}, outputNames:[]}
	
	result.helpText = CKEDITOR.instances["textarea"+this.module.metadata.id].getData()
	this.helpText = result.helpText

	paramTable.find("tbody tr").each(function(i,row) {
		var name = $(row).find("td.name").text()
		var value = $(row).find("td.value input").val()
		if (value!=null && value!="") {
			result.paramNames.push(name)
			result.params[name] = value
		}
	})
	inputTable.find("tbody tr").each(function(i,row) {
		var name = $(row).find("td.name").text()
		var value = $(row).find("td.value input").val()
		if (value!=null && value!="") {
			result.inputNames.push(name)
			result.inputs[name] = value
		}
	})
	outputTable.find("tbody tr").each(function(i,row) {
		var name = $(row).find("td.name").text()
		var value = $(row).find("td.value input").val()
		if (value!=null && value!="") {
			result.outputNames.push(name)
			result.outputs[name] = value
		}
	})
	return result;
}

function Sidebar(el, moduleTree){
	this.modules = {}
	this.renderSidebar(el, moduleTree)
}

Sidebar.prototype.renderChildren = function(ul, list){
	var _this = this
	$.each(list, function(i, module){
		var li = $("<li/>")
		var a = $("<a/>", {
			text: module.data
		})
		li.append(a)
		ul.append(li)
		if(module.children){
			a.attr("href", "#category"+module.metadata.id)
			var innerUl = $("<ul/>", {
				class: "nav"
			})
			li.append(innerUl)
			_this.modules[module.data.toLowerCase()] = "#category"+module.metadata.id
			_this.renderChildren(innerUl, module.children)
		} else {
			a.attr("href", "#module"+module.metadata.id)
			_this.modules[module.data.toLowerCase()] = "#module"+module.metadata.id
		}
	})
}   
			
Sidebar.prototype.renderSidebar = function(el, json){
	var el = $(el)
	var nav = $("<nav/>", {
		class: "streamr-sidebar"
	})
	var ul = $("<ul/>", {
		class: "nav",
		id: "module-help-browser"
	})
	el.append(nav)
	nav.append(ul)
	this.renderChildren(ul, json)
}

// The searchbox now searches from the modules and categorys by the input and 
// scrolls to the next search result. If a search with a space is typed, it first looks that is
// there any results by the whole search (e.g. 'time series' > 'Time Series') and then by the last word
// (e.g. 'time statistics corr' > 'Correlation')
function Search(searchBoxEl, offset, modules){
	var _this = this
	this.offset = offset
	this.searchBox = $(searchBoxEl)
	this.modules = modules
	this.moduleNames = Object.keys(this.modules)
	this.msgField = $(".search-message")

	this.lastHref = undefined
	this.lastSearch = undefined
	this.index = 0

	this.searchBox.on("keyup", function(e){
		var search = _this.searchBox.val().toLowerCase()
		
		var href = _this.search(search)
		
		_this.action(href)
	})
}

Search.prototype.search = function(text){
	var _this = this
	if(this.lastSearch == text)
		index++
	else {
		index = 0
		this.lastSearch = text
	}
	if(text == "")
		return ""
	else {
		var names = _.filter(this.moduleNames, function(str){
			return str.lastIndexOf(text, 0) === 0
		})
		if(!names.length){
			var words = text.split(" ")
			text = words[words.length-1]
			names = _.filter(this.moduleNames, function(str){
				return str.lastIndexOf(text, 0) === 0
			})
		}
		if(names.length < index+1){
			index = 0
			if(_this.modules[names[0]])
				return _this.modules[names[0]]
			else
				return text
		}
		else
			if(_this.modules[names[index]])
				return _this.modules[names[index]]
			else
				return text
	}
}

Search.prototype.action = function(href){
	var _this = this
	var timeout

	var open = function(panel){
		if($(panel).find(".panel-heading").hasClass("collapsed")){
			// With clicking the panel heading there's animation, which looks nice
			$(panel).find(".panel-heading").click()
		}
	}
	var close = function(panel){
		if(!$(panel).find(".panel-heading").hasClass("collapsed")){
			// By changing only the classes there's no animation when closing the module, which would mess up the scrolling
			$(panel).find(".panel-heading").addClass("collapsed")
			$(panel).find(".panel-collapse").removeClass("in")
		}
	}
	var module = $(href)
	var lastModule = $(this.lastHref)
	if(href === ""){
		$("body").scrollTop(0)
		_this.msgField.empty()
		if(lastModule)
			close(lastModule)
	}
	if(module.length){
		if(lastModule.length && (this.lastHref && href != this.lastHref)){
			if(timeout){
				clearTimeout(timeout)
			}
			close(lastModule)
		}
		module[0].scrollIntoView()
		window.scrollBy(0, -(_this.offset-30))

		if(timeout)
			clearTimeout(timeout)
		timeout = setTimeout(function(){
			open(module)
		},200)
		this.lastHref = href
	}
}


exports.ModuleBrowser = ModuleBrowser

})(typeof(exports) !== 'undefined' ? exports : window)
