databaseChangeLog = {
	include file: 'core/2016-01-12-initial-db-state.groovy'

	include file: 'core/2016-01-13-permission-feature.groovy'

	include file: 'core/2016-01-13-api-feature.groovy'

	include file: 'core/2016-01-21-replace-running-and-saved-signal-paths-with-canvas.groovy'

	include file: 'core/2016-02-09-permissions-for-signupinvites.groovy'

	include file: 'core/2016-02-10-remove-feeduser-modulepackageuser.groovy'
}
