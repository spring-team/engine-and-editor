package com.unifina.feed.twitter

import com.mongodb.util.JSON
import com.unifina.api.InvalidStateException
import com.unifina.api.ValidationException
import com.unifina.domain.data.Stream
import grails.util.Holders
import groovy.transform.CompileStatic
import org.codehaus.groovy.grails.web.mapping.LinkGenerator
import twitter4j.Status
import twitter4j.Twitter
import twitter4j.TwitterFactory
import twitter4j.auth.AccessToken
import twitter4j.auth.RequestToken

import javax.servlet.http.HttpSession

/**
 * Groovy equivalent of the stream.config.twitter (stream.config is stored as JSON string in MySQL)
 * Also handles the OAuth rituals to get access tokens
 */
class TwitterStreamConfig {
	// streamrinc's app
	//public static final String consumerKey = "mosTwR1X0EgiR9lB81EGhYRrP"
	//public static final String consumerSecret = "W9G6fBWYCy4ywMJpG3TWrgj5LtHv0h4e5c4dmEQbc8BGdSTSaj"
	// juuso's test app
	public static final String consumerKey = "PEPCKwh7OyDZ4GXpIVZ2JyA6C"
	public static final String consumerSecret = "RmeQ3Q6PKsnKY6zvv4OXGAoAa66eFaGPahgRpKGjUDwbF6tpiP"

	String accessToken
	String accessTokenSecret

	List<String> keywords = []

	static {
		Twitter twitter = TwitterFactory.singleton
		twitter.setOAuthConsumer(consumerKey, consumerSecret)
	}

	def String getSignInURL() { requestToken.authenticationURL }

	private Map configMap
	private RequestToken requestToken
	private Stream stream
	public String getStreamId() { stream?.id }

	private static Map<Stream, TwitterStreamConfig> cache = new HashMap<>();

	public static TwitterStreamConfig forStream(Stream stream, HttpSession session=null) {
		TwitterStreamConfig conf = cache.get(stream);
		if (conf == null) {
			Map configMap = stream.streamConfigAsMap["twitter"] ?: [:]
			conf = new TwitterStreamConfig(configMap)
			conf.stream = stream
			conf.configMap = configMap
		}

		if (!conf.accessToken && session != null) {
			if (!session.requestToken) {
				def grailsLinkGenerator = Holders.getApplicationContext().getBean('grailsLinkGenerator', LinkGenerator.class)
				String callbackURL = grailsLinkGenerator.link(controller: "stream", action: "configureTwitterStream", id: stream.id, absolute: true)

				Twitter twitter = TwitterFactory.singleton
				session.requestToken = twitter.getOAuthRequestToken(callbackURL)
			}
			conf.requestToken = session.requestToken
			// ret.save()  // TODO: after there is a way to "resume" or serialize requestToken (avoid putting it into session)
		}

		return conf
	}

	/**
	 * Upgrade request token to access token after user authorizes app
	 * Called from StreamController callback for twitter authorization that returns the oauth_verifier
	 * @see see https://dev.twitter.com/web/sign-in/implementing
	 * @param verifier returned from Twitter
	 * @return
     */
	def setOAuthVerifier(String verifier) {
		if (!requestToken) {
			if (accessToken && accessTokenSecret) {
				throw new InvalidStateException("Already have access token")
			} else {
				throw new InvalidStateException("No requestToken, was TwitterStreamConfig created using fromStream?")
			}
		}
		Twitter twitter = TwitterFactory.singleton
		AccessToken access = twitter.getOAuthAccessToken(requestToken, verifier)
		accessToken = access.token
		accessTokenSecret = access.tokenSecret
		save()
	}

	/**
	 * @param kwString Comma-separated list of keywords
     */
	def setKeywords(String kwString) {
		setKeywords(kwString.split(",")*.trim())
	}
	def setKeywords(List<String> kw) {
		keywords = kw
	}

	private void save() {
		configMap.twitter = toMap()
		stream.config = JSON.serialize(configMap)
		if (!stream.validate()) {
			throw new ValidationException(stream.errors)
		}
		stream.save(failOnError: true)
	}

	Map toMap() {
		Map ret = [
			keywords: keywords
		]
		if (accessToken && accessTokenSecret) {
			ret += [
				accessToken: accessToken,
				accessTokenSecret: accessTokenSecret
			]
		}
		return ret
	}

	/**
	 * Transform tweet into string to scan for keywords (add expanded URLs)
	 *   unrelated utility function, it's here simply because it's SO much nicer-looking in Groovy...
	 */
	@CompileStatic
	static String getSearchStringFromTwitterStatus(Status status) {
		return status.text + status.URLEntities*.expandedURL.join("")
	}
}
