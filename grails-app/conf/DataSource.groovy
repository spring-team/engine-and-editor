import grails.util.Environment;

dataSource {
    pooled = true
    driverClassName = "com.mysql.jdbc.Driver"
	dialect = 'org.hibernate.dialect.MySQL5InnoDBDialect'
}
hibernate {
    cache.use_second_level_cache = true
    cache.use_query_cache = false
	cache.region.factory_class = 'org.hibernate.cache.SingletonEhCacheRegionFactory'
}
// environment specific settings
environments {
    development {
        dataSource {
			// if grails.dev.database not defined, throw an exception
			def dbDefaultName = 'core_dev'
			def dbName = System.getProperty('grails.dev.database') ?: dbDefaultName

			println "Using database: $dbName"

			if (!System.getProperty('grails.dev.database'))
				throw new RuntimeException("Please run scripts/copy-dev-db.sh YOURNAME to make a personal copy of the dev db, then run grails with this command line argument: -Dgrails.dev.database=${dbDefaultName}_YOURNAME")

			username = "unifina-dev"
			password = "2PpJA2vJ"
            url = "jdbc:mysql://192.168.10.21:3306/core_dev?useLegacyDatetimeCode=false"
        }
    }
    test {
        dataSource {
			// If not in jenkins and if grails.test.database not defined, throw an exception
			def dbDefaultName = 'core_test'
			def dbName = System.getProperty('grails.test.database') ?: dbDefaultName
			def testPhase = System.getProperty('grails.test.phase')

			println "Using database: $dbName"
			println "Test phase: $testPhase"

			if (System.getenv()['BUILD_NUMBER']==null && !System.getProperty('grails.test.database') && testPhase!=null && testPhase!="unit")
				throw new RuntimeException("Please run scripts/copy-test-db.sh YOURNAME to make a personal copy of the test db, then run grails with this command line argument: -Dgrails.test.database=${dbDefaultName}_YOURNAME")
			
			username = "unifina-test"
			password = "HqTQK9kB"
            url = "jdbc:mysql://192.168.10.21:3306/${dbName}?useLegacyDatetimeCode=false"
        }
    }
    production {
		// There is no prod database for core
    }
}
