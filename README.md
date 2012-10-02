nodejs-cassandra-load-test is a NodeJS project built to help test Cassandra cluster capacity using CQL.

#Project Description

This project allows you to push a high volume of writes against a Cassandra cluster and determine the max thruput. This test may be run in parallel on multiple NodeJS machines to achieve maximum concurrency across your cluster.

Statistics are reported at a configurable interval (default 1 second) and the test runs for a configurable duration.

#Cassandra Setup
For the default test use the _cassandra-cli_ client to set up the following keyspace and column family. First connect to your instance:

    connect localhost/9160;

Next create a keyspace. Assuming you are starting with your localhost, replication_factor is 1, however if you want to test a real Cassandra cluster you will want to increase this to two or more.

    create keyspace loadstore with placement_strategy = 'SimpleStrategy' and strategy_options={replication_factor:1}; 

Use the keyspace we just created.

    use loadstore;

Create a column family to insert data into. This column family is using a date as the name of the column and a byte array as the contents for a row identified by an integer.

    create column family time_series_cf
      with column_type = 'Standard'
      and comparator = 'DateType'
      and default_validation_class = 'BytesType'
      and key_validation_class = 'Int32Type';

Thats it, now you are ready to insert. If you want to check your setup, run this in _Cassandra CQL_ client:

    UPDATE time_series_cf SET '2012-9-2 15:54:5' = '35' WHERE KEY = '32'

#NodeJS
##nodejs-cassandra-load-test configuration
All of the configuration options are available in config.js. The only other file you may need to modify is myQuery.js which accepts a uniqueId on instantiation and returns a query and an array of parameters necessary to execute that query. You are free to refactor this file to match your existing schema.

##limitations
The Cassandra driver for NodeJS only supports CQL v2 at this time. This means that you will have some troubles with composite keys and other CQL 3 features.

##Running
When you are configured and ready to run, simply go to the directory you have this content and run:

   node app.js