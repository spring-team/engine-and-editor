package pages

class StreamListPage extends GrailsPage {

	static controller = "stream"
	static action = "list"
	
	static url = "$controller/$action"

	static content = {
		navbar { module NavbarModule }
		createButton { $("#createButton") }
	}
}


