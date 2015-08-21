<head>
<r:script>
Tour.list(function(tourList) {
	$('#help-tour-list').prepend(
		tourList.map(function(item, idx) {
			var url = Streamr.createLink(item.controller, item.action) + "?playTour=" + idx
			return $('<li><a href="'+url+'">Tour: '+item.title+'</a></li>')
		})
	)
})
</r:script>

</head>

<div id="main-navbar-collapse" class="collapse navbar-collapse main-navbar-collapse">
	<div>
		<ul class="nav navbar-nav">						
		</ul> <!-- / .navbar-nav -->
	
		<div class="right clearfix">
			<ul class="nav navbar-nav pull-right right-navbar-nav">
	
				<sec:ifLoggedIn>
					<li>
						<a id="navBuildLink" href="${createLink(controller:"canvas")}"><g:message code="build.label"/></a>
					</li>
					<li>
						<a id="navLiveLink" href="${createLink(controller:"live")}"><g:message code="live.label"/></a>
					</li>
					<li>
						<a id="navDashboardsLink" href="${createLink(controller:"dashboard")}"><g:message code="dashboards.label"/></a>
					</li>
					<li>
						<a id="navStreamsLink" href="${createLink(controller:"stream")}"><g:message code="streams.label"/></a>
					</li>
				</sec:ifLoggedIn>
				
				<sec:ifAllGranted roles="ROLE_ADMIN">
					<li class="dropdown">
						<a id="navAdminLink" href="#" class="dropdown-toggle" data-toggle="dropdown">Admin</a>
						<ul class="dropdown-menu">
							<li><g:link controller="taskWorker" action="status">Task workers</g:link></li>
							<li><g:link controller="kafka" action="collect">Collect Kafka feeds</g:link></li>
							<li><g:link controller="feedFile">Feed files</g:link></li>
							<li><g:link controller="user">Users</g:link></li>
						</ul>
					</li>
				</sec:ifAllGranted>

				<sec:ifLoggedIn>
					<li class="dropdown">
						<a id="navHelpLink" href="#" class="dropdown-toggle" data-toggle="dropdown">
							<i class="dropdown-icon fa fa-question"></i>
						</a>
						<ul class="dropdown-menu" id="help-tour-list">
							<%-- Tours are dynamically inserted here --%>
<%--							<li class="divider"></li>--%>
							<li><g:link elementId="navExamplesLink" controller="canvas" params="[examples:1]">Example Canvases</g:link></li>
							<li><g:link controller="feedback"><g:message code="feedback.label"/></g:link></li>
						</ul>
					</li>
			
					<li class="dropdown">
						<a id="navSettingsLink" href="#" class="dropdown-toggle" data-toggle="dropdown">
							<i class="dropdown-icon fa fa-cog"></i>
						</a>
						<ul class="dropdown-menu">
							<li><g:link elementId="navProfileLink" controller="profile"><g:message code="profile.edit.label"/></g:link></li>
							<li><g:link elementId="navLogoutLink" controller="logout"><i class="dropdown-icon fa fa-power-off"></i>&nbsp;&nbsp;Log Out</g:link></li>
						</ul>
					</li>
				</sec:ifLoggedIn>
				
			</ul> <!-- / .navbar-nav -->
		</div> <!-- / .right -->
		</div>
	</div> <!-- / #main-navbar-collapse -->