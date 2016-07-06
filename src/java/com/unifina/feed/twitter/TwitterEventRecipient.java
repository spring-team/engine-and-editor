package com.unifina.feed.twitter;

import java.util.Map;

import com.unifina.data.FeedEvent;
import com.unifina.data.IEventRecipient;
import com.unifina.domain.data.Stream;
import com.unifina.feed.StreamEventRecipient;
import com.unifina.feed.kafka.KafkaMessage;
import com.unifina.signalpath.twitter.TwitterModule;
import com.unifina.utils.Globals;
import com.unifina.utils.MapTraversal;

public class TwitterEventRecipient extends StreamEventRecipient<TwitterModule, TwitterMessage> {

	public TwitterEventRecipient(Globals globals, Stream stream) {
		super(globals, stream);
	}

	@Override
	protected void sendOutputFromModules(FeedEvent<TwitterMessage, ? extends IEventRecipient> event) {
		twitter4j.Status msg = event.content.status;

		for (TwitterModule m : modules) {
			m.tweet.send(msg.getText());
			m.username.send(msg.getUser().getName());
			m.name.send(msg.getUser().getScreenName());
			m.language.send(msg.getLang());
			m.followers.send(msg.getUser().getFollowersCount());
			m.isRetweet.send(msg.isRetweet());
			if (msg.getInReplyToScreenName() != null) {
				m.replyTo.send(msg.getInReplyToScreenName());
			}
		}
	}

}
