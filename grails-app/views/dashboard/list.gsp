<html>
<head>
    <meta name="layout" content="main" />
    <title><g:message code="dashboard.list.label"/></title>
</head>

<body class="dashboard">

	<ui:flashMessage/>

	<div class="btn-group toolbar">
		<a id="createButton" class="btn btn-primary" href="${createLink(action:'create')}">
			<i class="fa fa-plus"></i> Create a new dashboard
		</a>        	
	</div>
	
	<div class="panel">
            <div class="panel-heading">
            	<span class="panel-title">
            		<g:message code="dashboard.list.label" />
            	</span>
            </div>
            
            <div class="panel-body">
				<ui:table>
				    <ui:thead>
				        <ui:tr>
				            <ui:th>Name</ui:th>
				            <ui:th>Created</ui:th>
				            <ui:th>Modified</ui:th>
				        </ui:tr>
				    </ui:thead>
				    <ui:tbody>
					    <g:each in="${dashboards}" status="i" var="dashboard">
					    	<ui:tr title="Show or edit dashboard" link="${createLink(action: 'show', id:dashboard.id) }" data-id="${dashboard.id}">
					            <ui:td>${dashboard.name}</ui:td>					        
					           	<ui:td><g:formatDate date="${dashboard.dateCreated}" formatName="default.dateOnly.format" timeZone="${user.timezone}" /></ui:td>
					            <ui:td><g:formatDate date="${dashboard.lastUpdated}" formatName="default.dateOnly.format" timeZone="${user.timezone}" />
									<g:if test="${shareable.contains(dashboard)}">
										<ui:shareButton class="btn-end-of-row" url="${createLink(uri: "/api/v1/dashboards/" + dashboard.id)}" name="Dashboard ${dashboard.name}" />
									</g:if>
								</ui:td>
				            </ui:tr>
						</g:each>
					</ui:tbody>
				</ui:table>
            </div> <%-- end panel body --%>
        </div> <%-- end panel --%>
</body>
</html>
