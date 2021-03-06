# Streams

All data in Streamr is stored in a stream. A stream is simply a sequence of events in time. You can add new data to the end of a stream, and a stream will give the data back to you in the correct order. 

You can store different kinds of data in the same stream.  The data may be numeric, but it can equally well consist of strings, collections of elementary data types, or associative arrays. Each event contains at least one data field, but you can have as many fields per event as required. The data are persistent and stored in the cloud.

The raison d'être for a stream is its capability to provide real-time inputs to Streamr [canvases](#canvases), and act as a recipient of real-time output from such canvases. You can also use a stream as a pub/sub-device, push data into it, and subscribe to the data elsewhere. 

In this chapter, we’ll show stream examples and describe the built-in data types. We'll then discuss how to do the following:

- Create or delete a stream.
- Edit stream details.
- Upload historical data.
- Push events to a stream.
- Subscribe to a stream.

## Stream examples

Here’s an example of what a small part of a stream could look like. Each row shows one event, and the columns correspond to the timestamp followed by two data fields: A measurement of the operating temperature and the number of rotations per minute (RPM).

Timestamp               | Temperature | RPM
:---------------------- |:------------|:----
2016-02-01 11:30:01.012 | 312.56      | 3550
2016-02-01 11:30:02.239 | 312.49      | 3549
2016-02-01 11:30:04.105 | 312.42      | 3543
2016-02-01 11:30:08.122 | 313.21      | 3565
2016-02-01 11:30:11.882 | 317.45      | 3602
...                     |             |

As an example of a more complicated event, here’s a data point in a stock market stream.

    {
      "Symbol": "PFFT",
      "EventType": 1,
      "OrderId": 6454321,
      "Direction": "Up",
      "Trade": {"Price": 118.55, "Size": 100},
      "Ask": [
              {"Price": 118.6, "Size": 22500},
              {"Price": 118.65, "Size": 18000},
              {"Price": 118.7, "Size": 13000},
              {"Price": 118.8, "Size": 8000},
              {"Price": 119, "Size": 45000}
              ],
      "Bid": [
              {"Price": 118.5, "Size": 16500},
              {"Price": 118.45, "Size": 11000},
              {"Price": 118.4, "Size": 14200},
              {"Price": 118.2, "Size": 19000},
              {"Price": 118, "Size": 50000}
    ]}

## Working with streams

You can create new streams either manually in the user interface or by using the <g:link controller="help" action="api">API</g:link>. Each stream is identified by a unique ID. There’s no technical limit on the total number of streams.

If you want to create a stream manually, go to the <kbd>Streams</kbd> tab.  There’s a button which looks like this:

<r:img plugin="unifina-core" dir="images/user-guide" file="create-stream-button.png" class="img-responsive" />

A click takes you to a dialog where you’ll fill in the stream name and an optional description.

<r:img plugin="unifina-core" dir="images/user-guide" file="create-stream-dialog.png" class="img-responsive center-block" />

A new stream is created when you click the **Next** button.  You’ll be shown a stream view that includes the stream details (the name and description), API credentials, configured fields (there won’t be any yet), and a summary of stream history (there will be none yet). 

<r:img plugin="unifina-core" id="stream-view-image" dir="images/user-guide" file="my-first-stream-view.png" class="img-responsive center-block" />

If you want to delete a stream, first click on its name, and then click on the **Delete stream** button. You’ll be asked to confirm that you really want to go ahead. You can also delete a stream using the <g:link controller="help" action="api">stream API</g:link>.

In order to read the stream from external applications using the HTTP API, you need to create <strong>Anonymous keys</strong> not bound to specific Streamr user. This way you can grant (and revoke) external applications and users the access to your stream. Choose a descriptive <strong>Key name</strong> (e.g. name of the external application, client, or customer you want to grant the access), select <strong>can read</strong> from the dropdown, and hit <strong>+</strong>. Copy the key to clipboard by clicking the copy icon. Revoke the access by clicking the trash bin icon.

In order to push data into the stream from external sources using the HTTP API, or let external application push data into your data stream, you need to create an anonymous key with <i>write permissions</i>. Choose a descriptive <strong>Key name</strong> (e.g. name of the external data producer), select <strong>can write</strong> from the dropdown, and hit <strong>+</strong>. For details on how to implement the data sender, see <a href="#pushing-events-section">Pushing events to a stream</a>.

## Editing stream details

If you want to edit stream details, you need to be in the <kbd>Streams</kbd> tab. Click on the stream name, and then click on the **Edit info** button. You'll see a dialog where you can rename a stream or modify its description.

<r:img plugin="unifina-core" dir="images/user-guide" file="edit-stream-dialog.png" class="img-responsive center-block" />

The stream view also includes the option of configuring the data fields.  If you’ll load real-time data through the API, you’ll need to configure the data fields now.  If you’ll first load historical data from a text file, you can skip this step.  We’ll be in many cases able to to autodetect the field types from the input.

If you want to configure the data fields manually, the Configure Fields button takes you to a setup dialog.  To add a new data field, click on the **+ Add Field** button, give the field a name and change the field type as appropriate.  Remember to save the changes when done.

<r:img plugin="unifina-core" dir="images/user-guide" file="configure-fields-dialog.png" class="img-responsive center-block" />

You can also rename a stream, edit the description, add data fields and specify the field types using the [API](${createLink(controller:"help", action:"api")}).

## Uploading historical data

Batches of historical events can be loaded into a stream by importing a CSV file. You need to be in the <kbd>Streams</kbd> tab to do this. When you click on an existing stream, you’ll see a History panel and a data drop.  This is where you can drop a text file with a batch of event history.

<r:img plugin="unifina-core" dir="images/user-guide" file="csv-data-drop.png" class="img-responsive center-block" />

You can also pick a local file for import by manually by clicking on the data drop.  Either way, Streamr will parse the given CSV file and load the events into the stream.

As to the format, the CSV file should have the column names on the first row, and use either a comma or a semicolon as the separator.  One of the columns should be a timestamp, where the recommended format is either `"yyyy-MM-dd HH:mm:ss"` or `"yyyy-MM-dd HH:mm:ss.SSS”`.  Timestamps must be in a chronological order with earlier events first and the recent events last.

If Streamr cannot find the event timestamps or doesn’t understand the timestamp format, you will see a dialog box like the one below.  This is where you can manually select the timestamp column and specify the format.

<r:img plugin="unifina-core" dir="images/user-guide" file="csv-field-dialog.png" class="img-responsive center-block" />

We’ll do our best to make sense of the data columns in the CSV file, but the autodetection of field types will not always work.  For instance, a column of telephone numbers may be interpreted as numbers even if you’d probably want to import them as strings.  In such cases, you’ll need to configure the fields manually as shown above.  Mind you, making changes that don’t make sense will cause runtime exceptions due to incompatible data types.

Let’s go ahead and upload some sample data.  We’ll import a text file which contains a collection of recent tweets found with the keywords `“augmented intelligence”`.  This is what the sample tweet data looks like, as at the time of writing, with only four columns and a subset of rows shown:

<r:img plugin="unifina-core" dir="images/user-guide" file="sample-twitter-data.png" class="img-responsive center-block" />

The data file is called `“SampleTweets.csv”`, and you can download the latest version to your desktop from this [link](“SampleTweets.csv”). 

If you drag the the sample file to the data drop, the events are uploaded to the stream.  Once the process is complete, the stream view is updated to show the extent of the archived history. 

<r:img plugin="unifina-core" dir="images/user-guide" file="twitter-stream-view.png" class="img-responsive center-block" />

## Built-in data types

There’s a number of built-in data types that can be used in a stream. These are the following:

Number
:   A numeric data type internally stored as a double precision (64-bit) float.

Boolean
:   A logical data type with two possible values, True and False.

String
:   A sequence of zero or more alphabetical characters.

Map
:   A collection of key-value pairs.

List
:   An ordered collection of zero or more elements.

Map is the same as a dictionary or an associative array found in a number of programming languages. Each key is a string, and the value can be of any built-in data type (even a Map again).

Data types can be freely mixed in one event. And you can freely add new fields to an existing stream; you don’t have to know what fields you might eventually need. A single event can be of any size within reason, and a stream can grow indefinitely when extended by new events. 

There is no theoretical limitation as to the format or type of data in Streamr. Anything which can be expressed in digital form is fair game. It is perfectly possible to create streams which contain digital images, streaming video, or other domain-specific data. If your use case takes you beyond the built-in data types, come and talk to us about what you have in mind.

<a id="pushing-events-section"></a>
## Pushing events to a stream

Streamr has a simple <g:link controller="help" action="api">API</g:link> which allows you to push events in JSON format to a stream. The events are immediately delivered to subscribers of the stream, including canvases which use the stream as well as any external applications listening to the stream via the API.

You can push events to a stream from any programming language, and there are also convenient client libraries for some languages. For details and usage examples please see the <g:link controller="help" action="api">API documentation</g:link>.

Instead of using the API, you can produce events to streams on a canvas using the SendToStream module. This is highly useful when you refine data using a canvas and want to produce the results to another stream.

## Subscribing to a stream

Subscribing to streams in order to use the data on canvases is trivially easy: just add the stream to a canvas. As a simple taster of how this works, here's a stream of social media messages connected to a **Table** module.

<r:img plugin="unifina-core" dir="images/user-guide" file="twitter-stream-with-table.png" class="img-responsive center-block" />

You can also subscribe to a stream in any external application via our [API](${createLink(controller:'help', action:'api')}).
